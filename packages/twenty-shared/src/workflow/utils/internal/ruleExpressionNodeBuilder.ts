import { type VALIDATION_RULE_FUNCTIONS } from '@/constants/ValidationRuleFunctions';
import { isDefined } from '@/utils/validation/isDefined';
import { type RuleExpressionNode } from '@/workflow/utils/internal/RuleExpressionNode';

type RuleExpressionComparisonOperator = '==' | '!=' | '<' | '<=' | '>' | '>=';

type RuleExpressionLogicalOperator = 'and' | 'or';

const UNSIGNED_NUMBER_LITERAL_PATTERN = /^\d+(\.\d+)?$/;

const TRUE_NODE: RuleExpressionNode = { source: 'true', precedence: 'operand' };

const FALSE_NODE: RuleExpressionNode = {
  source: 'false',
  precedence: 'operand',
};

const isUnicodeEscapedCharacter = (characterCode: number) =>
  characterCode < 0x20 ||
  characterCode === 0x7f ||
  characterCode === 0x2028 ||
  characterCode === 0x2029;

// The parser takes any quote right after a backslash as escaped, so a quote or
// backslash never appears raw: both go through \uXXXX
const escapeStringCharacter = (character: string) => {
  const characterCode = character.charCodeAt(0);

  return character === '\\' ||
    character === "'" ||
    character === '"' ||
    isUnicodeEscapedCharacter(characterCode)
    ? `\\u${characterCode.toString(16).padStart(4, '0')}`
    : character;
};

const toOperandSource = (node: RuleExpressionNode) =>
  node.precedence === 'operand' ? node.source : `(${node.source})`;

const combine = (
  logicalOperator: RuleExpressionLogicalOperator,
  nodes: RuleExpressionNode[],
): RuleExpressionNode => {
  const absorbingNode = logicalOperator === 'and' ? FALSE_NODE : TRUE_NODE;
  const neutralNode = logicalOperator === 'and' ? TRUE_NODE : FALSE_NODE;

  if (nodes.some((node) => node.source === absorbingNode.source)) {
    return absorbingNode;
  }

  const meaningfulNodes = nodes.filter(
    (node) => node.source !== neutralNode.source,
  );

  if (meaningfulNodes.length === 0) {
    return neutralNode;
  }

  const [firstMeaningfulNode] = meaningfulNodes;

  if (meaningfulNodes.length === 1 && isDefined(firstMeaningfulNode)) {
    return firstMeaningfulNode;
  }

  return {
    source: meaningfulNodes
      .map((node) =>
        node.precedence === 'and' || node.precedence === 'or'
          ? node.precedence === logicalOperator
            ? node.source
            : `(${node.source})`
          : node.source,
      )
      .join(` ${logicalOperator} `),
    precedence: logicalOperator,
  };
};

const compare = (
  left: RuleExpressionNode,
  operator: RuleExpressionComparisonOperator,
  right: RuleExpressionNode,
): RuleExpressionNode => ({
  source: `${toOperandSource(left)} ${operator} ${toOperandSource(right)}`,
  precedence: 'comparison',
});

const string = (value: string): RuleExpressionNode => ({
  source: `'${Array.from(value).map(escapeStringCharacter).join('')}'`,
  precedence: 'operand',
});

export const ruleExpressionNodeBuilder = {
  true: TRUE_NODE,
  false: FALSE_NODE,
  path: (path: string): RuleExpressionNode => ({
    source: path,
    precedence: 'operand',
  }),
  string,
  // The grammar has no exponent notation, so 1e21 or Infinity cannot be written
  number: (value: number): RuleExpressionNode | undefined => {
    const absoluteValueSource = String(Math.abs(value));

    if (
      !Number.isFinite(value) ||
      !UNSIGNED_NUMBER_LITERAL_PATTERN.test(absoluteValueSource)
    ) {
      return undefined;
    }

    return {
      source: value < 0 ? `-${absoluteValueSource}` : absoluteValueSource,
      precedence: 'operand',
    };
  },
  call: (
    functionName: keyof typeof VALIDATION_RULE_FUNCTIONS,
    ...functionArguments: RuleExpressionNode[]
  ): RuleExpressionNode => ({
    source: `${functionName}(${functionArguments.map((node) => node.source).join(', ')})`,
    precedence: 'operand',
  }),
  compare,
  isIn: (left: RuleExpressionNode, values: string[]): RuleExpressionNode => {
    const [firstValue] = values;

    if (!isDefined(firstValue)) {
      return FALSE_NODE;
    }

    if (values.length === 1) {
      return compare(left, '==', string(firstValue));
    }

    return {
      source: `${toOperandSource(left)} in [${values
        .map((value) => string(value).source)
        .join(', ')}]`,
      precedence: 'comparison',
    };
  },
  and: (...nodes: RuleExpressionNode[]) => combine('and', nodes),
  or: (...nodes: RuleExpressionNode[]) => combine('or', nodes),
  not: (node: RuleExpressionNode): RuleExpressionNode => {
    if (node.source === TRUE_NODE.source) {
      return FALSE_NODE;
    }

    if (node.source === FALSE_NODE.source) {
      return TRUE_NODE;
    }

    return { source: `not ${toOperandSource(node)}`, precedence: 'operand' };
  },
};
