import { NPM_REGISTRY_RE, fetchPackageFromRegistry, readFile } from './utils';

import { fromHex } from 'ssri';
import { promises as fs } from 'fs';
import { logger } from './logger';

export async function traitNPMLockFile(
  lockFile: string,
  url: string,
): Promise<void> {
  const lockFileObject = await parseNpmLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject.packages)
        .filter((pkg) => !!pkg)
        .map(async (pkg) => {
          const name = pkg.replace(/^.*node_modules\//g, '');
          const version = lockFileObject.packages[pkg].version;

          const newPackage = await fetchPackageFromRegistry(url, name, version);
          let { tarball, shasum, integrity } = newPackage.dist;

          if (!url.match(NPM_REGISTRY_RE) && tarball.match(NPM_REGISTRY_RE)) {
            tarball = tarball.replace(NPM_REGISTRY_RE, url);
          }

          lockFileObject.packages[pkg].resolved = tarball;
          lockFileObject.packages[pkg].integrity =
            integrity ?? fromHex(shasum, 'sha1').toString();

          logger.progress(lockFile, `${name}@${version}`);
        }),
    );

    await processDependencies(lockFile, url, lockFileObject.dependencies);

    await fs.writeFile(
      lockFile,
      JSON.stringify(lockFileObject, null, 2) + '\n',
    );

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

async function processDependencies(
  lockFile: string,
  url: string,
  dependencies?: any,
): Promise<void> {
  if (!dependencies) return;

  await Promise.all(
    Object.keys(dependencies)
      .filter((pkg) => !!pkg)
      .map(async (pkg) => {
        const version = dependencies[pkg].version;

        const newPackage = await fetchPackageFromRegistry(url, pkg, version);
        let { tarball, shasum, integrity } = newPackage.dist;

        if (!url.match(NPM_REGISTRY_RE) && tarball.match(NPM_REGISTRY_RE)) {
          tarball = tarball.replace(NPM_REGISTRY_RE, url);
        }

        dependencies[pkg].resolved = tarball;
        dependencies[pkg].integrity =
          integrity ?? fromHex(shasum, 'sha1').toString();

        logger.progress(lockFile, `${pkg}@${version}`);

        await processDependencies(url, dependencies[pkg].dependencies);
      }),
  );
}

async function parseNpmLockFile(lockFile: string): Promise<any> {
  const lockFileString = await readFile(lockFile);
  try {
    return JSON.parse(lockFileString);
  } catch (error) {
    logger.error(lockFile, 'Error: could not parse package-lock.json!');
    process.exit(-1);
  }
}
