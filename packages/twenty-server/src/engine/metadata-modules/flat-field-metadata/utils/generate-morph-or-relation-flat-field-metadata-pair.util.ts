import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateIndexForFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-index-for-flat-field-metadata.util';
import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

type ComputeFieldMetadataRelationSettingsForRelationTypeArgs = {
  relationType: RelationType;
  joinColumnName: string;
  junctionTargetFieldUniversalIdentifier?: string;
};

const computeFieldMetadataRelationSettingsForRelationType = ({
  relationType,
  joinColumnName,
  junctionTargetFieldUniversalIdentifier,
}: ComputeFieldMetadataRelationSettingsForRelationTypeArgs): FlatFieldMetadata<MorphOrRelationFieldMetadataType>['universalSettings'] => {
  if (relationType === RelationType.MANY_TO_ONE) {
    const settings = {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName,
    };

    return settings;
  }

  return {
    relationType: RelationType.ONE_TO_MANY,
    ...(junctionTargetFieldUniversalIdentifier && {
      junctionTargetFieldUniversalIdentifier,
    }),
  };
};

type GenerateMorphOrRelationFlatFieldMetadataPairArgs = {
  targetFlatObjectMetadata: UniversalFlatObjectMetadata;
  sourceFlatObjectMetadata: UniversalFlatObjectMetadata;
  targetFlatFieldMetadataType: FieldMetadataType;
  sourceFlatObjectMetadataJoinColumnName: string;
  createFieldInput: Omit<CreateFieldInput, 'workspaceId' | 'objectMetadataId'> &
    Required<
      Pick<CreateFieldInput, 'relationCreationPayload' | 'type' | 'name'>
    > & { type: MorphOrRelationFieldMetadataType };
  morphId?: string | null;
  flatApplication: FlatApplication;
  targetFieldName?: string;
  junctionTargetFlatFieldMetadata?: FlatFieldMetadata;
};

export type SourceTargetMorphOrRelationFlatFieldAndFlatIndex = {
  flatFieldMetadatas: UniversalFlatFieldMetadata[];
  indexMetadatas: UniversalFlatIndexMetadata[];
};

export const generateMorphOrRelationFlatFieldMetadataPair = ({
  createFieldInput,
  sourceFlatObjectMetadata,
  targetFlatObjectMetadata,
  targetFlatFieldMetadataType,
  flatApplication,
  sourceFlatObjectMetadataJoinColumnName,
  morphId = null,
  targetFieldName,
  junctionTargetFlatFieldMetadata,
}: GenerateMorphOrRelationFlatFieldMetadataPairArgs): SourceTargetMorphOrRelationFlatFieldAndFlatIndex => {
  const sourceFlatFieldMetadataType = createFieldInput.type;

  const { relationCreationPayload } = createFieldInput;

  const sourceFlatFieldMetadataUniversalSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      joinColumnName: sourceFlatObjectMetadataJoinColumnName,
      relationType: relationCreationPayload.type,
      junctionTargetFieldUniversalIdentifier:
        junctionTargetFlatFieldMetadata?.universalIdentifier,
    });
  const sourceFieldUniversalIdentifier = v4();
  const targetFieldUniversalIdentifier = v4();

  const defaultDescriptionFromField =
    buildDescriptionForRelationFieldMetadataOnFromField({
      relationObjectMetadataNamePlural: sourceFlatObjectMetadata.namePlural,
      targetObjectLabelSingular: targetFlatObjectMetadata.labelSingular,
    });
  const defaultDescriptionToField =
    buildDescriptionForRelationFieldMetadataOnToField({
      relationObjectMetadataNamePlural: targetFlatObjectMetadata.namePlural,
      targetObjectLabelSingular: sourceFlatObjectMetadata.labelSingular,
    });
  const sourceFlatFieldMetadata: UniversalFlatFieldMetadata<MorphOrRelationFieldMetadataType> =
    {
      ...getDefaultFlatFieldMetadata({
        createFieldInput: {
          ...createFieldInput,
          universalIdentifier:
            createFieldInput.universalIdentifier ??
            sourceFieldUniversalIdentifier,
        },
        flatApplication,
        objectMetadataUniversalIdentifier:
          sourceFlatObjectMetadata.universalIdentifier,
      }),
      morphId:
        sourceFlatFieldMetadataType === FieldMetadataType.MORPH_RELATION
          ? morphId
          : null,
      icon: createFieldInput.icon ?? 'IconRelationOneToMany',
      type: sourceFlatFieldMetadataType,
      description:
        createFieldInput.description ?? defaultDescriptionFromField.description,
      defaultValue: null,
      universalSettings: sourceFlatFieldMetadataUniversalSettings,
      options: null,
      relationTargetObjectMetadataUniversalIdentifier:
        targetFlatObjectMetadata.universalIdentifier,
      relationTargetFieldMetadataUniversalIdentifier:
        targetFieldUniversalIdentifier,
    };

  const targetCreateFieldInput: Omit<
    CreateFieldInput,
    'objectMetadataId' | 'workspaceId'
  > = {
    icon: relationCreationPayload.targetFieldIcon ?? 'Icon123',
    description:
      createFieldInput.description ?? defaultDescriptionToField.description,
    label: relationCreationPayload.targetFieldLabel,
    name:
      targetFieldName ??
      computeMetadataNameFromLabel({
        label: relationCreationPayload.targetFieldLabel,
      }),
    type: FieldMetadataType.RELATION,
    isSystem: createFieldInput.isSystem ?? false,
  };
  const targetFlatFieldMetadataUniversalSettings =
    computeFieldMetadataRelationSettingsForRelationType({
      joinColumnName: computeMorphOrRelationFieldJoinColumnName({
        name: targetCreateFieldInput.name,
      }),
      relationType:
        relationCreationPayload.type === RelationType.ONE_TO_MANY
          ? RelationType.MANY_TO_ONE
          : RelationType.ONE_TO_MANY,
    });

  const targetFlatFieldMetadata: UniversalFlatFieldMetadata<
    typeof targetFlatFieldMetadataType
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput: {
        ...targetCreateFieldInput,
        universalIdentifier: targetFieldUniversalIdentifier,
      },
      flatApplication,
      objectMetadataUniversalIdentifier:
        targetFlatObjectMetadata.universalIdentifier,
    }),
    morphId:
      targetFlatFieldMetadataType === FieldMetadataType.MORPH_RELATION
        ? morphId
        : null,
    type: targetFlatFieldMetadataType,
    defaultValue: null,
    universalSettings: targetFlatFieldMetadataUniversalSettings,
    options: null,
    relationTargetObjectMetadataUniversalIdentifier:
      sourceFlatObjectMetadata.universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      sourceFlatFieldMetadata.universalIdentifier,
  };

  const indexMetadata: UniversalFlatIndexMetadata =
    generateIndexForFlatFieldMetadata({
      flatFieldMetadata:
        relationCreationPayload.type === RelationType.MANY_TO_ONE
          ? sourceFlatFieldMetadata
          : targetFlatFieldMetadata,
      flatObjectMetadata:
        relationCreationPayload.type === RelationType.MANY_TO_ONE
          ? sourceFlatObjectMetadata
          : targetFlatObjectMetadata,
    });

  return {
    flatFieldMetadatas: [sourceFlatFieldMetadata, targetFlatFieldMetadata],
    indexMetadatas: [indexMetadata],
  };
};
