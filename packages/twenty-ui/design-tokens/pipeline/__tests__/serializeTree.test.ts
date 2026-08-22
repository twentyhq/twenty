import { serializeTree } from '../serializeTree';

describe('serializeTree', () => {
  it('serializes a flat tree with the given separator', () => {
    expect(serializeTree({ node: { md: "'8px'" }, separator: ',' })).toBe(
      "{\n  md: '8px',\n}",
    );
  });

  it('indents nested nodes by two more spaces per level', () => {
    expect(
      serializeTree({
        node: { border: { radius: { md: "'8px'" } } },
        separator: ',',
      }),
    ).toBe("{\n  border: {\n    radius: {\n      md: '8px',\n    },\n  },\n}");
  });

  it('quotes keys that are not valid identifiers', () => {
    expect(serializeTree({ node: { '0.5': "'2px'" }, separator: ',' })).toBe(
      "{\n  '0.5': '2px',\n}",
    );
  });

  it('uses semicolons when serializing a type tree', () => {
    expect(
      serializeTree({
        node: { size: { sm: 'number' } },
        separator: ';',
      }),
    ).toBe('{\n  size: {\n    sm: number;\n  };\n}');
  });
});
