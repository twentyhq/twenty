import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { createRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-relation-between-objects.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const OBJECT_NAME_SINGULAR = 'groupByManyFields';
const OBJECT_NAME_PLURAL = 'groupByManyFieldsRecords';
// JSON_BUILD_OBJECT caps out at 50 key/value pairs, so the selection below has to
// stay above 50 columns: 6 address fields x 8 subfields + 5 scalars = 53.
const ADDRESS_FIELD_NAMES = [
  'shippingAddress',
  'billingAddress',
  'deliveryAddress',
  'officeAddress',
  'warehouseAddress',
  'returnAddress',
];
// `record` collides with the alias a ROW_TO_JSON-based projection would need.
const SHADOWING_FIELD_NAME = 'record';
const ADDRESS_VALUES = Object.fromEntries(
  ADDRESS_FIELD_NAMES.map((fieldName) => [
    fieldName,
    {
      addressStreet1: `${fieldName} street`,
      addressStreet2: '',
      addressCity: 'Paris',
      addressState: 'Ile-de-France',
      addressCountry: 'France',
      addressPostcode: '75001',
      addressLat: 48.8566,
      addressLng: 2.3522,
    },
  ]),
);
const RECORDS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((position) => ({
  id: randomUUID(),
  name: `Record ${position}`,
  position,
  companyId: null,
  [SHADOWING_FIELD_NAME]: `Shadowing value ${position}`,
  ...ADDRESS_VALUES,
}));
const ORDERED_RECORDS = [...RECORDS].reverse();
const RECORD_GQL_FIELDS = `
  id
  name
  position
  companyId
  ${SHADOWING_FIELD_NAME}
  ${ADDRESS_FIELD_NAMES.map(
    (fieldName) => `
      ${fieldName} {
        addressStreet1
        addressStreet2
        addressCity
        addressState
        addressCountry
        addressPostcode
        addressLat
        addressLng
      }
    `,
  ).join('\n')}
`;

describe('group-by with more than 50 selected record columns', () => {
  let objectMetadataId: string | undefined;

  beforeAll(async () => {
    const { data, errors } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: OBJECT_NAME_PLURAL,
        labelSingular: 'Group By Many Fields',
        labelPlural: 'Group By Many Fields Records',
        isLabelSyncedWithName: false,
      },
    });

    expect(errors).toBeUndefined();
    objectMetadataId = data.createOneObject.id;

    for (const fieldName of ADDRESS_FIELD_NAMES) {
      const { errors: fieldErrors } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId,
          type: FieldMetadataType.ADDRESS,
          name: fieldName,
          label: fieldName,
          isLabelSyncedWithName: false,
        },
      });

      expect(fieldErrors).toBeUndefined();
    }

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        objectMetadataId,
        type: FieldMetadataType.TEXT,
        name: SHADOWING_FIELD_NAME,
        label: SHADOWING_FIELD_NAME,
        isLabelSyncedWithName: false,
      },
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 100 } },
      gqlFields: 'id nameSingular',
    });
    const companyObject = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    );

    if (!isDefined(companyObject)) {
      throw new Error('Company object not found');
    }

    await createRelationBetweenObjects({
      objectMetadataId,
      targetObjectMetadataId: companyObject.id,
      type: FieldMetadataType.RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'company',
      targetFieldLabel: 'Group By Many Fields Records',
    });

    const response = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME_SINGULAR,
        objectMetadataPluralName: OBJECT_NAME_PLURAL,
        gqlFields: 'id',
        data: RECORDS,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    if (!isDefined(objectMetadataId)) {
      return;
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it.each([
    { offsetForRecords: 0, expectedRecords: ORDERED_RECORDS.slice(0, 10) },
    { offsetForRecords: 10, expectedRecords: ORDERED_RECORDS.slice(10) },
  ])(
    'preserves composite fields and position ordering in the null relation group at offset $offsetForRecords',
    async ({ offsetForRecords, expectedRecords }) => {
      const response = await makeGraphqlAPIRequest(
        groupByOperationFactory({
          objectMetadataSingularName: OBJECT_NAME_SINGULAR,
          objectMetadataPluralName: OBJECT_NAME_PLURAL,
          groupBy: [{ companyId: true }],
          filter: { or: [{ companyId: { is: 'NULL' } }] },
          orderByForRecords: [{ position: 'AscNullsFirst' }],
          limit: 1,
          offsetForRecords,
          gqlFields: `edges { node { ${RECORD_GQL_FIELDS} } }`,
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data[`${OBJECT_NAME_PLURAL}GroupBy`]).toEqual([
        {
          groupByDimensionValues: [null],
          totalCount: RECORDS.length,
          edges: expectedRecords.map((record) => ({ node: record })),
        },
      ]);
    },
  );
});
