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

  // Handlebars only indexed through a segment literal, so `list.0` never
  // resolved and workflows were authored against `list.[0]`
  it('should index arrays only through a segment literal', () => {
    expect(evalFromContext('{{list.[0]}}', context)).toBe('a');
    expect(evalFromContext('{{list.[1].x}}', context)).toBe('x1');
    expect(evalFromContext('{{list.0}}', context)).toBeUndefined();
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

  it('should support literals, as Handlebars path expressions did', () => {
    expect(evalFromContext('{{true}}', context)).toBe(true);
    expect(evalFromContext('{{null}}', context)).toBeNull();
    expect(evalFromContext('{{42}}', context)).toBe(42);
  });
});
