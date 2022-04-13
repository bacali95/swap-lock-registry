import { readFile, traitPackage } from './utils';
import { parse, stringify } from '@yarnpkg/lockfile';
import { promises as fs } from 'fs';
import { logger } from './logger';
import { TraitOptions } from './types';

export async function traitYarnLockFile(
  lockFile: string,
  opts: TraitOptions,
): Promise<void> {
  const lockFileObject = await parseYarnLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject).map((pkg) => {
        return traitPackage(
          lockFileObject,
          pkg,
          pkg.startsWith('@')
            ? `@${pkg.substr(1).replace(/@[^@]*/g, '')}`
            : pkg.replace(/@[^@]*/g, ''),
          pkg.replace(/^@?[^@]*@/g, ''),
          {
            ...opts,
            lockFile,
            tarballWithShaSum: true,
          },
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
