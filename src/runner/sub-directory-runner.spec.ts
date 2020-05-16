import { expect } from 'chai';
import { SubDirectoryRunner } from './sub-directory-runner';
import { Rsd } from '../rsd';
import Sinon from 'sinon';

describe('SubDirectoryRunner', () => {
  describe('isRunnable', () => {
    it('should return true when there is a valid command', () => {
      const runner = new SubDirectoryRunner(new Rsd([ 'foo', 'bar' ]));

      expect(runner.isRunnable()).to.be.true;
    });

    it('should return false when there is no command', () => {
      const runner = new SubDirectoryRunner(new Rsd([]));

      expect(runner.isRunnable()).to.be.false;
    });

    it('should return false when there is no valid command', () => {
      const runner = new SubDirectoryRunner(new Rsd([ ':foo' ]));

      expect(runner.isRunnable()).to.be.false;
    });
  });

  describe('run', () => {
    const sandbox = Sinon.createSandbox();
    let stubWrite: Sinon.SinonStub;
    let shell: string | undefined;
    let workingDirectory: string;
    let writed: string = '';

    beforeEach(function () {
      stubWrite = sandbox.stub(process.stdout, 'write');
      stubWrite.callsFake(
        (str: string | Uint8Array, encoding?: string | undefined, cb?: ((err?: Error | undefined) => void) | undefined): boolean => {
          writed += str;

          return true;
        });
      shell = process.env.SHELL;
      process.env.SHELL = 'env -i PS1=\$ /bin/bash --noprofile --norc';
      workingDirectory = process.cwd();
      process.chdir(workingDirectory + '/fixtures');
    });

    afterEach(function () {
      sandbox.restore();
      process.env.SHELL = shell;
      process.chdir(workingDirectory);
      writed = '';
    });

    it('should execute command with success', async () => {
      const runner = new SubDirectoryRunner(
        new Rsd([ 'ls', '-1' ])
      );

      await runner.run();
      expect(writed.split('\n')).to.be.deep.equal([
        '$ ls -1\r',
        'bar.txt\r',
        '',
        '$ ls -1\r',
        'foo.txt\r',
        'foobar.txt\r',
        '',
        '',
        '\u001b[35m───────────────────────────\u001b[39m',
        '',
        '\u001b[1m\u001b[95mExecuted in 2 directories :\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[32m✔\u001b[39m\u001b[22m\u001b[1m\u001b[35m bar\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[32m✔\u001b[39m\u001b[22m\u001b[1m\u001b[35m foo\u001b[39m\u001b[22m',
        '',
        ''
      ]);
    });

    it('should execute command with fail', async () => {
      const runner = new SubDirectoryRunner(
        new Rsd([ 'foo' ])
      );

      await runner.run();
      expect(writed.split('\n')).to.be.deep.equal([
        '$ foo\r',
        'bash: foo: command not found\r',
        '',
        '$ foo\r',
        'bash: foo: command not found\r',
        '',
        '',
        '\u001b[35m───────────────────────────\u001b[39m',
        '',
        '\u001b[1m\u001b[95mExecuted in 2 directories :\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[31m✕\u001b[39m\u001b[22m\u001b[1m\u001b[35m bar\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[31m✕\u001b[39m\u001b[22m\u001b[1m\u001b[35m foo\u001b[39m\u001b[22m',
        '',
        ''
      ]);
    });

    it('should execute command with success and fail', async () => {
      const runner = new SubDirectoryRunner(
        new Rsd([ 'ls', '-1', 'foo*.txt' ])
      );

      await runner.run();
      expect(writed.split('\n')).to.be.deep.equal([
        '$ ls -1 foo*.txt\r',
        'ls: cannot access \'foo*.txt\': No such file or directory\r',
        '',
        '$ ls -1 foo*.txt\r',
        'foo.txt\r',
        'foobar.txt\r',
        '',
        '',
        '\u001b[35m───────────────────────────\u001b[39m',
        '',
        '\u001b[1m\u001b[95mExecuted in 2 directories :\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[31m✕\u001b[39m\u001b[22m\u001b[1m\u001b[35m bar\u001b[39m\u001b[22m',
        '  \u001b[1m\u001b[32m✔\u001b[39m\u001b[22m\u001b[1m\u001b[35m foo\u001b[39m\u001b[22m',
        '',
        '',
      ]);
    });
  })
});