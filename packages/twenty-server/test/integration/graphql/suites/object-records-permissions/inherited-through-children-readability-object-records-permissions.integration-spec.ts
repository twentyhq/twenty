/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  type ObjectRecordDeleteEvent,
  type ObjectRecordEvent,
} from 'twenty-shared/database-events';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { restoreManyOperationFactory } from 'test/integration/graphql/utils/restore-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  FeatureFlagKey,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PERSON_ID = randomUUID();
const COMPANY_ID = randomUUID();
const NOTE_ON_PERSON_ID = randomUUID();
const NOTE_ON_COMPANY_ID = randomUUID();
const NOTE_ON_BOTH_ID = randomUUID();
const NOTE_ALONE_ID = randomUUID();
const MEMBER_NOTE_ID = randomUUID();
const PERSON_NOTE_TARGET_ID = randomUUID();
const COMPANY_NOTE_TARGET_ID = randomUUID();
const BOTH_PERSON_NOTE_TARGET_ID = randomUUID();
const BOTH_COMPANY_NOTE_TARGET_ID = randomUUID();
const MEMBER_NOTE_TARGET_ID = randomUUID();
const COMPANY_NOTE_ATTACHMENT_ID = randomUUID();
const PERSON_NOTE_ATTACHMENT_ID = randomUUID();

const NOTE_IDS = [
  NOTE_ON_PERSON_ID,
  NOTE_ON_COMPANY_ID,
  NOTE_ON_BOTH_ID,
  NOTE_ALONE_ID,
  MEMBER_NOTE_ID,
];
const NOTE_TARGET_IDS = [
  PERSON_NOTE_TARGET_ID,
  COMPANY_NOTE_TARGET_ID,
  BOTH_PERSON_NOTE_TARGET_ID,
  BOTH_COMPANY_NOTE_TARGET_ID,
  MEMBER_NOTE_TARGET_ID,
];
const ATTACHMENT_IDS = [COMPANY_NOTE_ATTACHMENT_ID, PERSON_NOTE_ATTACHMENT_ID];

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const findNotesOperation = findManyOperationFactory({
  objectMetadataSingularName: 'note',
  objectMetadataPluralName: 'notes',
  gqlFields: `
    id
    noteTargets {
      edges {
        node {
          id
        }
      }
    }
  `,
  filter: { id: { in: NOTE_IDS } },
});

const findNoteTargetsOperation = findManyOperationFactory({
  objectMetadataSingularName: 'noteTarget',
  objectMetadataPluralName: 'noteTargets',
  gqlFields: 'id',
  filter: { id: { in: NOTE_TARGET_IDS } },
});

const findAttachmentsOperation = findManyOperationFactory({
  objectMetadataSingularName: 'attachment',
  objectMetadataPluralName: 'attachments',
  gqlFields: 'id',
  filter: { id: { in: ATTACHMENT_IDS } },
});

const renameNoteOperation = (noteId: string, title: string) =>
  updateOneOperationFactory({
    objectMetadataSingularName: 'note',
    gqlFields: 'id title',
    recordId: noteId,
    data: { title },
  });

const attachNoteToCompanyOperation = createOneOperationFactory({
  objectMetadataSingularName: 'noteTarget',
  gqlFields: 'id',
  data: {
    id: MEMBER_NOTE_TARGET_ID,
    noteId: NOTE_ON_PERSON_ID,
    targetCompanyId: COMPANY_ID,
  },
});

const detachNoteOnBothFromCompanyOperation = deleteManyOperationFactory({
  objectMetadataSingularName: 'noteTarget',
  objectMetadataPluralName: 'noteTargets',
  gqlFields: 'id',
  filter: { id: { eq: BOTH_COMPANY_NOTE_TARGET_ID } },
});

const reattachNoteOnBothToCompanyOperation = restoreManyOperationFactory({
  objectMetadataSingularName: 'noteTarget',
  objectMetadataPluralName: 'noteTargets',
  gqlFields: 'id',
  filter: { id: { eq: BOTH_COMPANY_NOTE_TARGET_ID } },
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

const destroyRecords = ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  ids,
}: {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  ids: string[];
}) =>
  makeGraphqlAPIRequest(
    destroyManyOperationFactory({
      objectMetadataSingularName,
      objectMetadataPluralName,
      gqlFields: 'id',
      filter: { id: { in: ids } },
    }),
  );

describe('inheritedThroughChildrenReadabilityObjectRecordsPermissions', () => {
  let recordShareStorageService: RecordShareStorageService;
  let personObjectMetadataId: string;
  let noteObjectMetadataId: string;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );

    const objectMetadataRepository =
      getCoreRepository<ObjectMetadataEntity>(ObjectMetadataEntity);

    personObjectMetadataId = (
      await objectMetadataRepository.findOneOrFail({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'person' },
      })
    ).id;
    noteObjectMetadataId = (
      await objectMetadataRepository.findOneOrFail({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'note' },
      })
    ).id;

    const createRecords = [
      {
        objectMetadataSingularName: 'person',
        data: { id: PERSON_ID, name: { firstName: 'Private' } },
      },
      {
        objectMetadataSingularName: 'company',
        data: { id: COMPANY_ID, name: 'Open company' },
      },
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ON_PERSON_ID, title: 'On the private person' },
      },
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ON_COMPANY_ID, title: 'On the open company' },
      },
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ON_BOTH_ID, title: 'On both' },
      },
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ALONE_ID, title: 'Attached to nothing' },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: PERSON_NOTE_TARGET_ID,
          noteId: NOTE_ON_PERSON_ID,
          targetPersonId: PERSON_ID,
        },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: COMPANY_NOTE_TARGET_ID,
          noteId: NOTE_ON_COMPANY_ID,
          targetCompanyId: COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: BOTH_PERSON_NOTE_TARGET_ID,
          noteId: NOTE_ON_BOTH_ID,
          targetPersonId: PERSON_ID,
        },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: BOTH_COMPANY_NOTE_TARGET_ID,
          noteId: NOTE_ON_BOTH_ID,
          targetCompanyId: COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: {
          id: COMPANY_NOTE_ATTACHMENT_ID,
          name: 'company-note-attachment.pdf',
          targetNoteId: NOTE_ON_COMPANY_ID,
        },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: {
          id: PERSON_NOTE_ATTACHMENT_ID,
          name: 'person-note-attachment.pdf',
          targetNoteId: NOTE_ON_PERSON_ID,
        },
      },
    ];

    for (const { objectMetadataSingularName, data } of createRecords) {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName,
          gqlFields: 'id',
          data,
        }),
      );

      expect(response.body.errors).toBeUndefined();
    }

    await setObjectReadability(
      personObjectMetadataId,
      MetadataReadability.PRIVATE,
    );
    await setRecordSharingEnabled(true);
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await recordShareStorageService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
    await recordShareStorageService.deleteByRecordIds({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      objectMetadataId: noteObjectMetadataId,
      recordIds: NOTE_IDS,
    });
    await setObjectReadability(
      personObjectMetadataId,
      MetadataReadability.OPEN,
    );
    await destroyRecords({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      ids: ATTACHMENT_IDS,
    });
    await destroyRecords({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      ids: NOTE_TARGET_IDS,
    });
    await destroyRecords({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      ids: NOTE_IDS,
    });
    await destroyRecords({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      ids: [PERSON_ID],
    });
    await destroyRecords({
      objectMetadataSingularName: 'company',
      objectMetadataPluralName: 'companies',
      ids: [COMPANY_ID],
    });
  });

  describe('without a share row on the person', () => {
    it('should show the notes attached to the open company, their company targets and their attachments only', async () => {
      const notesResponse =
        await makeGraphqlAPIRequestWithMemberRole(findNotesOperation);
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );

      expect(notesResponse.body.errors).toBeUndefined();
      expect(collectIds(notesResponse.body.data.notes.edges)).toEqual(
        [NOTE_ON_COMPANY_ID, NOTE_ON_BOTH_ID].sort(),
      );

      const noteOnBoth = notesResponse.body.data.notes.edges.find(
        (edge: { node: { id: string } }) => edge.node.id === NOTE_ON_BOTH_ID,
      ).node;

      expect(collectIds(noteOnBoth.noteTargets.edges)).toEqual([
        BOTH_COMPANY_NOTE_TARGET_ID,
      ]);
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual([COMPANY_NOTE_TARGET_ID, BOTH_COMPANY_NOTE_TARGET_ID].sort());
      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([COMPANY_NOTE_ATTACHMENT_ID]);
    });

    it('should let the member rename the note on the open company and refuse the one on the private person', async () => {
      const companyNoteResponse = await makeGraphqlAPIRequestWithMemberRole(
        renameNoteOperation(NOTE_ON_COMPANY_ID, 'Renamed on the open company'),
      );
      const personNoteResponse = await makeGraphqlAPIRequestWithMemberRole(
        renameNoteOperation(NOTE_ON_PERSON_ID, 'Renamed on the private person'),
      );

      expect(companyNoteResponse.body.errors).toBeUndefined();
      expect(companyNoteResponse.body.data.updateNote).toEqual({
        id: NOTE_ON_COMPANY_ID,
        title: 'Renamed on the open company',
      });
      expect(personNoteResponse.body.data?.updateNote ?? null).toBeNull();
      expect(personNoteResponse.body.errors).toBeDefined();
    });

    it('should refuse to attach the note on the private person to the open company', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        attachNoteToCompanyOperation,
      );

      expect(response.body.data?.createNoteTarget ?? null).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not writable');
    });

    it('should refuse to restore a detached target of a note the member cannot write', async () => {
      const detachResponse = await makeGraphqlAPIRequest(
        detachNoteOnBothFromCompanyOperation,
      );

      expect(detachResponse.body.errors).toBeUndefined();

      const restoreResponse = await makeGraphqlAPIRequestWithMemberRole(
        reattachNoteOnBothToCompanyOperation,
      );

      expect(restoreResponse.body.data?.restoreNoteTargets ?? null).toBeNull();
      expect(restoreResponse.body.errors).toBeDefined();
      expect(restoreResponse.body.errors[0].message).toContain('not writable');

      await setRecordSharingEnabled(false);

      const reattachResponse = await makeGraphqlAPIRequest(
        reattachNoteOnBothToCompanyOperation,
      );

      expect(reattachResponse.body.errors).toBeUndefined();

      await setRecordSharingEnabled(true);
    });
  });

  describe('with a READ share row on the person', () => {
    beforeAll(async () => {
      await recordShareStorageService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: PERSON_ID,
            objectMetadataId: personObjectMetadataId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId,
          },
        ],
      });
    });

    it('should show every attached note, target and attachment and keep the unattached note hidden', async () => {
      const notesResponse =
        await makeGraphqlAPIRequestWithMemberRole(findNotesOperation);
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );

      expect(notesResponse.body.errors).toBeUndefined();
      expect(collectIds(notesResponse.body.data.notes.edges)).toEqual(
        [NOTE_ON_PERSON_ID, NOTE_ON_COMPANY_ID, NOTE_ON_BOTH_ID].sort(),
      );
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual(
        [
          PERSON_NOTE_TARGET_ID,
          COMPANY_NOTE_TARGET_ID,
          BOTH_PERSON_NOTE_TARGET_ID,
          BOTH_COMPANY_NOTE_TARGET_ID,
        ].sort(),
      );
      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual(ATTACHMENT_IDS.sort());
    });

    it('should let the event gate see the same notes as the query gate', async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });
      const { rolesPermissions, flatObjectMetadataMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
          'rolesPermissions',
          'flatObjectMetadataMaps',
        ]);
      const noteObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: noteObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      expect(noteObjectMetadata).toBeDefined();

      const recordIdsAdmittedByEventGate =
        await getAppProviderByClassName<RecordAccessPolicyService>(
          'RecordAccessPolicyService',
        )
          .buildEventRecordAccessGate({
            name: 'note.created',
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            objectMetadata: noteObjectMetadata!,
            events: NOTE_IDS.map((id) => ({
              recordId: id,
              properties: { after: { id } },
            })),
          })
          .resolveAdmittedRecordIds({
            isSystemContext: false,
            objectsPermissions: rolesPermissions[memberRole.id],
            principalIds: [
              EVERYONE_PRINCIPAL_ID,
              WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              memberRole.id,
            ],
            isOwningApplication: () => false,
            resolveRowLevelPermissionRecordFilter: () => null,
          });
      const notesResponse =
        await makeGraphqlAPIRequestWithMemberRole(findNotesOperation);

      expect([...recordIdsAdmittedByEventGate].sort()).toEqual(
        collectIds(notesResponse.body.data.notes.edges),
      );
    });

    it('should hide what is reached through the person from a role that cannot read people', async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });
      const setMemberCanReadPeople = (canReadObjectRecords: boolean) =>
        upsertObjectPermissions({
          expectToFail: false,
          input: {
            roleId: memberRole.id,
            objectPermissions: [
              {
                objectMetadataId: personObjectMetadataId,
                canReadObjectRecords,
                canUpdateObjectRecords: canReadObjectRecords,
                canSoftDeleteObjectRecords: canReadObjectRecords,
                canDestroyObjectRecords: canReadObjectRecords,
              },
            ],
          },
        });

      await setMemberCanReadPeople(false);

      const notesResponse =
        await makeGraphqlAPIRequestWithMemberRole(findNotesOperation);
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );

      await setMemberCanReadPeople(true);

      expect(notesResponse.body.errors).toBeUndefined();
      expect(collectIds(notesResponse.body.data.notes.edges)).toEqual(
        [NOTE_ON_COMPANY_ID, NOTE_ON_BOTH_ID].sort(),
      );
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual([COMPANY_NOTE_TARGET_ID, BOTH_COMPANY_NOTE_TARGET_ID].sort());
      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([COMPANY_NOTE_ATTACHMENT_ID]);
    });

    it('should still refuse to rename the note on the private person or attach it elsewhere', async () => {
      const renameResponse = await makeGraphqlAPIRequestWithMemberRole(
        renameNoteOperation(NOTE_ON_PERSON_ID, 'Renamed with READ'),
      );
      const attachResponse = await makeGraphqlAPIRequestWithMemberRole(
        attachNoteToCompanyOperation,
      );

      expect(renameResponse.body.data?.updateNote ?? null).toBeNull();
      expect(renameResponse.body.errors).toBeDefined();
      expect(attachResponse.body.data?.createNoteTarget ?? null).toBeNull();
      expect(attachResponse.body.errors).toBeDefined();
    });
  });

  describe('with a READ_WRITE share row on the person for the member role', () => {
    beforeAll(async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });

      await recordShareStorageService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: PERSON_ID,
            objectMetadataId: personObjectMetadataId,
            principalId: memberRole.id,
            principalType: RecordSharePrincipalType.ROLE,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId,
          },
        ],
      });
    });

    it('should let the member rename the note on the private person and attach it to the open company', async () => {
      const renameResponse = await makeGraphqlAPIRequestWithMemberRole(
        renameNoteOperation(NOTE_ON_PERSON_ID, 'Renamed with READ_WRITE'),
      );
      const attachResponse = await makeGraphqlAPIRequestWithMemberRole(
        attachNoteToCompanyOperation,
      );

      expect(renameResponse.body.errors).toBeUndefined();
      expect(renameResponse.body.data.updateNote).toEqual({
        id: NOTE_ON_PERSON_ID,
        title: 'Renamed with READ_WRITE',
      });
      expect(attachResponse.body.errors).toBeUndefined();
      expect(attachResponse.body.data.createNoteTarget.id).toBe(
        MEMBER_NOTE_TARGET_ID,
      );
    });

    it('should let the member read back a note they created before attaching it anywhere', async () => {
      const createResponse = await makeGraphqlAPIRequestWithMemberRole(
        createOneOperationFactory({
          objectMetadataSingularName: 'note',
          gqlFields: 'id',
          data: { id: MEMBER_NOTE_ID, title: 'Created by the member' },
        }),
      );
      const notesResponse =
        await makeGraphqlAPIRequestWithMemberRole(findNotesOperation);

      expect(createResponse.body.errors).toBeUndefined();
      expect(notesResponse.body.errors).toBeUndefined();
      expect(collectIds(notesResponse.body.data.notes.edges)).toEqual(
        [
          NOTE_ON_PERSON_ID,
          NOTE_ON_COMPANY_ID,
          NOTE_ON_BOTH_ID,
          MEMBER_NOTE_ID,
        ].sort(),
      );
    });

    it('should keep a deleted note readable through the links captured with its deletion', async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });
      const { rolesPermissions, flatObjectMetadataMaps } =
        await getAppProviderByClassName<WorkspaceCacheService>(
          'WorkspaceCacheService',
        ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
          'rolesPermissions',
          'flatObjectMetadataMaps',
        ]);
      const noteObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: noteObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });
      const resolveReadableNoteIds = (events: ObjectRecordEvent[]) =>
        getAppProviderByClassName<RecordAccessPolicyService>(
          'RecordAccessPolicyService',
        )
          .buildEventRecordAccessGate({
            name: 'note.deleted',
            workspaceId: SEED_APPLE_WORKSPACE_ID,
            objectMetadata: noteObjectMetadata!,
            events,
          })
          .resolveAdmittedRecordIds({
            isSystemContext: false,
            objectsPermissions: rolesPermissions[memberRole.id],
            principalIds: [
              EVERYONE_PRINCIPAL_ID,
              WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
              memberRole.id,
            ],
            isOwningApplication: () => false,
            resolveRowLevelPermissionRecordFilter: () => null,
          });
      const noteOnPersonFilter = { id: { eq: NOTE_ON_PERSON_ID } };

      const deleteResponse = await makeGraphqlAPIRequest(
        deleteManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: noteOnPersonFilter,
        }),
      );
      const deletedNoteEventProperties = {
        before: { id: NOTE_ON_PERSON_ID },
        after: { id: NOTE_ON_PERSON_ID },
        updatedFields: ['deletedAt'],
        diff: {},
      };
      const readableThroughLiveLinks = await resolveReadableNoteIds([
        { recordId: NOTE_ON_PERSON_ID, properties: deletedNoteEventProperties },
      ]);
      const readableThroughCapturedLinks = await resolveReadableNoteIds([
        {
          recordId: NOTE_ON_PERSON_ID,
          properties: {
            ...deletedNoteEventProperties,
            inheritedReadabilityChildRecords: {
              noteTarget: [
                {
                  id: PERSON_NOTE_TARGET_ID,
                  noteId: NOTE_ON_PERSON_ID,
                  targetPersonId: PERSON_ID,
                },
              ],
            },
          } as ObjectRecordDeleteEvent['properties'],
        },
      ]);
      const restoreResponse = await makeGraphqlAPIRequest(
        restoreManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: noteOnPersonFilter,
        }),
      );

      expect(deleteResponse.body.errors).toBeUndefined();
      expect(deleteResponse.body.data.deleteNotes).toEqual([
        { id: NOTE_ON_PERSON_ID },
      ]);
      expect(restoreResponse.body.errors).toBeUndefined();
      expect(restoreResponse.body.data.restoreNotes).toEqual([
        { id: NOTE_ON_PERSON_ID },
      ]);
      expect([...readableThroughLiveLinks]).toEqual([]);
      expect([...readableThroughCapturedLinks]).toEqual([NOTE_ON_PERSON_ID]);
    });

    it('should not show a deleted note in the trash through a target detached before its deletion', async () => {
      const noteOnCompanyFilter = { id: { eq: NOTE_ON_COMPANY_ID } };
      const companyNoteTargetFilter = { id: { eq: COMPANY_NOTE_TARGET_ID } };

      const detachResponse = await makeGraphqlAPIRequest(
        deleteManyOperationFactory({
          objectMetadataSingularName: 'noteTarget',
          objectMetadataPluralName: 'noteTargets',
          gqlFields: 'id',
          filter: companyNoteTargetFilter,
        }),
      );

      await setRecordSharingEnabled(false);

      const deleteResponse = await makeGraphqlAPIRequest(
        deleteManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: noteOnCompanyFilter,
        }),
      );

      await setRecordSharingEnabled(true);

      const trashedNotesResponse = await makeGraphqlAPIRequestWithMemberRole(
        findManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: {
            ...noteOnCompanyFilter,
            not: { deletedAt: { is: 'NULL' } },
          },
        }),
      );

      await setRecordSharingEnabled(false);

      const restoreNoteResponse = await makeGraphqlAPIRequest(
        restoreManyOperationFactory({
          objectMetadataSingularName: 'note',
          objectMetadataPluralName: 'notes',
          gqlFields: 'id',
          filter: noteOnCompanyFilter,
        }),
      );
      const restoreTargetResponse = await makeGraphqlAPIRequest(
        restoreManyOperationFactory({
          objectMetadataSingularName: 'noteTarget',
          objectMetadataPluralName: 'noteTargets',
          gqlFields: 'id',
          filter: companyNoteTargetFilter,
        }),
      );

      await setRecordSharingEnabled(true);

      expect(detachResponse.body.data.deleteNoteTargets).toEqual([
        { id: COMPANY_NOTE_TARGET_ID },
      ]);
      expect(deleteResponse.body.data.deleteNotes).toEqual([
        { id: NOTE_ON_COMPANY_ID },
      ]);
      expect(trashedNotesResponse.body.errors).toBeUndefined();
      expect(trashedNotesResponse.body.data.notes.edges).toEqual([]);
      expect(restoreNoteResponse.body.errors).toBeUndefined();
      expect(restoreTargetResponse.body.errors).toBeUndefined();
    });
  });
});
