/* @license Enterprise */

import { type StoredExpressionTree } from 'twenty-shared/types';
import { isDefined, listValidationRuleFieldNodes } from 'twenty-shared/utils';

export const listValidationRuleReadFieldUniversalIdentifiers = ({
  tree,
}: {
  tree: StoredExpressionTree | null;
}): string[] =>
  listValidationRuleFieldNodes({ tree }).flatMap(
    ({ fieldUniversalIdentifier, relationFieldUniversalIdentifier }) =>
      [relationFieldUniversalIdentifier, fieldUniversalIdentifier].filter(
        isDefined,
      ),
  );
