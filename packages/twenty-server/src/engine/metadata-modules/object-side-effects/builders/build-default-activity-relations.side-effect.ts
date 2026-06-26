import { generateDefaultFieldUniversalIdentifier } from 'twenty-shared/application';
import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT } from 'src/engine/metadata-modules/object-metadata/constants/standard-relation-field-properties.constant';
import { type ObjectSideEffectBuilder } from 'src/engine/metadata-modules/object-side-effects/types/object-side-effect-builder.type';
import { type SideEffectFlatEntities } from 'src/engine/metadata-modules/object-side-effects/types/side-effect-flat-entities.type';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-object-icons';

const morphIdByRelationObjectNameSingular = {
  timelineActivity:
    STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
  attachment: STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId,
  noteTarget: STANDARD_OBJECTS.noteTarget.morphIds.targetMorphId.morphId,
  taskTarget: STANDARD_OBJECTS.taskTarget.morphIds.targetMorphId.morphId,
} satisfies Record<
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number],
  string | null
>;

export const buildDefaultActivityRelationsSideEffect: ObjectSideEffectBuilder = ({
  object: sourceFlatObjectMetadata,
  context,
}) => {
  const existingFieldNames =
    context.existingFieldNamesByObjectUniversalIdentifier.get(
      sourceFlatObjectMetadata.universalIdentifier,
    ) ?? new Set<string>();

  return DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS.reduce<
    Pick<SideEffectFlatEntities, 'fieldMetadata' | 'index'>
  >(
    (accumulator, junctionNameSingular) => {
      const junctionFlatObjectMetadata =
        context.junctionObjectByNameSingular.get(junctionNameSingular);

      if (!isDefined(junctionFlatObjectMetadata)) {
        return accumulator;
      }

      const forwardFieldName = junctionFlatObjectMetadata.namePlural;

      if (existingFieldNames.has(forwardFieldName)) {
        return accumulator;
      }

      const standardFieldProperties =
        STANDARD_RELATION_FIELD_PROPERTIES_BY_RELATION_OBJECT[
          junctionNameSingular
        ];
      const inverseFieldName = `target${capitalize(sourceFlatObjectMetadata.nameSingular)}`;
      const targetFieldIcon =
        STANDARD_OBJECT_ICONS[
          junctionFlatObjectMetadata.nameSingular as keyof typeof STANDARD_OBJECT_ICONS
        ] || 'IconBuildingSkyscraper';

      const { flatFieldMetadatas, indexMetadatas } =
        generateMorphOrRelationFlatFieldMetadataPair({
          sourceFlatObjectMetadata,
          targetFlatObjectMetadata: junctionFlatObjectMetadata,
          targetFlatFieldMetadataType: FieldMetadataType.MORPH_RELATION,
          flatApplication: context.flatApplication,
          sourceFlatObjectMetadataJoinColumnName:
            computeMorphOrRelationFieldJoinColumnName({ name: inverseFieldName }),
          morphId: morphIdByRelationObjectNameSingular[junctionNameSingular],
          targetFieldName: inverseFieldName,
          targetFieldUniversalIdentifier: generateDefaultFieldUniversalIdentifier(
            {
              objectUniversalIdentifier:
                sourceFlatObjectMetadata.universalIdentifier,
              fieldName: `${forwardFieldName}Inverse`,
            },
          ),
          isSystemSideEffect: true,
          createFieldInput: {
            icon: standardFieldProperties.icon,
            type: FieldMetadataType.RELATION,
            name: forwardFieldName,
            label: i18nLabel(standardFieldProperties.label),
            isSystem: false,
            universalIdentifier: generateDefaultFieldUniversalIdentifier({
              objectUniversalIdentifier:
                sourceFlatObjectMetadata.universalIdentifier,
              fieldName: forwardFieldName,
            }),
            relationCreationPayload: {
              type: RelationType.ONE_TO_MANY,
              targetObjectMetadataId: junctionFlatObjectMetadata.id,
              targetFieldLabel: capitalize(
                sourceFlatObjectMetadata.nameSingular,
              ),
              targetFieldIcon,
            },
          },
        });

      return {
        fieldMetadata: [...accumulator.fieldMetadata, ...flatFieldMetadatas],
        index: [...accumulator.index, ...indexMetadatas],
      };
    },
    { fieldMetadata: [], index: [] },
  );
};
