import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { isDefined } from '@/utils/validation/isDefined';

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
      ...(isDefined(rowLevelPermissionPredicateGroupUniversalIdentifier)
        ? [rowLevelPermissionPredicateGroupUniversalIdentifier]
        : []),
    ].join(':'),
    applicationUniversalIdentifier,
  });
