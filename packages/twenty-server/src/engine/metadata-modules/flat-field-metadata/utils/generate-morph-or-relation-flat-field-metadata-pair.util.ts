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
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';

type ComputeFieldMetadataRelationSettingsForRelationTypeArgs = {
  relationType: RelationType;
  joinColumnName: string;
  junctionTargetFieldId?: string;
  junctionTargetFieldUniversalIdentifier?: string;
};

const computeFieldMetadataRelationSettingsForRelationType = ({
  relationType,
  joinColumnName,
  junctionTargetFieldId,
  junctionTargetFieldUniversalIdentifier,
}: ComputeFieldMetadataRelationSettingsForRelationTypeArgs): Pick<
  FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
  'settings' | 'universalSettings'
> => {
  if (relationType === RelationType.MANY_TO_ONE) {
    const settings = {
      relationType: RelationType.MANY_TO_ONE,
      onDelete: RelationOnDeleteAction.SET_NULL,
      joinColumnName,
    };

    return { settings, universalSettings: settings };
  }

  return {
    settings: {
      relationType: RelationType.ONE_TO_MANY,
      ...(junctionTargetFieldId && { junctionTargetFieldId }),
    },
    universalSettings: {
      relationType: RelationType.ONE_TO_MANY,
      ...(junctionTargetFieldUniversalIdentifier && {
        junctionTargetFieldUniversalIdentifier,
      }),
    },
  };
};

type GenerateMorphOrRelationFlatFieldMetadataPairArgs = {
  targetFlatObjectMetadata: FlatObjectMetadata;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  targetFlatFieldMetadataType: FieldMetadataType;
  sourceFlatObjectMetadataJoinColumnName: string;
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> &
    Required<
      Pick<CreateFieldInput, 'relationCreationPayload' | 'type' | 'name'>
    > & { type: MorphOrRelationFieldMetadataType };
  workspaceId: string;
  morphId?: string | null;
  flatApplication: FlatApplication;
  targetFieldName?: string;
  junctionTargetFlatFieldMetadata?: FlatFieldMetadata;
};

export type SourceTargetMorphOrRelationFlatFieldAndFlatIndex = {
  flatFieldMetadatas: FlatFieldMetadata[];
  indexMetadatas: FlatIndexMetadata[];
};

export const generateMorphOrRelationFlatFieldMetadataPair = ({
  createFieldInput,
  sourceFlatObjectMetadata,
  targetFlatObjectMetadata,
  targetFlatFieldMetadataType,
  workspaceId,
  flatApplication,
  sourceFlatObjectMetadataJoinColumnName,
  morphId = null,
  targetFieldName,
  junctionTargetFlatFieldMetadata,
}: GenerateMorphOrRelationFlatFieldMetadataPairArgs): SourceTargetMorphOrRelationFlatFieldAndFlatIndex => {
  const sourceFlatFieldMetadataType = createFieldInput.type;

  const { relationCreationPayload } = createFieldInput;

  const {
    settings: sourceFlatFieldMetadataSettings,
    universalSettings: sourceFlatFieldMetadataUniversalSettings,
  } = computeFieldMetadataRelationSettingsForRelationType({
    joinColumnName: sourceFlatObjectMetadataJoinColumnName,
    relationType: relationCreationPayload.type,
    junctionTargetFieldId: junctionTargetFlatFieldMetadata?.id,
    junctionTargetFieldUniversalIdentifier:
      junctionTargetFlatFieldMetadata?.universalIdentifier,
  });
  const targetRelationTargetFieldMetadataId = v4();
  const sourceRelationTargetFieldMetadataId = v4();
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
  const sourceFlatFieldMetadata: Omit<
    FlatFieldMetadata<MorphOrRelationFieldMetadataType>,
    'flatRelationTargetFieldMetadata'
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput: {
        ...createFieldInput,
        universalIdentifier: sourceFieldUniversalIdentifier,
      },
      workspaceId,
      fieldMetadataId: sourceRelationTargetFieldMetadataId,
      flatApplication,
      objectMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.universalIdentifier,
    }),
    morphId:
      sourceFlatFieldMetadataType === FieldMetadataType.MORPH_RELATION
        ? morphId
        : null,
    objectMetadataId: sourceFlatObjectMetadata.id,
    icon: createFieldInput.icon ?? 'IconRelationOneToMany',
    type: sourceFlatFieldMetadataType,
    description:
      createFieldInput.description ?? defaultDescriptionFromField.description,
    defaultValue: null,
    settings: sourceFlatFieldMetadataSettings,
    universalSettings: sourceFlatFieldMetadataUniversalSettings,
    options: null,
    relationTargetFieldMetadataId: targetRelationTargetFieldMetadataId,
    relationTargetObjectMetadataId: targetFlatObjectMetadata.id,
    relationTargetObjectMetadataUniversalIdentifier:
      targetFlatObjectMetadata.universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      targetFieldUniversalIdentifier,
  };

  const targetCreateFieldInput: CreateFieldInput = {
    icon: relationCreationPayload.targetFieldIcon ?? 'Icon123',
    description:
      createFieldInput.description ?? defaultDescriptionToField.description,
    label: relationCreationPayload.targetFieldLabel,
    name:
      targetFieldName ??
      computeMetadataNameFromLabel({
        label: relationCreationPayload.targetFieldLabel,
      }),
    objectMetadataId: targetFlatObjectMetadata.id,
    type: FieldMetadataType.RELATION,
    workspaceId,
    isSystem: createFieldInput.isSystem ?? false,
  };
  const {
    settings: targetFlatFieldMetadataSettings,
    universalSettings: targetFlatFieldMetadataUniversalSettings,
  } = computeFieldMetadataRelationSettingsForRelationType({
    joinColumnName: computeMorphOrRelationFieldJoinColumnName({
      name: targetCreateFieldInput.name,
    }),
    relationType:
      relationCreationPayload.type === RelationType.ONE_TO_MANY
        ? RelationType.MANY_TO_ONE
        : RelationType.ONE_TO_MANY,
  });

  const targetFlatFieldMetadata: FlatFieldMetadata<
    typeof targetFlatFieldMetadataType
  > = {
    ...getDefaultFlatFieldMetadata({
      createFieldInput: {
        ...targetCreateFieldInput,
        universalIdentifier: targetFieldUniversalIdentifier,
      },
      workspaceId,
      fieldMetadataId: targetRelationTargetFieldMetadataId,
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
    settings: targetFlatFieldMetadataSettings,
    universalSettings: targetFlatFieldMetadataUniversalSettings,
    options: null,
    relationTargetFieldMetadataId: sourceRelationTargetFieldMetadataId,
    relationTargetObjectMetadataId: sourceFlatObjectMetadata.id,
    relationTargetObjectMetadataUniversalIdentifier:
      sourceFlatObjectMetadata.universalIdentifier,
    relationTargetFieldMetadataUniversalIdentifier:
      sourceFieldUniversalIdentifier,
  };

  const indexMetadata: FlatIndexMetadata = generateIndexForFlatFieldMetadata({
    flatFieldMetadata:
      relationCreationPayload.type === RelationType.MANY_TO_ONE
        ? sourceFlatFieldMetadata
        : targetFlatFieldMetadata,
    flatObjectMetadata:
      relationCreationPayload.type === RelationType.MANY_TO_ONE
        ? sourceFlatObjectMetadata
        : targetFlatObjectMetadata,
    workspaceId,
  });

  return {
    flatFieldMetadatas: [sourceFlatFieldMetadata, targetFlatFieldMetadata],
    indexMetadatas: [indexMetadata],
  };
};
