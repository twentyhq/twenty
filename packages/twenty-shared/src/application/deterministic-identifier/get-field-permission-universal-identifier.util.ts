import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getFieldPermissionUniversalIdentifier = ({
  applicationUniversalIdentifier,
  roleUniversalIdentifier,
  fieldUniversalIdentifier,
  rowLevelPermissionPredicateGroupUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  rowLevelPermissionPredicateGroupUniversalIdentifier?: string | null;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'fieldPermission',
    value: [
      roleUniversalIdentifier,
      fieldUniversalIdentifier,
      ...(rowLevelPermissionPredicateGroupUniversalIdentifier
        ? [rowLevelPermissionPredicateGroupUniversalIdentifier]
        : []),
    ].join(':'),
    applicationUniversalIdentifier,
  });
