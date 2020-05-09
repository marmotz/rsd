import { expect } from 'chai';

import { Cop } from './cop';
import { OptionType } from './option';

describe('Cop', () => {
  describe('Option', () => {
    it('should create an option with default values', () => {
      const cop = new Cop();
      expect(cop.option('foo', { flags: [] })).to.be.equal(cop);
      expect(cop.options).to.be.deep.equal({
        foo: {
          type: OptionType.boolean,
          nArgs: 0,
          flags: []
        }
      })
    });
  });

  describe('Parse', () => {
    it('should create argv with process.argv', () => {
      const cop = new Cop();
      cop.parse();
      expect(cop.argv).to.be.deep.equal(process.argv.slice(2));
    });

    it('should create argv with given string', () => {
      const cop = new Cop();
      cop.parse('foo bar');
      expect(cop.argv).to.be.deep.equal([ 'foo', 'bar' ]);
    });

    it('should create argv with given array', () => {
      const cop = new Cop();
      cop.parse([ 'foo', 'bar' ]);
      expect(cop.argv).to.be.deep.equal([ 'foo', 'bar' ]);
    });

    it('should parse unknown option in "_"', () => {
      const cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ]
        })
      ;

      expect(cop.parse('foo')).to.be.deep.equal({
        _: [ 'foo' ]
      });
      expect(cop.parse('bar')).to.be.deep.equal({
        _: [ 'bar' ]
      });
    });

    it('should parse known option in correct key', () => {
      const cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ]
        })
        .option('bar', {
          flags: [ '--bar' ]
        })
      ;

      expect(cop.parse('--foo')).to.be.deep.equal({
        foo: true
      });
      expect(cop.parse('--bar')).to.be.deep.equal({
        bar: true
      });
      expect(cop.parse('--foo --bar')).to.be.deep.equal({
        foo: true,
        bar: true
      });
      expect(cop.parse('--foo bar')).to.be.deep.equal({
        foo: true,
        _: [ 'bar' ]
      });
    });

    it('should parse string option', () => {
      const cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ],
          type: OptionType.string,
          nArgs: 1
        })
      ;

      expect(cop.parse('--foo bar')).to.be.deep.equal({
        foo: 'bar'
      });
      expect(cop.parse('--foo bar --foo foobar')).to.be.deep.equal({
        foo: 'foobar'
      });
    });

    it('should parse array option', () => {
      const cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ],
          type: OptionType.array,
          nArgs: 1
        })
      ;

      expect(cop.parse('--foo bar')).to.be.deep.equal({
        foo: [ 'bar' ]
      });
      expect(cop.parse('--foo foo --foo bar')).to.be.deep.equal({
        foo: [ 'foo', 'bar' ]
      });
      expect(cop.parse('--foo foo --foo bar foobar')).to.be.deep.equal({
        foo: [ 'foo', 'bar' ],
        _: [ 'foobar' ]
      });
    });

    it('should parse conflict option', () => {
      let cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ],
          conflict: [ 'bar' ]
        })
        .option('bar', {
          flags: [ '--bar' ]
        })
      ;

      expect(cop.parse('--foo')).to.be.deep.equal({
        foo: true
      });
      expect(cop.parse('--bar')).to.be.deep.equal({
        bar: true
      });
      expect(() => {
        cop.parse('--foo --bar')
      }).to.throw("You can't use foo and bar options together.");

      cop = new Cop()
        .option('foo', {
          flags: [ '--foo' ]
        })
        .option('bar', {
          flags: [ '--bar' ],
          conflict: [ 'foo' ]
        })
      ;

      expect(cop.parse('--foo')).to.be.deep.equal({
        foo: true
      });
      expect(cop.parse('--bar')).to.be.deep.equal({
        bar: true
      });
      expect(() => {
        cop.parse('--foo --bar')
      }).to.throw("You can't use bar and foo options together.");
    });

    it('should not parse option after first non option arg', () => {
      let cop = new Cop()
        .option('bar', {
          flags: [ '--bar' ]
        })
      ;

      expect(cop.parse('foo --bar')).to.be.deep.equal({
        _: [ 'foo', '--bar' ]
      });
    });
  });
});