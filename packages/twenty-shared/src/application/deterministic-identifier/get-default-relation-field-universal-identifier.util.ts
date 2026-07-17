import { getSystemRelationFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-relation-field-universal-identifier.util';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from '@/metadata/constants/standard-object-universal-identifiers.constant';

const STANDARD_RELATION_OBJECT_UNIVERSAL_IDENTIFIER_BY_DEFAULT_RELATION_FIELD_NAME =
  {
    timelineActivities: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.timelineActivity,
    attachments: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.attachment,
    noteTargets: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.noteTarget,
    taskTargets: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.taskTarget,
  } as const;

export type DefaultRelationFieldName =
  keyof typeof STANDARD_RELATION_OBJECT_UNIVERSAL_IDENTIFIER_BY_DEFAULT_RELATION_FIELD_NAME;

// Derives the universal identifier of one of the default relation fields the
// engine provisions on every object (timelineActivities, attachments,
// noteTargets, taskTargets). These fields are engine-owned and their
// identifiers are name-free (keyed on the host and standard relation object
// identifiers), so they cannot be derived with getFieldUniversalIdentifier.
export const getDefaultRelationFieldUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  defaultRelation,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  defaultRelation: DefaultRelationFieldName;
}): string =>
  getSystemRelationFieldUniversalIdentifier({
    applicationUniversalIdentifier,
    hostObjectUniversalIdentifier: objectUniversalIdentifier,
    relationTargetObjectUniversalIdentifier:
      STANDARD_RELATION_OBJECT_UNIVERSAL_IDENTIFIER_BY_DEFAULT_RELATION_FIELD_NAME[
        defaultRelation
      ],
  });
