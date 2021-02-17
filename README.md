# swap-lock-registry

[![npm version](https://badge.fury.io/js/swap-lock-registry.svg)](https://badge.fury.io/js/swap-lock-registry)

A CLI tool to swap the registry URL in the lock file without having to remove it.

Ex: `swap-lock-registry --yarn --parallel --url https://registry.npmjs.com server/yarn.lock client/yarn.lock`

## Install

You can run
```shell
npm install -g swap-lock-registry
```
or
```shell
yarn add global swap-lock-registry
```

## Usage

```
swap-lock-registry -u https://registry.npmjs.com [lock-files...]

Options:
      --help      Show help                                                                      [boolean]
      --version   Show version number                                                            [boolean]
  -u, --url       The registry url                                                     [string] [required]
  -i, --ignore    List of package name patterns to ignore, ex: @types/*,lodash*    [string] [default: ""]
  -y, --yarn      Whether the files are Yarn lock files                         [boolean] [default: false]
  -p, --parallel  Whether the trait the files in parallel.                      [boolean] [default: false]
```
