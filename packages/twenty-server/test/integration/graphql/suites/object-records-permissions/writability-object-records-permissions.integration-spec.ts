import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FieldMetadataType, MetadataWritability } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

const OBJECT_SINGULAR = 'writabilityTestObject';
const OBJECT_PLURAL = 'writabilityTestObjects';
const UPDATE_RESPONSE_KEY = 'updateWritabilityTestObject';
const RECORD_GQL_FIELDS = `
  id
  guardedField
  freeField
`;

// Writability has no API surface by design, so tests write the column
// directly, then issue a no-op metadata update through the API: the
// migration runner recomputes the workspace flat maps from the database,
// which picks up the new writability value.
const setObjectWritability = async (
  objectMetadataId: string,
  writability: MetadataWritability,
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { writability },
  );

  const { errors } = await updateOneObjectMetadata({
    expectToFail: false,
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: { description: `writability set to ${writability}` },
    },
  });

  expect(errors).toBeUndefined();
};

const setFieldWritability = async (
  fieldMetadataId: string,
  writability: MetadataWritability,
) => {
  await getCoreRepository<FieldMetadataEntity>(FieldMetadataEntity).update(
    fieldMetadataId,
    { writability },
  );

  const { errors } = await updateOneFieldMetadata({
    expectToFail: false,
    input: {
      idToUpdate: fieldMetadataId,
      updatePayload: { description: `writability set to ${writability}` },
    },
  });

  expect(errors).toBeUndefined();
};

describe('writabilityObjectRecordsPermissions', () => {
  let objectMetadataId: string;
  let guardedFieldMetadataId: string;
  let recordId: string;

  beforeAll(async () => {
    const { data } = await createOneObjectMetadata({
      input: {
        nameSingular: OBJECT_SINGULAR,
        namePlural: OBJECT_PLURAL,
        labelSingular: 'Writability Test Object',
        labelPlural: 'Writability Test Objects',
        icon: 'IconLock',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = data.createOneObject.id;

    const { data: guardedFieldData } = await createOneFieldMetadata({
      input: {
        name: 'guardedField',
        label: 'Guarded Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
    });

    guardedFieldMetadataId = guardedFieldData.createOneField.id;

    await createOneFieldMetadata({
      input: {
        name: 'freeField',
        label: 'Free Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
    });

    recordId = randomUUID();

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: OBJECT_SINGULAR,
        gqlFields: RECORD_GQL_FIELDS,
        data: { id: recordId },
      }),
    );

    expect(response.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await setObjectWritability(objectMetadataId, MetadataWritability.OPEN);
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
    });
  });

  describe('SYSTEM object writability', () => {
    beforeAll(async () => {
      await setObjectWritability(objectMetadataId, MetadataWritability.SYSTEM);
    });

    afterAll(async () => {
      await setObjectWritability(objectMetadataId, MetadataWritability.OPEN);
    });

    it('should refuse record creation even for an admin', async () => {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          data: { id: randomUUID() },
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should refuse record update even for an admin', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          recordId,
          data: { guardedField: 'blocked' },
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should keep records readable', async () => {
      const response = await makeGraphqlAPIRequest(
        findManyOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          objectMetadataPluralName: OBJECT_PLURAL,
          gqlFields: RECORD_GQL_FIELDS,
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data[OBJECT_PLURAL].edges.length).toBeGreaterThan(0);
    });
  });

  describe('SYSTEM field writability on an OPEN object', () => {
    beforeAll(async () => {
      await setFieldWritability(
        guardedFieldMetadataId,
        MetadataWritability.SYSTEM,
      );
    });

    afterAll(async () => {
      await setFieldWritability(
        guardedFieldMetadataId,
        MetadataWritability.OPEN,
      );
    });

    it('should refuse writes to the protected field', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          recordId,
          data: { guardedField: 'blocked' },
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should allow writes to other fields of the same object', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          recordId,
          data: { freeField: 'allowed' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data[UPDATE_RESPONSE_KEY].freeField).toBe('allowed');
    });
  });

  describe('OPEN writability', () => {
    it('should keep record writes working as before', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: OBJECT_SINGULAR,
          gqlFields: RECORD_GQL_FIELDS,
          recordId,
          data: { guardedField: 'open again' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data[UPDATE_RESPONSE_KEY].guardedField).toBe(
        'open again',
      );
    });
  });
});
