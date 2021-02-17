import { readFile, traitPackage } from './utils';
import { parse, stringify } from '@yarnpkg/lockfile';
import { promises as fs } from 'fs';
import { logger } from './logger';

export async function traitYarnLockFile(
  lockFile: string,
  url: string,
  ignore: RegExp[],
): Promise<void> {
  const lockFileObject = await parseYarnLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject).map((pkg) => {
        return traitPackage(
          lockFileObject,
          pkg,
          lockFile,
          url,
          ignore,
          /@[^@]*$/g,
          true,
        );
      }),
    );

    await fs.writeFile(lockFile, stringify(lockFileObject));

    logger.clearLine();
    logger.success(lockFile, 'done');
  } catch (error) {
    throw new Error(
      'Error while fetching packages metadata, please check the registry url',
    );
  }
}

export async function parseYarnLockFile(lockFile: string): Promise<any> {
  const lockFileString = await readFile(lockFile);
  try {
    return parse(lockFileString).object;
  } catch (error) {
    throw new Error(`Could not parse '${lockFile}'!`);
  }
}
