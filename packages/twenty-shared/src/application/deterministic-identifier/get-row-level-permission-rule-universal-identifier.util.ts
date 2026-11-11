import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getRowLevelPermissionRuleUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  rootRowLevelPermissionPredicateGroupUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  rootRowLevelPermissionPredicateGroupUniversalIdentifier: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'rowLevelPermissionRule',
    value: [
      roleUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      rootRowLevelPermissionPredicateGroupUniversalIdentifier ?? 'ungrouped',
    ].join(':'),
    applicationUniversalIdentifier,
  });
