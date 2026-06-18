import { parseHeadingNotation } from './heading-notation';

describe('parseHeadingNotation', () => {
  it('returns a single text segment for plain copy', () => {
    expect(parseHeadingNotation('See how teams build')).toEqual([
      { kind: 'text', text: 'See how teams build' },
    ]);
  });

  it('marks *spans* as accent segments', () => {
    expect(parseHeadingNotation('See how teams *build on Twenty*')).toEqual([
      { kind: 'text', text: 'See how teams ' },
      { kind: 'accent', text: 'build on Twenty' },
    ]);
  });

  it('keeps newlines as breaks while collapsing other whitespace', () => {
    expect(parseHeadingNotation('a \t b\nc')).toEqual([
      { kind: 'text', text: 'a b' },
      { kind: 'break' },
      { kind: 'text', text: 'c' },
    ]);
  });

  it('supports multiple accents', () => {
    expect(parseHeadingNotation('*A CRM* for teams that *move fast*')).toEqual([
      { kind: 'accent', text: 'A CRM' },
      { kind: 'text', text: ' for teams that ' },
      { kind: 'accent', text: 'move fast' },
    ]);
  });

  it('treats an unbalanced trailing asterisk as opening an accent to the end', () => {
    expect(parseHeadingNotation('plain *rest')).toEqual([
      { kind: 'text', text: 'plain ' },
      { kind: 'accent', text: 'rest' },
    ]);
  });

  it('ignores empty accent markers', () => {
    expect(parseHeadingNotation('a**b')).toEqual([
      { kind: 'text', text: 'a' },
      { kind: 'text', text: 'b' },
    ]);
  });

  it('should keep a message-authored newline as a break segment', () => {
    expect(parseHeadingNotation('Simple\n*Pricing*')).toEqual([
      { kind: 'text', text: 'Simple' },
      { kind: 'break' },
      { kind: 'accent', text: 'Pricing' },
    ]);
  });

  it('should still normalize ordinary whitespace runs to single spaces', () => {
    expect(parseHeadingNotation('a   b')).toEqual([
      { kind: 'text', text: 'a b' },
    ]);
  });
});
