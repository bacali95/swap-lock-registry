import { TraitOptions } from './types';
import { traitNpmLockFile } from './npm';
import { traitYarnLockFile } from './yarn';
import { logger } from './logger';

export async function traitFiles(
  lockFiles: string[],
  options: TraitOptions,
): Promise<void> {
  if (options.parallel) {
    await Promise.all(
      lockFiles.map((file) =>
        (options.yarn ? traitYarnLockFile : traitNpmLockFile)(
          file,
          options.url,
          options.ignore,
        ).catch((error) => logger.error(file, error.message)),
      ),
    );
  } else {
    for (const file of lockFiles) {
      await (options.yarn ? traitYarnLockFile : traitNpmLockFile)(
        file,
        options.url,
        options.ignore,
      ).catch((error) => logger.error(file, error.message));
    }
  }
}
