import { parseNpmLockFile } from '../src/npm';

describe('parseNpmLockFile', () => {
  it('should parse a valid package-lock.json file', async () => {
    expect(await parseNpmLockFile('tests/files/valid-npm.json')).toEqual({
      name: 'temp',
      version: '1.0.0',
      lockfileVersion: 2,
      requires: true,
      packages: {
        '': {
          version: '1.0.0',
          license: 'ISC',
          dependencies: {
            'sweet-collections': '^1.0.3',
          },
        },
        'node_modules/sweet-collections': {
          version: '1.0.3',
          resolved:
            'https://registry.npmjs.org/sweet-collections/-/sweet-collections-1.0.3.tgz',
          integrity:
            'sha512-0P8qpGQJE32fHDKXSYu6abF+c4zAPvuEJZ3W3tYpkpIbUawbvYZq5PpaXFafWtKb9HgnMG2kxFWgdFdwqXzE8A==',
        },
      },
      dependencies: {
        'sweet-collections': {
          version: '1.0.3',
          resolved:
            'https://registry.npmjs.org/sweet-collections/-/sweet-collections-1.0.3.tgz',
          integrity:
            'sha512-0P8qpGQJE32fHDKXSYu6abF+c4zAPvuEJZ3W3tYpkpIbUawbvYZq5PpaXFafWtKb9HgnMG2kxFWgdFdwqXzE8A==',
        },
      },
    });
  });

  it('should fail for an invalid yarn.lock file', async () => {
    try {
      await parseNpmLockFile('tests/files/invalid-npm.json');
    } catch (error) {
      expect(error.message).toBe(
        "Could not parse 'tests/files/invalid-npm.json'!",
      );
    }
  });
});
