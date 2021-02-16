import { Manifest, RegistryResponse } from './types';

import { promises as fs } from 'fs';
import got from 'got';
import { red } from 'chalk';

export const NPM_REGISTRY_RE = /https?:\/\/registry\.npmjs\.org/g;

export function trimString(str: string, char: string = ' '): string {
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
    console.error(red(`Error: could not read '${path}'`));
    process.exit(-1);
  }
}
