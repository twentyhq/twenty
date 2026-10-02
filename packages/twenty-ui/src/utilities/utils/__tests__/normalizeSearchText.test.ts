import { normalizeSearchText } from '../normalizeSearchText';

describe('normalizeSearchText', () => {
  it.each([
    { text: 'Hello World', expected: 'hello world' },
    { text: 'MixedCase123', expected: 'mixedcase123' },
  ])('folds case in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each([
    { text: 'café', expected: 'cafe' },
    { text: 'naïve', expected: 'naive' },
    { text: 'résumé', expected: 'resume' },
    { text: 'Zürich', expected: 'zurich' },
    { text: 'Müller', expected: 'muller' },
    { text: 'niño', expected: 'nino' },
    { text: 'España', expected: 'espana' },
    { text: 'São Paulo', expected: 'sao paulo' },
    { text: 'João', expected: 'joao' },
    { text: 'CAFÉ', expected: 'cafe' },
    { text: 'NaÏvE', expected: 'naive' },
    { text: 'ZÜRICH', expected: 'zurich' },
    { text: 'Côte d’Ivoire', expected: 'cote d’ivoire' },
    { text: 'Việt Nam', expected: 'viet nam' },
    { text: 'Åland å', expected: 'aland a' },
    { text: 'e\u0301', expected: 'e' },
    { text: 'A\u0300\u0301', expected: 'a' },
  ])('folds Latin accents in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each([
    { text: 'Straße', expected: 'strasse' },
    { text: 'Œuvre', expected: 'oeuvre' },
    { text: 'Æther', expected: 'aether' },
    { text: 'Łódź', expected: 'lodz' },
    { text: 'Øyvind', expected: 'oyvind' },
    { text: 'Đan Mạch', expected: 'dan mach' },
    { text: 'Kıbrıs', expected: 'kibris' },
    { text: 'Ŋaŋ', expected: 'ngang' },
    { text: 'ÆØÐÞŁŒẞ', expected: 'aeodthloess' },
  ])('folds special Latin letters in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each(['Café', 'CAFE', 'cafe', 'Cafe'])(
    'matches a cafe search in %s',
    (text) => {
      expect(normalizeSearchText(text)).toContain(normalizeSearchText('cafe'));
    },
  );

  it('folds Greek accents', () => {
    expect(normalizeSearchText('Ελλάδα')).toBe('ελλαδα');
  });

  it.each(['ρυθμισεις', 'ΡΥΘΜΙΣΕΙΣ'])(
    'matches the Greek search %s regardless of accents and final sigma',
    (search) => {
      expect(normalizeSearchText('Μετάβαση στις Ρυθμίσεις')).toContain(
        normalizeSearchText(search),
      );
    },
  );

  it.each(['\u0385', '\u1FED', '\u1FEE', '\u1FC1'])(
    'removes the Greek spacing accent %s without moving its mark onto the previous letter',
    (greekSpacingAccent) => {
      expect(normalizeSearchText(`α${greekSpacingAccent}β`)).toBe('αβ');
    },
  );

  it('matches an uppercase Greek search ending with a sigma inside a word', () => {
    expect(normalizeSearchText('Ινδονησία')).toContain(
      normalizeSearchText('ΙΝΔΟΝΗΣ'),
    );
  });

  it('normalizes uppercase and lowercase Greek to the same text', () => {
    expect(normalizeSearchText('ΠΡΩΤΕΪ\u0301ΝΗ')).toBe(
      normalizeSearchText('πρωτεΐνη'),
    );
  });

  it('matches Arabic text written without harakat', () => {
    expect(normalizeSearchText('نهائيًا')).toContain(
      normalizeSearchText('نهائيا'),
    );
  });

  it.each([
    { text: 'أ', expected: 'ا' },
    { text: 'إ', expected: 'ا' },
    { text: 'آ', expected: 'ا' },
    { text: 'أحمد', expected: 'احمد' },
  ])('folds the Arabic hamza form in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it('removes harakat drawn on a tatweel', () => {
    expect(normalizeSearchText('نـَـا')).toBe('نــا');
  });

  it('removes Hebrew niqqud', () => {
    expect(normalizeSearchText('שָׁלוֹם')).toBe('שלום');
  });

  it.each(['Королёв', 'КОРОЛЁВ'])('folds Cyrillic ё to е in %s', (text) => {
    expect(normalizeSearchText(text)).toContain(normalizeSearchText('королев'));
  });

  it('preserves the Ukrainian ї', () => {
    expect(normalizeSearchText('Україна')).toBe('україна');
  });

  it('keeps Cyrillic й distinct from и', () => {
    expect(normalizeSearchText('Нью-Йорк')).toBe('нью-йорк');
    expect(normalizeSearchText('и\u0306')).toBe('й');
    expect(normalizeSearchText('й')).not.toBe(normalizeSearchText('и'));
  });

  it.each([
    { text: 'за\u0301мок', expected: 'замок' },
    { text: 'ЗА\u0300МОК', expected: 'замок' },
    { text: 'ѐ', expected: 'е' },
    { text: 'Ѐ', expected: 'е' },
    { text: 'ѝ', expected: 'и' },
    { text: 'Украї\u0301на', expected: 'україна' },
  ])('removes the Cyrillic stress accent in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each([
    { text: 'ў', expected: 'ў' },
    { text: 'у\u0306', expected: 'ў' },
    { text: 'і\u0308', expected: 'ї' },
    { text: 'ѓ', expected: 'ѓ' },
    { text: 'г\u0301', expected: 'ѓ' },
    { text: 'ќ', expected: 'ќ' },
  ])(
    'keeps the letter-forming Cyrillic mark in $text',
    ({ text, expected }) => {
      expect(normalizeSearchText(text)).toBe(expected);
    },
  );

  it.each(['ガボン', 'カ\u3099ホ\u3099ン'])(
    'preserves Japanese voiced consonants in %s',
    (text) => {
      const normalizedText = normalizeSearchText(text);

      expect(normalizedText).toBe('ガボン');
      expect(normalizedText).not.toContain(normalizeSearchText('カ'));
      expect(normalizedText).toContain(normalizeSearchText('カ\u3099'));
    },
  );

  it('preserves Devanagari signs', () => {
    expect(normalizeSearchText('भारत')).toBe('भारत');
  });

  it.each([
    { text: '한국', search: '하' },
    { text: '한국', search: '한' },
    { text: '설정', search: '서' },
    { text: '설정', search: '설저' },
    { text: '한국', search: 'ㅎ' },
    { text: '한국', search: '한ㄱ' },
    { text: '설정', search: '설ㅈ' },
  ])('matches the partly typed Hangul $search in $text', ({ text, search }) => {
    expect(normalizeSearchText(text)).toContain(normalizeSearchText(search));
  });

  it.each([
    { text: 'Cancel·la', search: 'cancella' },
    { text: 'oʻchirish', search: 'ochirish' },
  ])('matches $search in $text', ({ text, search }) => {
    expect(normalizeSearchText(text)).toContain(normalizeSearchText(search));
  });

  it.each([
    '·',
    'ʻ',
    'ʼ',
    '´',
    '¨',
    'ˆ',
    '˜',
    '΄',
    'ˇ',
    '˘',
    '˙',
    '˚',
    '˛',
    '˝',
    '¯',
    '¸',
    '^',
    '`',
  ])('removes the spacing diacritic %s', (spacingDiacritic) => {
    expect(normalizeSearchText(`a${spacingDiacritic}b`)).toBe('ab');
  });

  it.each([
    { text: 'Crêpe', search: 'crˆ' },
    { text: 'España', search: 'espa˜' },
    { text: 'Ελλάδα', search: 'ελλ΄' },
    { text: 'Crêpe', search: 'cr^' },
    { text: 'Crème', search: 'cr`' },
    { text: 'Dvořák', search: 'dvoˇ' },
  ])(
    'matches $search typed with a pending dead key in $text',
    ({ text, search }) => {
      expect(normalizeSearchText(text)).toContain(normalizeSearchText(search));
    },
  );

  it('preserves tildes', () => {
    expect(normalizeSearchText('a~b')).toBe('a~b');
  });

  it('keeps long combining mark runs in linear time', () => {
    const combiningAcute = String.fromCodePoint(0x0301);
    const longMarkRun = combiningAcute.repeat(20000);

    expect(normalizeSearchText(`ж${longMarkRun}`)).toBe('ж');
    expect(normalizeSearchText(`1${longMarkRun}`)).toBe(`1${longMarkRun}`);
  });

  it.each([
    { text: '  Country #123  ', expected: '  country #123  ' },
    { text: '   ', expected: '   ' },
    { text: 'user@example.com', expected: 'user@example.com' },
    { text: '123-456-7890', expected: '123-456-7890' },
    { text: 'Café #1', expected: 'cafe #1' },
  ])('preserves whitespace and punctuation in $text', ({ text, expected }) => {
    expect(normalizeSearchText(text)).toBe(expected);
  });

  it.each([null, undefined, ''])('accepts missing text %s', (text) => {
    expect(normalizeSearchText(text)).toBe('');
  });
});
