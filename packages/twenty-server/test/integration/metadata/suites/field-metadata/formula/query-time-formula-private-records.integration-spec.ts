import { randomUUID } from 'node:crypto';

import { parse } from 'graphql';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

const OBJECT_NAME = 'privateFormulaRecord';
const OBJECT_PLURAL = 'privateFormulaRecords';
const PUBLIC_RECORD_ID = randomUUID();
const PRIVATE_RECORD_ID = randomUUID();
const SET_PRIVATE = parse(
  `mutation SetPrivate($target: RecordTargetInput!, $isPrivate: Boolean!) { setRecordPrivate(target: $target, isPrivate: $isPrivate) { isPrivate } }`,
);

describe('Query-time formula on an object with private records', () => {
  let objectMetadataId: string;

  const findRecords = async (token: string) => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: OBJECT_NAME,
        objectMetadataPluralName: OBJECT_PLURAL,
        gqlFields: 'id constantFormula',
      }),
      token,
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data[OBJECT_PLURAL].edges.map(
      ({ node }: { node: { id: string; constantFormula: number } }) => node,
    );
  };

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
      value: true,
      expectToFail: false,
    });

    objectMetadataId = (
      await createOneObjectMetadata({
        expectToFail: false,
        input: {
          nameSingular: OBJECT_NAME,
          namePlural: OBJECT_PLURAL,
          labelSingular: 'Private formula record',
          labelPlural: 'Private formula records',
          icon: 'IconLock',
          isLabelSyncedWithName: false,
        },
      })
    ).data.createOneObject.id;

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'constantFormula',
        label: 'Constant formula',
        type: FieldMetadataType.NUMBER,
        objectMetadataId,
        isLabelSyncedWithName: false,
        settings: { formula: { expression: '1' } },
      },
    });

    for (const id of [PUBLIC_RECORD_ID, PRIVATE_RECORD_ID]) {
      const created = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_NAME,
          gqlFields: 'id constantFormula',
          data: { id },
        }),
      );

      expect(created.body.errors).toBeUndefined();
    }

    const privateRecord = await makeMetadataApiRequest({
      query: SET_PRIVATE,
      variables: {
        target: { objectMetadataId, recordId: PRIVATE_RECORD_ID },
        isPrivate: true,
      },
    });

    expect(privateRecord.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED,
      value: false,
      expectToFail: false,
    });
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

  it('should read the formula on every record its creator can see', async () => {
    expect(await findRecords(APPLE_JANE_ADMIN_ACCESS_TOKEN)).toEqual(
      expect.arrayContaining([
        { id: PUBLIC_RECORD_ID, constantFormula: 1 },
        { id: PRIVATE_RECORD_ID, constantFormula: 1 },
      ]),
    );
  });

  it('should read the formula and keep hiding the private record from someone else', async () => {
    expect(await findRecords(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual([
      { id: PUBLIC_RECORD_ID, constantFormula: 1 },
    ]);
  });
});
