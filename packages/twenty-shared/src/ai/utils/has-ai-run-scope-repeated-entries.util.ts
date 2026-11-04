import { type AiRunScope } from '@/ai/types/AiRunScope';
import { isDefined } from '@/utils/validation/isDefined';

const hasRepeatedKey = (keys: string[]): boolean =>
  new Set(keys).size !== keys.length;

// a repeated object or field would leave the permission that applies ambiguous, so a scope names each once
export const hasAiRunScopeRepeatedEntries = (
  scope: AiRunScope | null | undefined,
): boolean =>
  isDefined(scope) &&
  (hasRepeatedKey(
    (scope.objectPermissions ?? []).map(
      ({ objectUniversalIdentifier }) => objectUniversalIdentifier,
    ),
  ) ||
    hasRepeatedKey(
      (scope.fieldPermissions ?? []).map(
        ({ fieldUniversalIdentifier }) => fieldUniversalIdentifier,
      ),
    ));
