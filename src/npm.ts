import { readFile, traitPackage, TraitPackageOptions } from './utils';
import { promises as fs } from 'fs';
import { logger } from './logger';
import { TraitOptions } from './types';

export async function traitNpmLockFile(
  lockFile: string,
  opts: TraitOptions,
): Promise<void> {
  const lockFileObject = await parseNpmLockFile(lockFile);

  try {
    await Promise.all(
      Object.keys(lockFileObject.packages ?? {})
        .filter((pkg) => !!pkg)
        .map(async (pkg) => {
          await traitPackage(
            lockFileObject.packages,
            pkg,
            pkg.replace(/^.*node_modules\//g, ''),
            lockFileObject.packages[pkg].from ??
              lockFileObject.packages[pkg].version,
            {
              ...opts,
              lockFile,
            },
          );
        }),
    );

    await processDependencies(lockFileObject.dependencies, {
      ...opts,
      lockFile,
    });

    await fs.writeFile(
      lockFile,
      JSON.stringify(lockFileObject, null, 2) + '\n',
    );

    logger.clearLine();
    logger.success(lockFile, 'done');
  } catch (error) {
    console.log(error);
    throw new Error(
      'Error while fetching packages metadata, please check the registry url',
    );
  }
}

export async function processDependencies(
  dependencies: any,
  opts: TraitPackageOptions,
): Promise<void> {
  if (!dependencies) return;

  await Promise.all(
    Object.keys(dependencies)
      .filter((pkg) => !!pkg)
      .map(async (pkg) => {
        await traitPackage(
          dependencies,
          pkg,
          pkg,
          dependencies[pkg].from ?? dependencies[pkg].version,
          opts,
        );

        await processDependencies(dependencies[pkg].dependencies, opts);
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
