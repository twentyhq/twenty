/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

const NOTE_ID = randomUUID();
const PERSON_ID = randomUUID();
const NOTE_TARGET_ID = randomUUID();
const ATTACHMENT_ID = randomUUID();
const NOTE_TITLE = `Discoverable note ${randomUUID()}`;

// Enough of Jony's session for the ORM to resolve his role and principals.
const JONY_AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: SEED_APPLE_WORKSPACE_ID },
  userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
  user: { id: USER_DATA_SEED_IDS.JONY },
  workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
  workspaceMember: { id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY },
} as UserWorkspaceAuthContext;

const findObjectMetadata = (nameSingular: string) =>
  getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).findOneOrFail({
    where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular },
  });

const setDiscoverableFields = async (
  objectMetadataId: string,
  discoverableFieldUniversalIdentifiers: string[] | null,
) => {
  await getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity).update(
    objectMetadataId,
    { discoverableFieldUniversalIdentifiers },
  );

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatObjectMetadataMaps']);
};

const readAsJony = <TResult>(
  work: (workspaceOrmManager: WorkspaceOrmManager) => Promise<TResult>,
): Promise<TResult> => {
  const workspaceOrmManager = getAppProviderByClassName<WorkspaceOrmManager>(
    'WorkspaceOrmManager',
  );

  return workspaceOrmManager.executeInWorkspaceContext(
    () => work(workspaceOrmManager),
    JONY_AUTH_CONTEXT,
  );
};

const discoverAsJony = (objectMetadataName: string, columns: string[]) =>
  readAsJony((workspaceOrmManager) =>
    workspaceOrmManager
      .getRepositoryWithContextPermissions(
        objectMetadataName,
        undefined,
        'existence',
      )
      .createQueryBuilder('record')
      .select(columns)
      .where('record.id IN (:...ids)', {
        ids: [NOTE_ID, NOTE_TARGET_ID, ATTACHMENT_ID],
      })
      .getMany<{ id: string }>(),
  );

const findNoteIdsAsJony = async () => {
  const response = await makeGraphqlApiRequestWithMemberRole(
    findManyOperationFactory({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      gqlFields: 'id title',
      filter: { id: { eq: NOTE_ID } },
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.notes.edges.map(
    (edge: { node: { id: string } }) => edge.node.id,
  );
};

const discoverNotesAsJonyThroughGraphql = (gqlFields: string) =>
  makeGraphqlApiRequestWithMemberRole({
    query: gql`
      query DiscoverNotes($id: UUID) {
        notes(discover: true, filter: { id: { eq: $id } }) {
          totalCount
          edges {
            node {
              ${gqlFields}
            }
          }
        }
      }
    `,
    variables: { id: NOTE_ID },
  });

const discoverAsJonyThroughRest = (path: string) =>
  makeRestApiRequest({
    method: 'get',
    path,
    bearer: APPLE_JONY_MEMBER_ACCESS_TOKEN,
  });

describe('DISCOVERABLE readability (integration)', () => {
  let noteObjectMetadata: ObjectMetadataEntity;
  let noteTargetObjectMetadata: ObjectMetadataEntity;

  beforeAll(async () => {
    noteObjectMetadata = await findObjectMetadata('note');
    noteTargetObjectMetadata = await findObjectMetadata('noteTarget');

    for (const { objectMetadataSingularName, data } of [
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ID, title: NOTE_TITLE },
      },
      {
        objectMetadataSingularName: 'person',
        data: { id: PERSON_ID, name: { firstName: 'Discoverable' } },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_ID,
          noteId: NOTE_ID,
          targetPersonId: PERSON_ID,
        },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: {
          id: ATTACHMENT_ID,
          name: 'discoverable-note.pdf',
          targetNoteId: NOTE_ID,
        },
      },
    ]) {
      const response = await makeGraphqlApiRequest(
        createOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          data,
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await setObjectReadability(
      noteObjectMetadata.id,
      MetadataReadability.DISCOVERABLE,
    );
    await setDiscoverableFields(noteTargetObjectMetadata.id, [
      STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
      STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
    ]);
  });

  afterAll(async () => {
    await setDiscoverableFields(
      noteTargetObjectMetadata.id,
      noteTargetObjectMetadata.discoverableFieldUniversalIdentifiers,
    );
    await setObjectReadability(
      noteObjectMetadata.id,
      noteObjectMetadata.readability,
    );

    for (const [singular, plural, ids] of [
      ['attachment', 'attachments', [ATTACHMENT_ID]],
      ['noteTarget', 'noteTargets', [NOTE_TARGET_ID]],
      ['note', 'notes', [NOTE_ID]],
      ['person', 'people', [PERSON_ID]],
    ] as const) {
      await makeGraphqlApiRequest(
        destroyManyOperationFactory({
          objectMetadataSingularName: singular,
          objectMetadataPluralName: plural,
          gqlFields: 'id',
          filter: { id: { in: [...ids] } },
        }),
      );
    }
  });

  it('hides a record from ordinary reads without a grant', async () => {
    expect(await findNoteIdsAsJony()).toEqual([]);
  });

  it('lets an existence read find it by its discoverable fields', async () => {
    expect(await discoverAsJony('note', ['id', 'createdAt'])).toEqual([
      expect.objectContaining({ id: NOTE_ID }),
    ]);
  });

  it('refuses an existence read that selects another field', async () => {
    await expect(discoverAsJony('note', ['id', 'title'])).rejects.toThrow(
      'no permission to read field "title" on "note"',
    );
  });

  it('refuses an existence read that filters on another field', async () => {
    await expect(
      readAsJony((workspaceOrmManager) =>
        workspaceOrmManager
          .getRepositoryWithContextPermissions('note', undefined, 'existence')
          .createQueryBuilder('note')
          .select(['id'])
          .where('note.title = :title', { title: NOTE_TITLE })
          .getMany(),
      ),
    ).rejects.toThrow('no permission to read field "title" on "note"');
  });

  it('refuses an existence read that orders by another field', async () => {
    await expect(
      readAsJony((workspaceOrmManager) =>
        workspaceOrmManager
          .getRepositoryWithContextPermissions('note', undefined, 'existence')
          .find({ select: { id: true }, order: { title: 'ASC' } }),
      ),
    ).rejects.toThrow('no permission to read field "title" on "note"');
  });

  it('refuses an existence read that joins and selects another field', async () => {
    await expect(
      readAsJony((workspaceOrmManager) =>
        workspaceOrmManager
          .getRepositoryWithContextPermissions(
            'noteTarget',
            undefined,
            'existence',
          )
          .createQueryBuilder('noteTarget')
          .select(['id'])
          .leftJoinAndSelect('noteTarget.note', 'note')
          .where('noteTarget.id = :id', { id: NOTE_TARGET_ID })
          .getMany(),
      ),
    ).rejects.toThrow(/no permission to read field "\w+" on "note"/);
  });

  it('discovers a child that declares discoverable fields through its parent', async () => {
    expect(
      await discoverAsJony('noteTarget', ['id', 'noteId', 'targetPersonId']),
    ).toEqual([
      expect.objectContaining({
        id: NOTE_TARGET_ID,
        targetPersonId: PERSON_ID,
      }),
    ]);
  });

  it('does not discover a child that declares no discoverable fields', async () => {
    expect(await discoverAsJony('attachment', ['id', 'name'])).toEqual([]);
  });

  it('lets GraphQL discover the record with its discoverable fields', async () => {
    const response = await discoverNotesAsJonyThroughGraphql('id createdAt');

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.notes.totalCount).toBe(1);
    expect(response.body.data.notes.edges).toEqual([
      { node: { id: NOTE_ID, createdAt: expect.any(String) } },
    ]);
  });

  it('lets GraphQL discover declared relations of a discovered record', async () => {
    const response = await makeGraphqlApiRequestWithMemberRole({
      query: gql`
        query DiscoverNotesWithTargets($id: UUID) {
          notes(discover: true, first: 1, filter: { id: { eq: $id } }) {
            edges {
              node {
                id
                noteTargets {
                  edges {
                    node {
                      id
                      targetPersonId
                    }
                  }
                }
              }
            }
            pageInfo {
              endCursor
            }
          }
        }
      `,
      variables: { id: NOTE_ID },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.notes.pageInfo.endCursor).toEqual(
      expect.any(String),
    );
    expect(response.body.data.notes.edges).toEqual([
      {
        node: {
          id: NOTE_ID,
          noteTargets: {
            edges: [
              { node: { id: NOTE_TARGET_ID, targetPersonId: PERSON_ID } },
            ],
          },
        },
      },
    ]);
  });

  it('refuses a GraphQL discover query that selects another field', async () => {
    const response = await discoverNotesAsJonyThroughGraphql('id title');

    expect(response.body.data?.notes ?? null).toBeNull();
    expect(response.body.errors?.[0]?.message).toContain('title');
  });

  it.each([true, false])(
    'refuses GraphQL discover: %s on other objects',
    async (discover) => {
      const response = await makeGraphqlApiRequestWithMemberRole({
        query: gql`
        query DiscoverTasks {
          tasks(discover: ${discover}) {
            totalCount
          }
        }
      `,
      });

      expect(response.body.errors?.[0]?.message).toBe(
        'Records of tasks cannot be discovered',
      );
    },
  );

  it('lets REST discover the record with only its discoverable fields', async () => {
    const response = await discoverAsJonyThroughRest(
      `/notes?discover=true&depth=0&filter=id[eq]:${NOTE_ID}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toEqual([
      {
        id: NOTE_ID,
        createdAt: expect.any(String),
        createdBy: expect.any(Object),
      },
    ]);
  });

  it.each(['true', 'false'])(
    'refuses REST discover=%s on other objects',
    async (discover) => {
      const response = await discoverAsJonyThroughRest(
        `/tasks?discover=${discover}`,
      );

      expect(response.status).toBe(400);
    },
  );

  it('refuses REST discovery with an invalid value', async () => {
    const response = await discoverAsJonyThroughRest('/notes?discover=yes');

    expect(response.status).toBe(400);
  });

  it('shows the record to ordinary reads once it is shared', async () => {
    const recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );
    const sourceId = randomUUID();

    await recordShareStorageService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId: NOTE_ID,
          objectMetadataId: noteObjectMetadata.id,
          principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId,
        },
      ],
    });

    try {
      expect(await findNoteIdsAsJony()).toEqual([NOTE_ID]);
    } finally {
      await recordShareStorageService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId,
      });
    }
  });
});
