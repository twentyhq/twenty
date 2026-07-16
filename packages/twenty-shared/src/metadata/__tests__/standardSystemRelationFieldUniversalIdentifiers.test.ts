import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/application/constants/TwentyStandardApplicationUniversalIdentifier';
import { getFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-field-universal-identifier.util';
import { getSystemRelationFieldUniversalIdentifier } from '@/application/deterministic-identifier/get-system-relation-field-universal-identifier.util';
import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from '@/metadata/constants/default-relations-object-standard-ids.constant';
import { STANDARD_OBJECTS } from '@/metadata/constants/standard-object.constant';

const REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX = 'target';

// The reverse morph fields of the default relations (target* on
// timelineActivity/attachment/noteTarget/taskTarget) are engine-provisioned for
// custom objects with a name-free deterministic universal identifier. The
// twenty-standard declarations pin the same identifiers as literals in
// STANDARD_OBJECTS so every builder can read them declaratively. This test
// guards the two from silently drifting apart.
describe('STANDARD_OBJECTS reverse system relation field universal identifiers', () => {
  const reverseSystemRelationFields =
    DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.flatMap((hostObjectName) => {
      const hostObject = STANDARD_OBJECTS[hostObjectName];

      return Object.entries(hostObject.fields)
        .filter(
          ([fieldName]) =>
            fieldName.startsWith(REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX) &&
            fieldName.length > REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length,
        )
        .map(([fieldName, fieldDefinition]) => ({
          hostObjectName,
          fieldName,
          pinnedUniversalIdentifier: (
            fieldDefinition as { universalIdentifier: string }
          ).universalIdentifier,
        }));
    });

  it('should cover the 24 reverse fields of the default relations', () => {
    expect(reverseSystemRelationFields).toHaveLength(24);
  });

  it.each(reverseSystemRelationFields)(
    'should pin the derived name-free identifier for $hostObjectName.$fieldName',
    ({ hostObjectName, fieldName, pinnedUniversalIdentifier }) => {
      const sourceObjectNameWithoutPrefix = fieldName.slice(
        REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length,
      );
      const sourceObjectName =
        sourceObjectNameWithoutPrefix.charAt(0).toLowerCase() +
        sourceObjectNameWithoutPrefix.slice(1);

      const hostObject = STANDARD_OBJECTS[hostObjectName];
      const sourceObject =
        STANDARD_OBJECTS[sourceObjectName as keyof typeof STANDARD_OBJECTS];

      expect(sourceObject).toBeDefined();

      expect(pinnedUniversalIdentifier).toBe(
        getSystemRelationFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          hostObjectUniversalIdentifier: hostObject.universalIdentifier,
          sourceObjectUniversalIdentifier: sourceObject.universalIdentifier,
        }),
      );
    },
  );
});

// The forward RELATION fields of the default relations (e.g.
// person.timelineActivities) are engine-provisioned for custom objects with
// the name-based deterministic identifier. twenty-standard pins the same
// derived identifiers so standard objects look exactly like engine-provisioned
// ones. The field is named after the host object namePlural, which never
// renames, so the name-based derivation is rename-invariant here.
describe('STANDARD_OBJECTS forward system relation field universal identifiers', () => {
  const forwardFieldNameByHostObjectName = {
    timelineActivity: 'timelineActivities',
    attachment: 'attachments',
    noteTarget: 'noteTargets',
    taskTarget: 'taskTargets',
  } as const satisfies Record<
    (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
    string
  >;

  const forwardSystemRelationFields =
    DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.flatMap((hostObjectName) => {
      const hostObject = STANDARD_OBJECTS[hostObjectName];
      const forwardFieldName = forwardFieldNameByHostObjectName[hostObjectName];

      return Object.entries(hostObject.fields)
        .filter(
          ([fieldName]) =>
            fieldName.startsWith(REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX) &&
            fieldName.length > REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length,
        )
        .map(([reverseFieldName]) => {
          const sourceObjectNameWithoutPrefix = reverseFieldName.slice(
            REVERSE_SYSTEM_RELATION_FIELD_NAME_PREFIX.length,
          );
          const sourceObjectName = (sourceObjectNameWithoutPrefix
            .charAt(0)
            .toLowerCase() +
            sourceObjectNameWithoutPrefix.slice(
              1,
            )) as keyof typeof STANDARD_OBJECTS;

          return {
            sourceObjectName,
            forwardFieldName,
          };
        });
    });

  it('should cover the 24 forward fields of the default relations', () => {
    expect(forwardSystemRelationFields).toHaveLength(24);
  });

  it.each(forwardSystemRelationFields)(
    'should pin the derived name-based identifier for $sourceObjectName.$forwardFieldName',
    ({ sourceObjectName, forwardFieldName }) => {
      const sourceObject = STANDARD_OBJECTS[sourceObjectName];
      const forwardFieldDefinition = (
        sourceObject.fields as Record<string, { universalIdentifier: string }>
      )[forwardFieldName];

      expect(forwardFieldDefinition).toBeDefined();

      expect(forwardFieldDefinition.universalIdentifier).toBe(
        getFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          objectUniversalIdentifier: sourceObject.universalIdentifier,
          name: forwardFieldName,
        }),
      );
    },
  );
});
