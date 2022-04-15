import { Manifest, RegistryResponse, TraitOptions } from './types';

import { promises as fs } from 'fs';
import got from 'got';
import { fromHex } from 'ssri';
import { logger } from './logger';

const NPM_REGISTRY_RE = /https?:\/\/registry\.npmjs\.org/g;

const IGNORE_REGEX = [
  /^https?:\/\/.*/g,
  /^git.*/g,
  /^[^\/]+\/[^\/]+(#.*)?/g,
  /^file:.*/g,
];
const RESOLVED_IGNORE_REGEX = [/^git.*/g, /^file:.*/g];

export function trimString(str: string, char = ' '): string {
  let i = 0;
  let j = str.length - 1;
  while (i < str.length && str[i] === char) i++;
  while (j >= 0 && str[j] === char) j--;

  return str.substring(i, j + 1);
}

const processedPackages: { [name: string]: RegistryResponse } = {};

export async function fetchPackageFromRegistry(
  url: string,
  name: string,
  version: string,
): Promise<Manifest> {
  processedPackages[name] ??= (
    await got.get<RegistryResponse>(`${url}/${name}`, {
      responseType: 'json',
      retry: 0,
    })
  ).body;
  return processedPackages[name].versions[version];
}

export async function readFile(path: string): Promise<string> {
  try {
    return await fs.readFile(path, 'utf8');
  } catch (error) {
    throw new Error(`Could not read '${path}'!`);
  }
}

export type TraitPackageOptions = TraitOptions & {
  lockFile: string;
  tarballWithShaSum?: boolean;
};

/**
 *
 * @param obj dependencies object
 * @param pkg "node_modules/@babel/code-frame"
 * @param name "@babel/code-frame"
 * @param source package from or version
 * @param opts
 * @returns
 */
export async function traitPackage(
  obj: any,
  pkg: string,
  name: string,
  source: string,
  opts: TraitPackageOptions,
): Promise<void> {
  const { url, lockFile, ignore, tarballWithShaSum, ignoreReplaced } = opts;
  const resolved = obj[pkg]?.resolved;
  if (
    IGNORE_REGEX.some((reg) => source.match(reg)) ||
    RESOLVED_IGNORE_REGEX.some((reg) => resolved?.match(reg)) ||
    ignore.some((reg) => name.match(reg))
  ) {
    logger.warning(lockFile, `Ignoring ${name}@${source}`);
    return;
  }

  // ignore registry is already replaced.
  if (ignoreReplaced && resolved?.startsWith(url)) {
    return;
  }
  const version = obj[pkg].version;
  const newPackage = await fetchPackageFromRegistry(url, name, version);
  const { shasum, integrity } = newPackage.dist;
  let tarball = newPackage.dist.tarball;

  if (!url.match(NPM_REGISTRY_RE) && tarball.match(NPM_REGISTRY_RE)) {
    tarball = tarball.replace(NPM_REGISTRY_RE, url);
  }

  obj[pkg].resolved = tarballWithShaSum ? `${tarball}#${shasum}` : tarball;
  obj[pkg].integrity = integrity ?? fromHex(shasum, 'sha1').toString();

  logger.progress(lockFile, `${name}@${version}`);
}
