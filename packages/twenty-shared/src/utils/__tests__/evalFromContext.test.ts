import { evalFromContext } from '../evalFromContext';

describe('evalFromContext', () => {
  const context = {
    user: { name: 'John Doe', age: 30 },
    step: {
      'key with space': 'spaced',
      'key.with.dots': 'dotted',
      '0': 'zero',
    },
    list: ['a', { x: 'x1' }],
    nullValue: null,
    nested: { child: null },
    date: new Date('2020-01-02T03:04:05.000Z'),
    notANumber: NaN,
    fn: () => 1,
    text: 'hi',
  };

  it('should resolve a dotted path', () => {
    expect(evalFromContext('{{user.name}}', context)).toBe('John Doe');
  });

  it('should preserve primitive types rather than stringifying them', () => {
    expect(evalFromContext('{{user.age}}', context)).toBe(30);
    expect(evalFromContext('{{nullValue}}', context)).toBeNull();
  });

  it('should return undefined for a path that does not resolve', () => {
    expect(evalFromContext('{{user.email}}', context)).toBeUndefined();
    expect(evalFromContext('{{missing.deep.path}}', context)).toBeUndefined();
  });

  it('should resolve segment literals containing spaces or dots', () => {
    expect(evalFromContext('{{step.[key with space]}}', context)).toBe(
      'spaced',
    );
    expect(evalFromContext('{{step.[key.with.dots]}}', context)).toBe('dotted');
  });

  // A path ending in a number or a keyword read it as a value rather than a
  // key, so it never resolved; mid-path the same segment is an ordinary key
  it('should reject a trailing bare number but index through it mid-path', () => {
    expect(evalFromContext('{{list.[0]}}', context)).toBe('a');
    expect(evalFromContext('{{list.[1].x}}', context)).toBe('x1');
    expect(evalFromContext('{{list.0}}', context)).toBeUndefined();
    expect(evalFromContext('{{list.1.x}}', context)).toBe('x1');
    expect(evalFromContext('{{list.0.length}}', context)).toBe(1);
  });

  // Handlebars compiled each hop as `x != null ? x.key : x`, so walking through
  // a null yields that null rather than undefined
  it('should short-circuit to the nullish container it walks through', () => {
    expect(evalFromContext('{{nested.child.whatever}}', context)).toBeNull();
  });

  it('should deny prototype access', () => {
    expect(evalFromContext('{{text.toString}}', context)).toBeUndefined();
    expect(evalFromContext('{{text.constructor}}', context)).toBeUndefined();
    expect(evalFromContext('{{user.__proto__}}', context)).toBeUndefined();
    expect(evalFromContext('{{user.hasOwnProperty}}', context)).toBeUndefined();
  });

  it('should still read own properties that live on built-ins', () => {
    expect(evalFromContext('{{text.length}}', context)).toBe(2);
    expect(evalFromContext('{{list.length}}', context)).toBe(2);
  });

  // The value is JSON round-tripped, which is what the Handlebars `json` helper
  // plus JSON.parse did, so these coercions are part of the contract
  it('should JSON round-trip the resolved value', () => {
    expect(evalFromContext('{{date}}', context)).toBe(
      '2020-01-02T03:04:05.000Z',
    );
    expect(evalFromContext('{{notANumber}}', context)).toBeNull();
    expect(evalFromContext('{{fn}}', context)).toBeUndefined();
  });

  it('should resolve the whole context for self references', () => {
    expect(evalFromContext('{{this}}', context)).toEqual(
      JSON.parse(JSON.stringify(context)),
    );
    expect(evalFromContext('{{.}}', context)).toEqual(
      JSON.parse(JSON.stringify(context)),
    );
  });

  it('should ignore extra params, which were Handlebars helper arguments', () => {
    expect(evalFromContext('{{user.name ignored}}', context)).toBe('John Doe');
    expect(evalFromContext('{{step.[key with space] ignored}}', context)).toBe(
      'spaced',
    );
  });

  it('should return undefined for an empty or malformed expression', () => {
    expect(evalFromContext('{{}}', context)).toBeUndefined();
    expect(evalFromContext('{{ }}', context)).toBeUndefined();
    expect(evalFromContext('{{step.[unclosed}}', context)).toBeUndefined();
    expect(evalFromContext('not a token', context)).toBeUndefined();
  });

  // `@root.` was a data lookup in Handlebars and compiled to a different guard
  // from a bare path, so these two families are pinned separately
  describe('context-prefixed paths', () => {
    const prefixContext = {
      zero: 0,
      emptyString: '',
      truthy: 'hi',
      obj: { p: 1 },
    };

    it('should resolve a path rooted at the context', () => {
      expect(evalFromContext('{{@root.obj.p}}', prefixContext)).toBe(1);
      expect(evalFromContext('{{./obj.p}}', prefixContext)).toBe(1);
      expect(evalFromContext('{{this.obj.p}}', prefixContext)).toBe(1);
    });

    // The guard is a plain truthiness test, so NaN short-circuits like any other
    // falsy value and JSON round-trips to null
    it('should short-circuit an @root path on NaN', () => {
      expect(
        evalFromContext('{{@root.notANumber.missing}}', { notANumber: NaN }),
      ).toBeNull();
    });

    it('should short-circuit an @root path on a falsy value', () => {
      expect(evalFromContext('{{@root.zero.missing}}', prefixContext)).toBe(0);
      expect(
        evalFromContext('{{@root.emptyString.missing}}', prefixContext),
      ).toBe('');
      expect(
        evalFromContext('{{@root.truthy.missing}}', prefixContext),
      ).toBeUndefined();
    });

    it('should short-circuit a bare path only on a nullish value', () => {
      expect(
        evalFromContext('{{zero.missing}}', prefixContext),
      ).toBeUndefined();
      expect(
        evalFromContext('{{this.zero.missing}}', prefixContext),
      ).toBeUndefined();
    });
  });

  // A keyword read as a value rather than a key, which Handlebars only did
  // where a value was expected: the whole expression, or the last segment of a
  // path. Anywhere else it is an ordinary key, so `obj.true.length` resolves
  it('should not resolve a trailing bare keyword segment', () => {
    const keywordContext = { obj: { true: 'T', null: 'N' }, null: { x: 1 } };

    expect(evalFromContext('{{obj.true}}', keywordContext)).toBeUndefined();
    expect(evalFromContext('{{obj.null}}', keywordContext)).toBeUndefined();
    expect(evalFromContext('{{obj.[true]}}', keywordContext)).toBe('T');
    expect(evalFromContext('{{obj.[null]}}', keywordContext)).toBe('N');
    expect(evalFromContext('{{obj.true.length}}', keywordContext)).toBe(1);
    expect(evalFromContext('{{null.x}}', keywordContext)).toBe(1);
    expect(evalFromContext('{{@root.null.x}}', keywordContext)).toBe(1);
  });

  it('should support literals, as Handlebars path expressions did', () => {
    expect(evalFromContext('{{true}}', context)).toBe(true);
    expect(evalFromContext('{{null}}', context)).toBeNull();
    expect(evalFromContext('{{42}}', context)).toBe(42);
  });
});
