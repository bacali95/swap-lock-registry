import { TraitOptions } from './types';
import { traitNPMLockFile } from './npm';
import { traitYarnLockFile } from './yarn';

export async function traitFiles(
  lockFiles: string[],
  options: TraitOptions,
): Promise<void> {
  if (options.parallel) {
    await Promise.all(
      lockFiles.map((file) =>
        (options.yarn ? traitYarnLockFile : traitNPMLockFile)(
          file,
          options.url,
        ),
      ),
    );
  } else {
    for (const file of lockFiles) {
      await (options.yarn ? traitYarnLockFile : traitNPMLockFile)(
        file,
        options.url,
      );
    }
  }
}
