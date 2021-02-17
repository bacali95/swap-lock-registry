import { readFile, traitPackage } from './utils';
import { promises as fs } from 'fs';
import { logger } from './logger';

export async function traitNpmLockFile(
  lockFile: string,
  url: string,
  ignore: RegExp[],
): Promise<void> {
  const lockFileObject = await parseNpmLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject.packages ?? {})
        .filter((pkg) => !!pkg)
        .map(async (pkg) => {
          await traitPackage(
            lockFileObject,
            pkg,
            lockFile,
            url,
            ignore,
            /^.*node_modules\//g,
          );
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
    throw new Error(
      'Error while fetching packages metadata, please check the registry url',
    );
  }
}

export async function processDependencies(
  lockFile: string,
  url: string,
  ignore: RegExp[],
  dependencies?: any,
): Promise<void> {
  if (!dependencies) return;

  await Promise.all(
    Object.keys(dependencies)
      .filter((pkg) => !!pkg)
      .map(async (pkg) => {
        await traitPackage(dependencies, pkg, lockFile, url, ignore);

        await processDependencies(
          lockFile,
          url,
          ignore,
          dependencies[pkg].dependencies,
        );
      }),
  );
}

export async function parseNpmLockFile(lockFile: string): Promise<any> {
  const lockFileString = await readFile(lockFile);
  try {
    return JSON.parse(lockFileString);
  } catch (error) {
    throw new Error(`Could not parse ${lockFile}!`);
  }
}
