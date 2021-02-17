#!/usr/bin/env node

import * as yargs from 'yargs';

import { traitFiles } from './trait';
import { trimString } from './utils';

const options = yargs
  .usage('swap-lock-registry -u https://registry.npmjs.com [lock-files...]')
  .option('u', {
    alias: 'url',
    describe: 'The registry url',
    type: 'string',
    demandOption: true,
  })
  .option('i', {
    alias: 'ignore',
    describe: 'List of package names patterns to ignore, ex: @types/*,lodash*',
    type: 'string',
    demandOption: false,
    default: '',
  })
  .option('y', {
    alias: 'yarn',
    describe: 'Whether the files are Yarn lock files',
    type: 'boolean',
    demandOption: false,
    default: false,
  })
  .option('p', {
    alias: 'parallel',
    describe: 'Whether the trait the files in parallel.',
    type: 'boolean',
    demandOption: false,
    default: false,
  }).argv;

traitFiles(options._ as string[], {
  url: trimString(options.u, '/'),
  ignore: options.i
    .split(',')
    .map((str) => new RegExp(`^${str.replace(/\*/g, '.*')}$`, 'g')),
  yarn: options.y,
  parallel: options.p,
});
