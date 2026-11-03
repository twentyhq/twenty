import { CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME } from '@/constants/internal/ConditionalAvailabilityFavoriteRecordIdsVariableName';
import { type ConditionalAvailabilityExpressionNode } from '@/types/conditional-display/ConditionalAvailabilityExpressionNode';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { describeConditionalAvailabilityCompiledItem } from '@/utils/conditional-display/internal/describeConditionalAvailabilityCompiledItem';
import { resolveConditionalAvailabilitySubject } from '@/utils/conditional-display/internal/resolveConditionalAvailabilitySubject';
import { isConditionalDisplayAdminContextKey } from '@/utils/conditional-display/isConditionalDisplayAdminContextKey';
import { isConditionalDisplayContextKey } from '@/utils/conditional-display/isConditionalDisplayContextKey';
import { isDefined } from '@/utils/validation/isDefined';

export const compileConditionalAvailabilityOperand = ({
  node,
  compileOperand,
  expression,
}: {
  node: Extract<
    ConditionalAvailabilityExpressionNode,
    { kind: 'literal' | 'list' | 'variable' | 'member' }
  >;
  compileOperand: (
    node: ConditionalAvailabilityExpressionNode,
  ) => ConditionalAvailabilityCompiledItem;
  expression: string;
}): ConditionalAvailabilityCompiledItem => {
  const fail = (reason: string): never => {
    throw buildConditionalAvailabilityCompilationError({ expression, reason });
  };

  switch (node.kind) {
    case 'literal':
      return node;
    case 'list':
      return {
        kind: 'list',
        values: node.elements.map((element) =>
          element.kind === 'literal'
            ? element.value
            : fail('unsupported list element: lists only accept literals'),
        ),
      };
    case 'variable':
      if (isConditionalDisplayAdminContextKey(node.name)) {
        return fail(
          `unsupported admin subject "${node.name}": engine conditions cannot carry admin subjects`,
        );
      }

      return isConditionalDisplayContextKey(node.name) ||
        node.name === CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME
        ? { kind: 'reference', name: node.name }
        : fail(`unknown variable "${node.name}"`);
    case 'member': {
      const object = compileOperand(node.object);
      const unsupportedMemberReason = `unsupported member "${node.memberName}" of ${describeConditionalAvailabilityCompiledItem(object)}`;

      if (object.kind !== 'reference' || isDefined(object.subFieldName)) {
        return fail(unsupportedMemberReason);
      }

      if (
        object.name ===
          CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME &&
        node.memberName === 'length'
      ) {
        return { kind: 'favoriteRecordCount' };
      }

      const member = { ...object, subFieldName: node.memberName };

      return isDefined(resolveConditionalAvailabilitySubject(member))
        ? member
        : fail(unsupportedMemberReason);
    }
  }
};
