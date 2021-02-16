import { NPM_REGISTRY_RE, fetchPackageFromRegistry, readFile } from './utils';
import { parse, stringify } from '@yarnpkg/lockfile';

import { fromHex } from 'ssri';
import { promises as fs } from 'fs';
import { logger } from './logger';

export async function traitYarnLockFile(
  lockFile: string,
  url: string,
): Promise<void> {
  const lockFileObject = await parseYarnLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject).map(async (pkg) => {
        const name = pkg.replace(/@[^@]*$/g, '');
        const version = lockFileObject[pkg].version;

        const newPackage = await fetchPackageFromRegistry(url, name, version);
        let { tarball, shasum, integrity } = newPackage.dist;

        if (!url.match(NPM_REGISTRY_RE) && tarball.match(NPM_REGISTRY_RE)) {
          tarball = tarball.replace(NPM_REGISTRY_RE, url);
        }

        lockFileObject[pkg].resolved = `${tarball}#${shasum}`;
        lockFileObject[pkg].integrity =
          integrity ?? fromHex(shasum, 'sha1').toString();

        logger.progress(lockFile, `${name}@${version}`);
      }),
    );

    await fs.writeFile(lockFile, stringify(lockFileObject));

    logger.clearLine();
    logger.success(lockFile, 'done');
  } catch (error) {
    logger.error(
      lockFile,
      'Error while fetching packages metadata, please check the registry url',
    );
    process.exit(-1);
  }
}

async function parseYarnLockFile(lockFile: string): Promise<any> {
  const lockFileString = await readFile(lockFile);
  try {
    return parse(lockFileString).object;
  } catch (error) {
    logger.error(lockFile, 'Error: could not parse yarn.lock!');
    process.exit(-1);
  }
}
