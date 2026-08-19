import { randomUUID } from 'crypto';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { createMorphRelationBetweenObjects } from 'test/integration/metadata/suites/object-metadata/utils/create-morph-relation-between-objects.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

type MorphParentConnection = {
  edges: {
    node: { id: string; ownerMorphCursorPerson?: { name: string } | null };
  }[];
  pageInfo: { hasNextPage: boolean; endCursor: string };
};

// A MANY_TO_ONE morph relation materializes one relation field per target
// (owner -> ownerMorphCursorPerson / ownerMorphCursorCompany), so ordering by
// one leg must treat records attached to the other leg - and unattached ones -
// as the NULL block of the scan.
describe('morph relation cursor pagination', () => {
  let parentObjectMetadataId = '';
  let personObjectMetadataId = '';
  let companyObjectMetadataId = '';

  const personTargetIds = [randomUUID(), randomUUID(), randomUUID()];
  const companyTargetIds = [randomUUID(), randomUUID()];
  const personAttachedParentIds = [randomUUID(), randomUUID(), randomUUID()];
  const companyAttachedParentIds = [randomUUID(), randomUUID()];
  const unattachedParentIds = [randomUUID(), randomUUID()];
  const parentTotalCount =
    personAttachedParentIds.length +
    companyAttachedParentIds.length +
    unattachedParentIds.length;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: createdParentId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'morphCursorParent',
        namePlural: 'morphCursorParents',
        labelSingular: 'Morph Cursor Parent',
        labelPlural: 'Morph Cursor Parents',
        icon: 'IconBox',
      },
    });

    parentObjectMetadataId = createdParentId;

    const {
      data: {
        createOneObject: { id: createdPersonId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'morphCursorPerson',
        namePlural: 'morphCursorPeople',
        labelSingular: 'Morph Cursor Person',
        labelPlural: 'Morph Cursor People',
        icon: 'IconPerson',
      },
    });

    personObjectMetadataId = createdPersonId;

    const {
      data: {
        createOneObject: { id: createdCompanyId },
      },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'morphCursorCompany',
        namePlural: 'morphCursorCompanies',
        labelSingular: 'Morph Cursor Company',
        labelPlural: 'Morph Cursor Companies',
        icon: 'IconCompany',
      },
    });

    companyObjectMetadataId = createdCompanyId;

    await createMorphRelationBetweenObjects({
      objectMetadataId: parentObjectMetadataId,
      firstTargetObjectMetadataId: personObjectMetadataId,
      secondTargetObjectMetadataId: companyObjectMetadataId,
      type: FieldMetadataType.MORPH_RELATION,
      relationType: RelationType.MANY_TO_ONE,
      name: 'owner',
      label: 'Owner',
    });

    await makeGraphqlAPIRequestWithApiKey(
      createManyOperationFactory({
        objectMetadataSingularName: 'morphCursorPerson',
        objectMetadataPluralName: 'morphCursorPeople',
        gqlFields: 'id',
        data: personTargetIds.map((id, index) => ({
          id,
          name: `Person target ${index + 1}`,
        })),
      }),
    ).expect(200);

    await makeGraphqlAPIRequestWithApiKey(
      createManyOperationFactory({
        objectMetadataSingularName: 'morphCursorCompany',
        objectMetadataPluralName: 'morphCursorCompanies',
        gqlFields: 'id',
        data: companyTargetIds.map((id, index) => ({
          id,
          name: `Company target ${index + 1}`,
        })),
      }),
    ).expect(200);

    await makeGraphqlAPIRequestWithApiKey(
      createManyOperationFactory({
        objectMetadataSingularName: 'morphCursorParent',
        objectMetadataPluralName: 'morphCursorParents',
        gqlFields: 'id',
        data: [
          ...personAttachedParentIds.map((id, index) => ({
            id,
            name: `Person-attached parent ${index + 1}`,
            ownerMorphCursorPersonId: personTargetIds[index],
          })),
          ...companyAttachedParentIds.map((id, index) => ({
            id,
            name: `Company-attached parent ${index + 1}`,
            ownerMorphCursorCompanyId: companyTargetIds[index],
          })),
          ...unattachedParentIds.map((id, index) => ({
            id,
            name: `Unattached parent ${index + 1}`,
          })),
        ],
      }),
    ).expect(200);
  });

  afterAll(async () => {
    for (const objectMetadataId of [
      parentObjectMetadataId,
      personObjectMetadataId,
      companyObjectMetadataId,
    ]) {
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
    }
  });

  const collectAllPages = async (gqlFields: string) => {
    const collectedIds: string[] = [];
    const collectedOwnerNames: (string | null)[] = [];
    let after: string | undefined = undefined;

    for (let iteration = 0; iteration < 10; iteration++) {
      const response: {
        body: {
          errors?: unknown;
          data: { morphCursorParents: MorphParentConnection };
        };
      } = await makeGraphqlAPIRequestWithApiKey(
        findManyOperationFactory({
          objectMetadataSingularName: 'morphCursorParent',
          objectMetadataPluralName: 'morphCursorParents',
          gqlFields,
          orderBy: { ownerMorphCursorPerson: { name: 'AscNullsLast' } },
          first: 2,
          after,
        }),
      ).expect(200);

      expect(response.body.errors).toBeUndefined();

      const connection = response.body.data.morphCursorParents;

      for (const edge of connection.edges) {
        collectedIds.push(edge.node.id);
        collectedOwnerNames.push(
          edge.node.ownerMorphCursorPerson?.name ?? null,
        );
      }

      if (!connection.pageInfo.hasNextPage) {
        break;
      }

      after = connection.pageInfo.endCursor;
    }

    expect(collectedIds).toHaveLength(parentTotalCount);
    expect(new Set(collectedIds).size).toBe(parentTotalCount);
    expect(collectedIds.slice(0, personAttachedParentIds.length)).toEqual(
      personAttachedParentIds,
    );

    return { collectedIds, collectedOwnerNames };
  };

  it('should paginate exhaustively when ordering by one morph leg', async () => {
    const { collectedIds, collectedOwnerNames } = await collectAllPages(`
      id
      ownerMorphCursorPerson {
        name
      }
    `);

    expect(new Set(collectedIds.slice(personAttachedParentIds.length))).toEqual(
      new Set([...companyAttachedParentIds, ...unattachedParentIds]),
    );
    expect(collectedOwnerNames.slice(personAttachedParentIds.length)).toEqual(
      Array(parentTotalCount - personAttachedParentIds.length).fill(null),
    );
  });

  // Cursors read the morph leg's orderBy values from the ordering join itself,
  // so pagination must not depend on the selection set (issue #24333)
  it('should paginate exhaustively when the ordered morph leg is not selected', async () => {
    await collectAllPages('id');
  });
});
