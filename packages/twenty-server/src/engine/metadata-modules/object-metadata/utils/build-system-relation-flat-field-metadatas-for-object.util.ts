import {
  getFieldUniversalIdentifier,
  getSystemRelationFieldUniversalIdentifier,
} from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type DefaultRelationStandardObjectNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

const MORPH_ID_BY_STANDARD_OBJECT_NAME_SINGULAR = {
  timelineActivity:
    STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  attachment: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
  noteTarget: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  taskTarget: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
} satisfies Record<DefaultRelationStandardObjectNameSingular, string | null>;

// One default system relation between the host object and one of the four
// standard relation objects (timelineActivity/attachment/noteTarget/taskTarget).
// The forward field lives on the host object; the reverse morph field lives on
// the standard object and points back at the host. They are kept together so a
// caller override of a default relation can skip the whole bundle atomically.
export type SystemRelationFlatFieldMetadataBundle = {
  forwardFlatFieldMetadata: UniversalFlatFieldMetadata;
  reverseFlatFieldMetadata: UniversalFlatFieldMetadata;
  flatIndexMetadata: UniversalFlatIndexMetadata;
};

type BuildSystemRelationFlatFieldMetadatasForObjectArgs = {
  sourceFlatObjectMetadata: UniversalFlatObjectMetadata;
  standardTargetFlatObjectMetadataByNameSingular: Record<
    DefaultRelationStandardObjectNameSingular,
    UniversalFlatObjectMetadata
  >;
  applicationUniversalIdentifier: string;
};

// Engine-owned builder for the default relations to standard objects. Mirrors
// the API/SDK provisioners it replaces, with two differences that make the
// standard-object rename lossless: the reverse morph field gets a name-free
// deterministic identifier (so a rename with a pinned object UID becomes an
// update, not a delete+create), and both sides are flagged isSystemSideEffect
// so the engine owns their full lifecycle.
export const buildSystemRelationFlatFieldMetadatasForObject = ({
  sourceFlatObjectMetadata,
  standardTargetFlatObjectMetadataByNameSingular,
  applicationUniversalIdentifier,
}: BuildSystemRelationFlatFieldMetadatasForObjectArgs): SystemRelationFlatFieldMetadataBundle[] =>
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.map((standardObjectNameSingular) => {
    const targetFlatObjectMetadata =
      standardTargetFlatObjectMetadataByNameSingular[
        standardObjectNameSingular
      ];

    const reverseFieldName = `target${capitalize(
      sourceFlatObjectMetadata.nameSingular,
    )}`;
    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: reverseFieldName,
    });
    const morphId =
      MORPH_ID_BY_STANDARD_OBJECT_NAME_SINGULAR[standardObjectNameSingular];

    const standardFieldProperties =
      STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT[
        standardObjectNameSingular
      ];
    const reverseFieldIcon =
      STANDARD_OBJECT_ICONS[
        targetFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
      ] ?? 'IconBuildingSkyscraper';

    const forwardFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
      name: targetFlatObjectMetadata.namePlural,
    });
    const reverseFieldUniversalIdentifier =
      getSystemRelationFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        hostObjectUniversalIdentifier:
          targetFlatObjectMetadata.universalIdentifier,
        sourceObjectUniversalIdentifier:
          sourceFlatObjectMetadata.universalIdentifier,
      });

    const { flatFieldMetadatas, indexMetadatas } =
      generateMorphOrRelationFlatFieldMetadataPair({
        sourceFlatObjectMetadata,
        targetFlatObjectMetadata,
        targetFlatFieldMetadataType: FieldMetadataType.MORPH_RELATION,
        applicationUniversalIdentifier,
        sourceFlatObjectMetadataJoinColumnName: joinColumnName,
        morphId,
        targetFieldName: reverseFieldName,
        sourceFieldUniversalIdentifier: forwardFieldUniversalIdentifier,
        targetFieldUniversalIdentifier: reverseFieldUniversalIdentifier,
        createFieldInput: {
          icon: standardFieldProperties.icon,
          type: FieldMetadataType.RELATION,
          name: targetFlatObjectMetadata.namePlural,
          label: i18nLabel(standardFieldProperties.label),
          isSystem: false,
          relationCreationPayload: {
            // Not consumed by the pair generator (the target object is passed
            // explicitly); universal entities carry no DB id.
            targetObjectMetadataId:
              targetFlatObjectMetadata.universalIdentifier,
            type: RelationType.ONE_TO_MANY,
            targetFieldLabel: capitalize(sourceFlatObjectMetadata.nameSingular),
            targetFieldIcon: reverseFieldIcon,
          },
        },
      });

    const [forwardFlatFieldMetadata, reverseFlatFieldMetadata] =
      flatFieldMetadatas;

    return {
      forwardFlatFieldMetadata: {
        ...forwardFlatFieldMetadata,
        isSystemSideEffect: true,
      },
      reverseFlatFieldMetadata: {
        ...reverseFlatFieldMetadata,
        isSystemSideEffect: true,
      },
      flatIndexMetadata: indexMetadatas[0],
    };
  });
