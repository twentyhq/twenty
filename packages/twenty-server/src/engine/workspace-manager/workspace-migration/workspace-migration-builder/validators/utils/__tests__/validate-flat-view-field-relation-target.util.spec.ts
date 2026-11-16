import {
  AggregateOperations,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { validateFlatViewFieldRelationTarget } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target.util';

const companyRelationFlatFieldMetadata = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
  objectMetadataUniversalIdentifier: 'person-object',
  relationTargetObjectMetadataUniversalIdentifier: 'company-object',
} as UniversalFlatFieldMetadata;

const peopleRelationFlatFieldMetadata = {
  type: FieldMetadataType.RELATION,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  objectMetadataUniversalIdentifier: 'company-object',
  relationTargetObjectMetadataUniversalIdentifier: 'person-object',
} as UniversalFlatFieldMetadata;

const buildPersonFlatFieldMetadata = ({
  name,
  type,
  isActive = true,
  objectMetadataUniversalIdentifier = 'person-object',
}: {
  name: string;
  type: FieldMetadataType;
  isActive?: boolean;
  objectMetadataUniversalIdentifier?: string;
}) =>
  ({
    universalIdentifier: `${name}-field`,
    name,
    type,
    objectMetadataUniversalIdentifier,
    isActive,
  }) as UniversalFlatFieldMetadata;

const PERSON_FLAT_FIELD_METADATAS = [
  buildPersonFlatFieldMetadata({
    name: 'salary',
    type: FieldMetadataType.CURRENCY,
  }),
  buildPersonFlatFieldMetadata({ name: 'age', type: FieldMetadataType.NUMBER }),
  buildPersonFlatFieldMetadata({
    name: 'birthday',
    type: FieldMetadataType.DATE,
  }),
  buildPersonFlatFieldMetadata({
    name: 'jobTitle',
    type: FieldMetadataType.TEXT,
  }),
  buildPersonFlatFieldMetadata({
    name: 'score',
    type: FieldMetadataType.NUMBER,
    isActive: false,
  }),
  buildPersonFlatFieldMetadata({
    name: 'company',
    type: FieldMetadataType.RELATION,
  }),
  buildPersonFlatFieldMetadata({
    name: 'employees',
    type: FieldMetadataType.NUMBER,
    objectMetadataUniversalIdentifier: 'company-object',
  }),
];

const personFlatFieldMetadataMaps = {
  byUniversalIdentifier: Object.fromEntries(
    PERSON_FLAT_FIELD_METADATAS.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
};

const validateAggregate = ({
  relationAggregateOperation,
  relationTargetFieldMetadataUniversalIdentifier = null,
  isCanonical = false,
  flatFieldMetadata = peopleRelationFlatFieldMetadata,
}: {
  relationAggregateOperation: AggregateOperations;
  relationTargetFieldMetadataUniversalIdentifier?: string | null;
  isCanonical?: boolean;
  flatFieldMetadata?: UniversalFlatFieldMetadata;
}) =>
  validateFlatViewFieldRelationTarget({
    flatViewField: {
      isCanonical,
      relationTargetFieldMetadataUniversalIdentifier,
      relationAggregateOperation,
    },
    flatFieldMetadata,
    flatFieldMetadataMaps: personFlatFieldMetadataMaps,
  });

// The GraphQL input resolves the target by id, so only an application manifest can name a field that does not exist.
describe('validateFlatViewFieldRelationTarget', () => {
  it('rejects a related record field missing from the workspace', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'missing-field',
          relationAggregateOperation: null,
        },
        flatFieldMetadata: companyRelationFlatFieldMetadata,
        flatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toMatchObject([
      {
        message: expect.stringContaining(
          'must belong to the relation target object',
        ),
      },
    ]);
  });

  it('rejects a deactivated related record field', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'industry-field',
          relationAggregateOperation: null,
        },
        flatFieldMetadata: companyRelationFlatFieldMetadata,
        flatFieldMetadataMaps: {
          byUniversalIdentifier: {
            'industry-field': {
              universalIdentifier: 'industry-field',
              type: FieldMetadataType.TEXT,
              objectMetadataUniversalIdentifier: 'company-object',
              isActive: false,
            } as UniversalFlatFieldMetadata,
          },
        },
      }),
    ).toMatchObject([{ message: expect.stringContaining('must be active') }]);
  });

  it('rejects a related record field on a one-to-many relation without an aggregate', () => {
    expect(
      validateFlatViewFieldRelationTarget({
        flatViewField: {
          isCanonical: false,
          relationTargetFieldMetadataUniversalIdentifier: 'age-field',
          relationAggregateOperation: null,
        },
        flatFieldMetadata: peopleRelationFlatFieldMetadata,
        flatFieldMetadataMaps: personFlatFieldMetadataMaps,
      }),
    ).toMatchObject([
      { message: expect.stringContaining('many-to-one relation field') },
    ]);
  });

  describe('relation aggregate', () => {
    it.each([
      { relationAggregateOperation: AggregateOperations.COUNT },
      {
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'age-field',
      },
      {
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'salary-field',
      },
      {
        relationAggregateOperation: AggregateOperations.AVG,
        relationTargetFieldMetadataUniversalIdentifier: 'salary-field',
      },
      {
        relationAggregateOperation: AggregateOperations.MIN,
        relationTargetFieldMetadataUniversalIdentifier: 'birthday-field',
      },
      {
        relationAggregateOperation: AggregateOperations.MAX,
        relationTargetFieldMetadataUniversalIdentifier: 'age-field',
      },
    ])(
      'accepts $relationAggregateOperation on $relationTargetFieldMetadataUniversalIdentifier',
      (aggregateArguments) => {
        expect(validateAggregate(aggregateArguments)).toEqual([]);
      },
    );

    it.each([
      {
        title: 'a canonical view field',
        relationAggregateOperation: AggregateOperations.COUNT,
        isCanonical: true,
        expectedMessage: 'Only non-canonical view fields',
      },
      {
        title: 'a many-to-one relation field',
        relationAggregateOperation: AggregateOperations.COUNT,
        flatFieldMetadata: companyRelationFlatFieldMetadata,
        expectedMessage: 'one-to-many relation field',
      },
      {
        title: 'a non-relation field',
        relationAggregateOperation: AggregateOperations.COUNT,
        flatFieldMetadata: PERSON_FLAT_FIELD_METADATAS[1],
        expectedMessage: 'one-to-many relation field',
      },
      {
        title: 'a count with a related record field',
        relationAggregateOperation: AggregateOperations.COUNT,
        relationTargetFieldMetadataUniversalIdentifier: 'age-field',
        expectedMessage: 'count of related records cannot',
      },
      {
        title: 'a sum without a related record field',
        relationAggregateOperation: AggregateOperations.SUM,
        expectedMessage: 'requires a related record field',
      },
      {
        title: 'an unsupported operation',
        relationAggregateOperation: AggregateOperations.COUNT_EMPTY,
        relationTargetFieldMetadataUniversalIdentifier: 'age-field',
        expectedMessage: 'not supported on related records',
      },
      {
        title: 'a sum on a text field',
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'jobTitle-field',
        expectedMessage: 'does not support this aggregate operation',
      },
      {
        title: 'a sum on a date field',
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'birthday-field',
        expectedMessage: 'does not support this aggregate operation',
      },
      {
        title: 'a field of another object',
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'employees-field',
        expectedMessage: 'must belong to the relation target object',
      },
      {
        title: 'a deactivated field',
        relationAggregateOperation: AggregateOperations.SUM,
        relationTargetFieldMetadataUniversalIdentifier: 'score-field',
        expectedMessage: 'must be active',
      },
      {
        title: 'a relation field',
        relationAggregateOperation: AggregateOperations.MAX,
        relationTargetFieldMetadataUniversalIdentifier: 'company-field',
        expectedMessage: 'cannot be a relation',
      },
    ])(
      'rejects $title',
      ({ title: _title, expectedMessage, ...aggregateArguments }) => {
        expect(validateAggregate(aggregateArguments)).toMatchObject([
          { message: expect.stringContaining(expectedMessage) },
        ]);
      },
    );
  });
});
