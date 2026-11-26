import { parseExpressionNode } from '@/utils/expression/parseExpressionNode';
import { printExpressionNode } from '@/expression/utils/printExpressionNode';

const parseOrThrow = (expression: string) => {
  const result = parseExpressionNode(expression);

  if (!result.isValid) {
    throw new Error(`"${expression}" did not parse: ${result.errorMessage}`);
  }

  return result.node;
};

const CANONICAL_EXPRESSIONS = [
  'price * quantity',
  'price * (quantity - returned)',
  'price - discount - fee',
  'price - (discount - fee)',
  'amount / count(tasks)',
  'sum(deals.amount, deals.stage == "WON") / count(employees)',
  'name || " (" || supplier.name || ")"',
  '-price * 2',
  'price * -1',
  '-(price + tax)',
  'length(name) + 1',
  'abs(price - cost)',
  'not isDefined(closedAt)',
  'not (stage == "WON")',
  'not (price > 1 and quantity > 1)',
  'stage in ["WON", "LOST"]',
  '(stage in ["WON"]) == isActive',
  'price + tax > 100 and stage != "LOST"',
  'isActive or (price > 100 and stage == "WON")',
  'if(price > 100, "high", "low")',
  'dateDiff(createdAt, now, "DAY") <= 30',
  'max(deals.amount)',
  'roundTo(price * 1.2, 2)',
  '(coalesce(name, "")).firstName == "Bob"',
];

describe('printExpressionNode', () => {
  it.each(CANONICAL_EXPRESSIONS)(
    'should print %p exactly as it was written',
    (expression) => {
      expect(printExpressionNode({ node: parseOrThrow(expression) })).toBe(
        expression,
      );
    },
  );

  it.each([
    ['(price * quantity) + tax', 'price * quantity + tax'],
    ['((price))', 'price'],
    ['(price + tax) || " EUR"', 'price + tax || " EUR"'],
    ['price   *quantity', 'price * quantity'],
    ["stage == 'WON'", 'stage == "WON"'],
    ['length name + 1', 'length(name) + 1'],
    ['abs (price - cost)', 'abs(price - cost)'],
  ])('should print %p in the canonical form %p', (expression, canonical) => {
    expect(printExpressionNode({ node: parseOrThrow(expression) })).toBe(
      canonical,
    );
  });

  it.each([
    'a - (b * c - d) / (e + f) % g',
    'not (a + b == c) or d in [1, 2] and -e < f',
    '(a or b) and not c == (d and e)',
    'x || (y || z)',
    '-(-a)',
    'a - -1',
    'length (a || b) * 2',
    'abs -a',
    '(a + b).c * 2',
  ])('should read back the same tree after printing %p', (expression) => {
    const node = parseOrThrow(expression);

    expect(parseOrThrow(printExpressionNode({ node }))).toEqual(node);
  });
});
