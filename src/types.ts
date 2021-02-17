export type TraitOptions = {
  url: string;
  ignore?: RegExp[];
  yarn?: boolean;
  parallel?: boolean;
};

export type Manifest = {
  name: string;
  version: string;
  dist: {
    tarball: string;
    shasum: string;
    integrity?: string;
  };
};

export type RegistryResponse = {
  name: string;
  versions: { [version: string]: Manifest };
};
