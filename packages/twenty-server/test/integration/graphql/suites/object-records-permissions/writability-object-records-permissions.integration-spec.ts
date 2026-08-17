import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { MetadataWritability } from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const setObjectWritability = async (
  objectMetadataId: string,
  writability: MetadataWritability,
) => {
  const objectMetadataRepository =
    getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);

  await objectMetadataRepository.update(objectMetadataId, { writability });

  await global.app
    .get(WorkspaceCacheService)
    .invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatObjectMetadataMaps',
    ]);
};

const setFieldWritability = async (
  fieldMetadataId: string,
  writability: MetadataWritability,
) => {
  const fieldMetadataRepository =
    getCoreRepository<FieldMetadataEntity>(FieldMetadataEntity);

  await fieldMetadataRepository.update(fieldMetadataId, { writability });

  await global.app
    .get(WorkspaceCacheService)
    .invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatFieldMetadataMaps']);
};

describe('writabilityObjectRecordsPermissions', () => {
  let personObjectMetadataId: string;
  let personIntroFieldMetadataId: string;
  let createdPersonId: string;

  beforeAll(async () => {
    const objectMetadataRepository =
      getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);
    const personObjectMetadata = await objectMetadataRepository.findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        nameSingular: 'person',
      },
    });

    personObjectMetadataId = personObjectMetadata.id;

    const fieldMetadataRepository =
      getCoreRepository<FieldMetadataEntity>(FieldMetadataEntity);
    const personIntroFieldMetadata =
      await fieldMetadataRepository.findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: personObjectMetadataId,
          name: 'intro',
        },
      });

    personIntroFieldMetadataId = personIntroFieldMetadata.id;

    createdPersonId = randomUUID();

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: { id: createdPersonId },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createPerson.id).toBe(createdPersonId);
  });

  afterAll(async () => {
    await setObjectWritability(
      personObjectMetadataId,
      MetadataWritability.OPEN,
    );
    await setFieldWritability(
      personIntroFieldMetadataId,
      MetadataWritability.OPEN,
    );
    await deleteRecordsByIds('person', [createdPersonId]);
  });

  describe('SYSTEM object writability', () => {
    beforeAll(async () => {
      await setObjectWritability(
        personObjectMetadataId,
        MetadataWritability.SYSTEM,
      );
    });

    afterAll(async () => {
      await setObjectWritability(
        personObjectMetadataId,
        MetadataWritability.OPEN,
      );
    });

    it('should refuse record creation even for an admin', async () => {
      const graphqlOperation = createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: { id: randomUUID() },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should refuse record update even for an admin', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: createdPersonId,
        data: { intro: 'A short intro' },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should keep records readable', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: PERSON_GQL_FIELDS,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.people.edges.length).toBeGreaterThan(0);
    });
  });

  describe('SYSTEM field writability on an OPEN object', () => {
    beforeAll(async () => {
      await setFieldWritability(
        personIntroFieldMetadataId,
        MetadataWritability.SYSTEM,
      );
    });

    afterAll(async () => {
      await setFieldWritability(
        personIntroFieldMetadataId,
        MetadataWritability.OPEN,
      );
    });

    it('should refuse writes to the protected field', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: createdPersonId,
        data: { intro: 'A short intro' },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should allow writes to other fields of the same object', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: createdPersonId,
        data: { jobTitle: 'CTO' },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updatePerson.jobTitle).toBe('CTO');
    });
  });

  describe('OPEN writability', () => {
    it('should keep record writes working as before', async () => {
      const graphqlOperation = updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        recordId: createdPersonId,
        data: { intro: 'An updated intro' },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updatePerson.intro).toBe('An updated intro');
    });
  });
});
