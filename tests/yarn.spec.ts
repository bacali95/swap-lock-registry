import { parseYarnLockFile } from '../src/yarn';

describe('parseYarnLockFile', () => {
  it('should parse a valid yarn.lock file', async () => {
    expect(await parseYarnLockFile('tests/files/valid-yarn.lock')).toEqual({
      'sweet-collections@^1.0.3': {
        integrity:
          'sha512-0P8qpGQJE32fHDKXSYu6abF+c4zAPvuEJZ3W3tYpkpIbUawbvYZq5PpaXFafWtKb9HgnMG2kxFWgdFdwqXzE8A==',
        resolved:
          'https://registry.yarnpkg.com/sweet-collections/-/sweet-collections-1.0.3.tgz#838640556f6ab0b9f18a4ccfe0fe9f3384d5e4e4',
        version: '1.0.3',
      },
    });
  });

  it('should fail for an invalid yarn.lock file', async () => {
    try {
      await parseYarnLockFile('tests/files/invalid-yarn.lock');
    } catch (error) {
      expect(error.message).toBe(
        "Could not parse 'tests/files/invalid-yarn.lock'!",
      );
    }
  });
});
