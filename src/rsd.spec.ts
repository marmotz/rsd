import { expect } from 'chai';

import { Rsd } from './rsd';
import { Options } from './options';
import { SubDirectoryRunner } from './runner/sub-directory-runner';
import { InteractiveRunner } from './runner/interactive-runner';
import { InternalCommandsRunner } from './runner/internal-commands-runner';

describe('RSD', () => {
  describe('Constructor', () => {
    it('should create rsd instance with default values', () => {
      const rsd = new Rsd([]);

      expect(rsd.options).to.be.instanceOf(Options);
      expect(rsd.options.command).to.be.equal('');
      expect(rsd.options.excludeDirs).to.be.deep.equal([]);
      expect(rsd.options.includeDirs).to.be.equal(undefined);
    });
  });

  describe('getRunner', () => {
    it('should return SubDirectoryRunner when command is given', () => {
      const rsd = new Rsd();

      expect(rsd.getRunner('foo bar')).to.be.instanceOf(SubDirectoryRunner);
    });

    it('should return InteractiveRunner when no command is given', () => {
      const rsd = new Rsd();

      expect(rsd.getRunner('')).to.be.instanceOf(InteractiveRunner);
    });

    it('should return InternalCommandsRunner when internal command is given', () => {
      const rsd = new Rsd();

      expect(rsd.getRunner(':help')).to.be.instanceOf(InternalCommandsRunner);
    });
  });
});