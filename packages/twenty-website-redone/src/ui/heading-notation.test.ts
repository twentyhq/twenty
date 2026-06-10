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

  it('turns newlines into break segments', () => {
    expect(parseHeadingNotation('See how teams\nbuild *on Twenty*')).toEqual([
      { kind: 'text', text: 'See how teams' },
      { kind: 'break' },
      { kind: 'text', text: 'build ' },
      { kind: 'accent', text: 'on Twenty' },
    ]);
  });

  it('supports accents around line breaks and multiple accents', () => {
    expect(parseHeadingNotation('*A CRM* for teams\nthat *move fast*')).toEqual(
      [
        { kind: 'accent', text: 'A CRM' },
        { kind: 'text', text: ' for teams' },
        { kind: 'break' },
        { kind: 'text', text: 'that ' },
        { kind: 'accent', text: 'move fast' },
      ],
    );
  });

  it('treats an unbalanced trailing asterisk as opening an accent to end of line', () => {
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
});
