import { isNonEmptyArray } from '@sniptt/guards';

import { isDefined, isPlainObject } from '@/utils';
import { getEditDistance } from '@/workflow/validation/utils/get-edit-distance.util';
import { isBaseOutputSchemaV2 } from '@/workflow/workflow-schema/guards/isBaseOutputSchemaV2';
import { collectOutputSchemaPaths } from '@/workflow/workflow-schema/utils/collectOutputSchemaPaths';
import { findOutputSchemaPathFailure } from '@/workflow/workflow-schema/utils/findOutputSchemaPathFailure';
import { collectOutputSchemaVariablePaths } from '@/workflow/workflow-schema/utils/resolveVariablePathInOutputSchema';

const MAX_SUGGESTIONS = 3;

const containsRecordOutputSchema = (value: unknown): boolean => {
  if (!isPlainObject(value)) {
    return false;
  }

  if (value['_outputSchemaType'] === 'RECORD') {
    return true;
  }

  return Object.values(value).some(
    (entry) =>
      isPlainObject(entry) && containsRecordOutputSchema(entry['value']),
  );
};

const rankClosestCandidates = (
  target: string,
  candidates: string[],
): string[] =>
  candidates
    .map((candidate) => ({
      candidate,
      distance: getEditDistance(target, candidate),
    }))
    .filter(
      ({ candidate, distance }) => distance <= Math.ceil(candidate.length / 2),
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ candidate }) => candidate);

export const getVariablePathSuggestions = ({
  schema,
  propertyPath,
  referencedStepId,
}: {
  schema: unknown;
  propertyPath: string[];
  referencedStepId: string;
}): string[] => {
  if (!isBaseOutputSchemaV2(schema) || containsRecordOutputSchema(schema)) {
    const allPaths = collectOutputSchemaVariablePaths(schema);

    return rankClosestCandidates(propertyPath.join('.'), allPaths).map((path) =>
      [referencedStepId, path].join('.'),
    );
  }

  const failure = findOutputSchemaPathFailure({ schema, propertyPath });

  if (!isDefined(failure)) {
    return [];
  }

  const localMatches = rankClosestCandidates(
    failure.failedSegment,
    failure.availableKeys,
  ).map((key) => [referencedStepId, ...failure.validPrefix, key].join('.'));

  if (isNonEmptyArray(localMatches)) {
    return localMatches;
  }

  const allPaths = collectOutputSchemaPaths(schema);

  return rankClosestCandidates(propertyPath.join('.'), allPaths).map((path) =>
    [referencedStepId, path].join('.'),
  );
};
