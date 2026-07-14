import {
  getSystemRelationFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

const REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX = 'target';

// The four standard relation objects (timelineActivity/attachment/noteTarget/
// taskTarget) host one reverse morph field per source object, named
// `target${Capitalize(sourceObjectNameSingular)}` (e.g. noteTarget.targetPerson).
// These are engine-provisioned for custom objects, so twenty-standard must author
// them with the same name-free deterministic universal identifier - keeping an
// object rename a lossless update rather than a delete+create.
export const isReverseSystemRelationStandardField = ({
  objectName,
  fieldName,
}: {
  objectName: string;
  fieldName: string;
}): boolean =>
  (DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS as readonly string[]).includes(
    objectName,
  ) &&
  fieldName.startsWith(REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX) &&
  fieldName.length > REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length;

const getReverseSystemRelationSourceObjectName = (
  fieldName: string,
): string => {
  const withoutPrefix = fieldName.slice(
    REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length,
  );

  return withoutPrefix.charAt(0).toLowerCase() + withoutPrefix.slice(1);
};

// Resolves the universal identifier for a standard field, returning the name-free
// deterministic identifier for reverse system relation fields and the pinned
// fallback identifier otherwise. Shared by the field builder (reverse field own
// identifier + forward field relation target identifier) and the index builder so
// they always agree on the reverse field identifier.
export const computeStandardFieldUniversalIdentifier = ({
  objectName,
  fieldName,
  fallbackUniversalIdentifier,
}: {
  objectName: string;
  fieldName: string;
  fallbackUniversalIdentifier: string;
}): string => {
  if (!isReverseSystemRelationStandardField({ objectName, fieldName })) {
    return fallbackUniversalIdentifier;
  }

  const sourceObjectName = getReverseSystemRelationSourceObjectName(fieldName);
  const hostObject = STANDARD_OBJECTS[objectName as AllStandardObjectName];
  const sourceObject =
    STANDARD_OBJECTS[sourceObjectName as AllStandardObjectName];

  if (!isDefined(hostObject) || !isDefined(sourceObject)) {
    return fallbackUniversalIdentifier;
  }

  return getSystemRelationFieldUniversalIdentifier({
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    hostObjectUniversalIdentifier: hostObject.universalIdentifier,
    sourceObjectUniversalIdentifier: sourceObject.universalIdentifier,
  });
};
