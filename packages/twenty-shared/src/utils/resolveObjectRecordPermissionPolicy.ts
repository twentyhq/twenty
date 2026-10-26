import { v5 } from 'uuid';

import {
  type ObjectRecordPermissionPolicy,
  type RecordPermissionPolicyDefinition,
} from '@/types/RecordPermissionPolicy';

export const resolveObjectRecordPermissionPolicy = (
  definition: RecordPermissionPolicyDefinition,
  objectUniversalIdentifier: string,
): ObjectRecordPermissionPolicy => {
  const object = definition.objects.find(
    (candidate) =>
      candidate.objectUniversalIdentifier === objectUniversalIdentifier,
  ) ?? { objectUniversalIdentifier, rules: [], inheritancePaths: [] };
  const overriddenRoles = new Set([
    ...(object.defaultOverrideRoleUniversalIdentifiers ?? []),
    ...object.rules
      .filter((rule) => rule.condition === null)
      .map((rule) => rule.roleUniversalIdentifier),
  ]);

  return {
    ...object,
    rules: [
      ...object.rules,
      ...(definition.defaults ?? [])
        .filter((rule) => !overriddenRoles.has(rule.roleUniversalIdentifier))
        .map((rule) => ({
          ...rule,
          universalIdentifier: v5(
            objectUniversalIdentifier,
            rule.universalIdentifier,
          ),
        })),
    ],
  };
};
