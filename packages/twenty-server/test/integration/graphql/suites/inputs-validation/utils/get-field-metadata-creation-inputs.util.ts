import {
  type FieldMetadataTypesToTestForCreateInputValidation,
  type FieldMetadataTypesToTestForFilterInputValidation,
} from 'test/integration/graphql/suites/inputs-validation/types/field-metadata-type-to-test';
import {
  FieldMetadataType,
  RelationType,
  type RelationCreationPayload,
} from 'twenty-shared/types';

import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

type FieldMetadataCreationInput = {
  name: string;
  label: string;
  type: FieldMetadataType;
  objectMetadataId: string;
  options?: FieldMetadataComplexOption[];
  relationCreationPayload?: RelationCreationPayload;
  morphRelationsCreationPayload?: RelationCreationPayload[];
};

export const getFieldMetadataCreationInputs = (
  objectMetadataId: string,
  targetObjectMetadata1Id: string,
  targetObjectMetadata2Id: string,
) => {
  const fieldInputsMap: {
    [K in Exclude<
      | FieldMetadataTypesToTestForCreateInputValidation
      | FieldMetadataTypesToTestForFilterInputValidation,
      'ACTOR' | 'POSITION'
    >]: FieldMetadataCreationInput | FieldMetadataCreationInput[];
  } = {
    [FieldMetadataType.RICH_TEXT]: {
      name: 'richTextField',
      label: 'richTextField',
      type: FieldMetadataType.RICH_TEXT,
      objectMetadataId,
    },
    [FieldMetadataType.RICH_TEXT_V2]: {
      name: 'richTextV2Field',
      label: 'richTextV2Field',
      type: FieldMetadataType.RICH_TEXT_V2,
      objectMetadataId,
    },
    [FieldMetadataType.TEXT]: {
      name: 'textField',
      label: 'textField',
      type: FieldMetadataType.TEXT,
      objectMetadataId,
    },
    [FieldMetadataType.PHONES]: {
      name: 'phonesField',
      label: 'phonesField',
      type: FieldMetadataType.PHONES,
      objectMetadataId,
    },
    [FieldMetadataType.EMAILS]: {
      name: 'emailsField',
      label: 'emailsField',
      type: FieldMetadataType.EMAILS,
      objectMetadataId,
    },
    [FieldMetadataType.DATE_TIME]: {
      name: 'dateTimeField',
      label: 'dateTimeField',
      type: FieldMetadataType.DATE_TIME,
      objectMetadataId,
    },
    [FieldMetadataType.DATE]: {
      name: 'dateField',
      label: 'dateField',
      type: FieldMetadataType.DATE,
      objectMetadataId,
    },
    [FieldMetadataType.BOOLEAN]: {
      name: 'booleanField',
      label: 'booleanField',
      type: FieldMetadataType.BOOLEAN,
      objectMetadataId,
    },
    [FieldMetadataType.NUMBER]: {
      name: 'numberField',
      label: 'numberField',
      type: FieldMetadataType.NUMBER,
      objectMetadataId,
    },
    [FieldMetadataType.LINKS]: {
      name: 'linksField',
      label: 'linksField',
      type: FieldMetadataType.LINKS,
      objectMetadataId,
    },
    [FieldMetadataType.CURRENCY]: {
      name: 'currencyField',
      label: 'currencyField',
      type: FieldMetadataType.CURRENCY,
      objectMetadataId,
    },
    [FieldMetadataType.FULL_NAME]: {
      name: 'fullNameField',
      label: 'fullNameField',
      type: FieldMetadataType.FULL_NAME,
      objectMetadataId,
    },
    [FieldMetadataType.RATING]: {
      name: 'ratingField',
      label: 'ratingField',
      type: FieldMetadataType.RATING,
      objectMetadataId,
    },
    [FieldMetadataType.SELECT]: {
      name: 'selectField',
      label: 'selectField',
      type: FieldMetadataType.SELECT,
      options: [
        {
          label: 'Option 1',
          value: 'OPTION_1',
          color: 'green',
          position: 1,
          id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
        },
      ],
      objectMetadataId,
    },
    [FieldMetadataType.MULTI_SELECT]: {
      name: 'multiSelectField',
      label: 'multiSelectField',
      type: FieldMetadataType.MULTI_SELECT,
      options: [
        {
          label: 'Option 1',
          value: 'OPTION_1',
          color: 'green',
          position: 1,
          id: '26c602c3-cba9-4d83-92d4-4ba7dbae2f31',
        },
      ],
      objectMetadataId,
    },

    [FieldMetadataType.ADDRESS]: {
      name: 'addressField',
      label: 'addressField',
      type: FieldMetadataType.ADDRESS,
      objectMetadataId,
    },
    [FieldMetadataType.RAW_JSON]: {
      name: 'rawJsonField',
      label: 'rawJsonField',
      type: FieldMetadataType.RAW_JSON,
      objectMetadataId,
    },
    [FieldMetadataType.ARRAY]: {
      name: 'arrayField',
      label: 'arrayField',
      type: FieldMetadataType.ARRAY,
      objectMetadataId,
    },
    [FieldMetadataType.UUID]: {
      name: 'uuidField',
      label: 'uuidField',
      type: FieldMetadataType.UUID,
      objectMetadataId,
    },
    [FieldMetadataType.RELATION]: [
      {
        name: 'manyToOneRelationField',
        label: 'manyToOneRelationField',
        type: FieldMetadataType.RELATION,
        objectMetadataId,
        relationCreationPayload: {
          targetObjectMetadataId: targetObjectMetadata1Id,
          targetFieldLabel: 'oneToManyTargetRelationField',
          targetFieldIcon: 'IconListOpportunity',
          type: RelationType.MANY_TO_ONE,
        },
      },
      {
        name: 'oneToManyRelationField',
        label: 'oneToManyRelationField',
        type: FieldMetadataType.RELATION,
        objectMetadataId,
        relationCreationPayload: {
          targetObjectMetadataId: targetObjectMetadata1Id,
          targetFieldLabel: 'manyToOneTargetRelationField',
          targetFieldIcon: 'IconListOpportunity',
          type: RelationType.ONE_TO_MANY,
        },
      },
    ],
    [FieldMetadataType.MORPH_RELATION]: [
      {
        name: 'manyToOneMorphRelationField',
        label: 'manyToOneMorphRelationField',
        type: FieldMetadataType.MORPH_RELATION,
        objectMetadataId,
        morphRelationsCreationPayload: [
          {
            targetObjectMetadataId: targetObjectMetadata1Id,
            targetFieldLabel: 'oneToManyTarget1MorphRelationField',
            targetFieldIcon: 'IconListOpportunity',
            type: RelationType.MANY_TO_ONE,
          },
          {
            targetObjectMetadataId: targetObjectMetadata2Id,
            targetFieldLabel: 'oneToManyTarget2MorphRelationField',
            targetFieldIcon: 'IconListOpportunity',
            type: RelationType.MANY_TO_ONE,
          },
        ],
      },
      // {
      //   name: 'oneToManyRelationField',
      //   label: 'oneToManyRelationField',
      //   type: FieldMetadataType.RELATION,
      //   objectMetadataId,
      //   relationCreationPayload: {
      //     targetObjectMetadataId: targetObjectMetadata1Id,
      //     targetFieldLabel: 'manyToOneTargetRelationField',
      //     targetFieldIcon: 'IconListOpportunity',
      //     type: RelationType.ONE_TO_MANY,
      //   },
      // },
    ],
  };

  return Object.values(fieldInputsMap).flat();
};
