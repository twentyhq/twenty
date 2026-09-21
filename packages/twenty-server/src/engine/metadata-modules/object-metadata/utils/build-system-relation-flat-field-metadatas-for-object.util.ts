import { getSystemRelationFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataWritability,
  RelationOnDeleteAction,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type DefaultRelationStandardObjectNameSingular =
  | (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number]
  | 'agentChatThreadTarget';

const MORPH_ID_BY_STANDARD_OBJECT_NAME_SINGULAR = {
  timelineActivity:
    STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  attachment: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
  agentChatThreadTarget:
    STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
  noteTarget: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  taskTarget: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
} satisfies Record<DefaultRelationStandardObjectNameSingular, string | null>;

export type SystemRelationFlatFieldMetadataBundle = {
  forwardFlatFieldMetadata: UniversalFlatFieldMetadata;
  reverseFlatFieldMetadata: UniversalFlatFieldMetadata;
  flatIndexMetadata: UniversalFlatIndexMetadata;
};

type BuildSystemRelationFlatFieldMetadatasForObjectArgs = {
  sourceFlatObjectMetadata: UniversalFlatObjectMetadata;
  standardTargetFlatObjectMetadataByNameSingular: Partial<
    Record<
      DefaultRelationStandardObjectNameSingular,
      UniversalFlatObjectMetadata
    >
  >;
  standardObjectNames?: readonly DefaultRelationStandardObjectNameSingular[];
  applicationUniversalIdentifier: string;
};

export const buildSystemRelationFlatFieldMetadatasForObject = ({
  sourceFlatObjectMetadata,
  standardTargetFlatObjectMetadataByNameSingular,
  applicationUniversalIdentifier,
  standardObjectNames = DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
}: BuildSystemRelationFlatFieldMetadatasForObjectArgs): SystemRelationFlatFieldMetadataBundle[] =>
  standardObjectNames.map((standardObjectNameSingular) => {
    const targetFlatObjectMetadata =
      standardTargetFlatObjectMetadataByNameSingular[
        standardObjectNameSingular
      ];

    if (!isDefined(targetFlatObjectMetadata)) {
      throw new Error(
        `Missing system relation object ${standardObjectNameSingular}`,
      );
    }

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

    const forwardFieldUniversalIdentifier =
      getSystemRelationFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier: sourceFlatObjectMetadata.universalIdentifier,
        relationTargetObjectUniversalIdentifier:
          targetFlatObjectMetadata.universalIdentifier,
      });
    const reverseFieldUniversalIdentifier =
      getSystemRelationFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectUniversalIdentifier: targetFlatObjectMetadata.universalIdentifier,
        relationTargetObjectUniversalIdentifier:
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
        isSystemSideEffect: true,
        createFieldInput: {
          icon: standardFieldProperties.icon,
          type: FieldMetadataType.RELATION,
          name: targetFlatObjectMetadata.namePlural,
          label: i18nLabel(standardFieldProperties.label),
          relationCreationPayload: {
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

    if (standardObjectNameSingular === 'agentChatThreadTarget') {
      // Linking a record must not expose the owner's private conversation through CRUD or audit logs.
      for (const field of flatFieldMetadatas) {
        field.writability = MetadataWritability.SYSTEM;
        field.isAuditLogged = false;
        field.isUIEditable = false;
      }
      reverseFlatFieldMetadata.universalSettings = {
        relationType: RelationType.MANY_TO_ONE,
        joinColumnName,
        onDelete: RelationOnDeleteAction.CASCADE,
      };
    }

    return {
      forwardFlatFieldMetadata,
      reverseFlatFieldMetadata,
      flatIndexMetadata: indexMetadatas[0],
    };
  });
