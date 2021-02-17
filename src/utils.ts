import { Manifest, RegistryResponse } from './types';

import { promises as fs } from 'fs';
import got from 'got';
import { fromHex } from 'ssri';
import { logger } from './logger';

export const NPM_REGISTRY_RE = /https?:\/\/registry\.npmjs\.org/g;

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

export async function traitPackage(
  obj: any,
  pkg: string,
  lockFile: string,
  url: string,
  ignore: RegExp[],
  nameRegex?: RegExp,
  tarballWithShaSum = false,
): Promise<void> {
  const name = nameRegex ? pkg.replace(nameRegex, '') : pkg;

  if (
    !(obj[pkg].resolved && obj[pkg].integrity) ||
    ignore.some((reg) => name.match(reg))
  ) {
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
