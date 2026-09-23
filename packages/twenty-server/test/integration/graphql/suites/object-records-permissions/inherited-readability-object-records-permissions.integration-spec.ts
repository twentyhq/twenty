/* @license Enterprise */

import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
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

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const NOTE_ID = randomUUID();
const PERSON_ID = randomUUID();
const NOTE_ATTACHMENT_ID = randomUUID();
const PERSON_ATTACHMENT_ID = randomUUID();
const ORPHAN_ATTACHMENT_ID = randomUUID();
const MEMBER_ATTACHMENT_ID = randomUUID();
const UNATTACHED_MEMBER_ATTACHMENT_ID = randomUUID();
const NOTE_TARGET_ID = randomUUID();

const ATTACHMENT_IDS = [
  NOTE_ATTACHMENT_ID,
  PERSON_ATTACHMENT_ID,
  ORPHAN_ATTACHMENT_ID,
  MEMBER_ATTACHMENT_ID,
  UNATTACHED_MEMBER_ATTACHMENT_ID,
];

const collectIds = (edges: { node: { id: string } }[]): string[] =>
  edges.map((edge) => edge.node.id).sort();

const findAttachmentsOperation = findManyOperationFactory({
  objectMetadataSingularName: 'attachment',
  objectMetadataPluralName: 'attachments',
  gqlFields: 'id',
  filter: { id: { in: ATTACHMENT_IDS } },
});

const findAttachmentsOrderedByNoteOperation = findManyOperationFactory({
  objectMetadataSingularName: 'attachment',
  objectMetadataPluralName: 'attachments',
  gqlFields: 'id',
  filter: { id: { in: ATTACHMENT_IDS } },
  orderBy: [{ targetNote: { title: 'AscNullsLast' } }],
});

const findNoteTargetsOperation = findManyOperationFactory({
  objectMetadataSingularName: 'noteTarget',
  objectMetadataPluralName: 'noteTargets',
  gqlFields: 'id',
  filter: { id: { eq: NOTE_TARGET_ID } },
});

const findNoteWithChildrenOperation = findManyOperationFactory({
  objectMetadataSingularName: 'note',
  objectMetadataPluralName: 'notes',
  gqlFields: `
    id
    attachments {
      edges {
        node {
          id
        }
      }
    }
    noteTargets {
      edges {
        node {
          id
        }
      }
    }
  `,
  filter: { id: { eq: NOTE_ID } },
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

describe('inheritedReadabilityObjectRecordsPermissions', () => {
  let recordShareStorageService: RecordShareStorageService;
  let noteObjectMetadataId: string;
  let personObjectMetadataId: string;
  let attachmentObjectMetadataId: string;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareStorageService =
      getAppProviderByClassName<RecordShareStorageService>(
        'RecordShareStorageService',
      );

    const noteObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'note' },
    });

    noteObjectMetadataId = noteObjectMetadata.id;

    const attachmentObjectMetadata =
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          nameSingular: 'attachment',
        },
      });

    attachmentObjectMetadataId = attachmentObjectMetadata.id;

    const personObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'person' },
    });

    personObjectMetadataId = personObjectMetadata.id;

    const createRecords = [
      {
        objectMetadataSingularName: 'note',
        data: { id: NOTE_ID, title: 'Inherited readability note' },
      },
      {
        objectMetadataSingularName: 'person',
        data: { id: PERSON_ID, name: { firstName: 'Inherited' } },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: {
          id: NOTE_ATTACHMENT_ID,
          name: 'note-attachment.pdf',
          targetNoteId: NOTE_ID,
        },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: {
          id: PERSON_ATTACHMENT_ID,
          name: 'person-attachment.pdf',
          targetPersonId: PERSON_ID,
        },
      },
      {
        objectMetadataSingularName: 'attachment',
        data: { id: ORPHAN_ATTACHMENT_ID, name: 'orphan-attachment.pdf' },
      },
      {
        objectMetadataSingularName: 'noteTarget',
        data: {
          id: NOTE_TARGET_ID,
          noteId: NOTE_ID,
          targetPersonId: PERSON_ID,
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
      noteObjectMetadataId,
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
      objectMetadataId: attachmentObjectMetadataId,
      recordIds: ATTACHMENT_IDS,
    });
    await setObjectReadability(
      noteObjectMetadataId,
      MetadataReadability.INHERITED,
    );
    await destroyRecords({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      ids: ATTACHMENT_IDS,
    });
    await destroyRecords({
      objectMetadataSingularName: 'noteTarget',
      objectMetadataPluralName: 'noteTargets',
      ids: [NOTE_TARGET_ID],
    });
    await destroyRecords({
      objectMetadataSingularName: 'note',
      objectMetadataPluralName: 'notes',
      ids: [NOTE_ID],
    });
    await destroyRecords({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      ids: [PERSON_ID],
    });
  });

  describe('with record sharing disabled', () => {
    beforeAll(async () => {
      await setRecordSharingEnabled(false);
    });

    afterAll(async () => {
      await setRecordSharingEnabled(true);
    });

    it('keeps inherited record visibility enforced when the sharing UI is disabled', async () => {
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );

      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([PERSON_ATTACHMENT_ID]);
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual([NOTE_TARGET_ID]);
    });
  });

  describe('without a share row on the note', () => {
    it('should hide the attachment hanging off the note and keep the note target that points at the open person', async () => {
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );

      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([PERSON_ATTACHMENT_ID]);
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual([NOTE_TARGET_ID]);
    });

    it('should keep the attachment hidden when ordering through its note', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOrderedByNoteOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data.attachments.edges)).toEqual([
        PERSON_ATTACHMENT_ID,
      ]);
    });

    it('should hide the note itself and with it its nested children', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findNoteWithChildrenOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.notes.edges).toHaveLength(0);
    });
  });

  describe('with a READ share row on the note', () => {
    beforeAll(async () => {
      await recordShareStorageService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: NOTE_ID,
            objectMetadataId: noteObjectMetadataId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId,
          },
        ],
      });
    });

    it('should show the attachment and the note target hanging off the note and keep the orphan hidden', async () => {
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );
      const orderedAttachmentsResponse =
        await makeGraphqlAPIRequestWithMemberRole(
          findAttachmentsOrderedByNoteOperation,
        );
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );

      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([NOTE_ATTACHMENT_ID, PERSON_ATTACHMENT_ID].sort());
      expect(orderedAttachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(orderedAttachmentsResponse.body.data.attachments.edges),
      ).toEqual([NOTE_ATTACHMENT_ID, PERSON_ATTACHMENT_ID].sort());
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(noteTargetsResponse.body.data.noteTargets.edges),
      ).toEqual([NOTE_TARGET_ID]);
    });

    it('should show the note with its nested attachment and note target', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findNoteWithChildrenOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.notes.edges).toHaveLength(1);

      const note = response.body.data.notes.edges[0].node;

      expect(note.id).toBe(NOTE_ID);
      expect(collectIds(note.attachments.edges)).toEqual([NOTE_ATTACHMENT_ID]);
      expect(collectIds(note.noteTargets.edges)).toEqual([NOTE_TARGET_ID]);
    });

    it('should show the orphan attachment once it is shared with the member itself', async () => {
      await recordShareStorageService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: ORPHAN_ATTACHMENT_ID,
            objectMetadataId: attachmentObjectMetadataId,
            principalId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.READ,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data.attachments.edges)).toEqual(
        [NOTE_ATTACHMENT_ID, PERSON_ATTACHMENT_ID, ORPHAN_ATTACHMENT_ID].sort(),
      );
    });

    it('should refuse to update or delete the attachment with READ access on the note', async () => {
      const updateResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id name',
          recordId: NOTE_ATTACHMENT_ID,
          data: { name: 'renamed-by-member.pdf' },
        }),
      );
      const deleteResponse = await makeGraphqlAPIRequestWithMemberRole(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          recordId: NOTE_ATTACHMENT_ID,
        }),
      );

      expect(updateResponse.body.data?.updateAttachment ?? null).toBeNull();
      expect(updateResponse.body.errors).toBeDefined();
      expect(deleteResponse.body.data?.deleteAttachment ?? null).toBeNull();
      expect(deleteResponse.body.errors).toBeDefined();
    });

    it('should refuse to attach a new or an existing attachment to the note with READ access on it', async () => {
      const createResponse = await makeGraphqlAPIRequestWithMemberRole(
        createOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          data: {
            id: MEMBER_ATTACHMENT_ID,
            name: 'member-attachment.pdf',
            targetNoteId: NOTE_ID,
          },
        }),
      );
      const moveResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          recordId: PERSON_ATTACHMENT_ID,
          data: { targetPersonId: null, targetNoteId: NOTE_ID },
        }),
      );

      expect(createResponse.body.data?.createAttachment ?? null).toBeNull();
      expect(createResponse.body.errors[0].message).toContain('not writable');
      expect(moveResponse.body.data?.updateAttachment ?? null).toBeNull();
      expect(moveResponse.body.errors[0].message).toContain('not writable');
    });
  });

  describe('with a READ_WRITE share row on the note for the member role', () => {
    beforeAll(async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });

      await recordShareStorageService.insertMany({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        recordShares: [
          {
            recordId: NOTE_ID,
            objectMetadataId: noteObjectMetadataId,
            principalId: memberRole.id,
            principalType: RecordSharePrincipalType.ROLE,
            accessLevel: RecordShareAccessLevel.READ_WRITE,
            rowCause: RecordShareRowCause.MANUAL,
            sourceId,
          },
        ],
      });
    });

    it('should update the attachment hanging off the note', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id name',
          recordId: NOTE_ATTACHMENT_ID,
          data: { name: 'renamed-by-member.pdf' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateAttachment).toEqual({
        id: NOTE_ATTACHMENT_ID,
        name: 'renamed-by-member.pdf',
      });
    });

    it('should attach a new and an existing attachment to the note', async () => {
      const createResponse = await makeGraphqlAPIRequestWithMemberRole(
        createOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          data: {
            id: MEMBER_ATTACHMENT_ID,
            name: 'member-attachment.pdf',
            targetNoteId: NOTE_ID,
          },
        }),
      );
      const moveResponse = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          recordId: PERSON_ATTACHMENT_ID,
          data: { targetPersonId: null, targetNoteId: NOTE_ID },
        }),
      );

      expect(createResponse.body.errors).toBeUndefined();
      expect(createResponse.body.data.createAttachment.id).toBe(
        MEMBER_ATTACHMENT_ID,
      );
      expect(moveResponse.body.errors).toBeUndefined();
      expect(moveResponse.body.data.updateAttachment.id).toBe(
        PERSON_ATTACHMENT_ID,
      );
    });

    it('should let the member read back an attachment created without any parent', async () => {
      const createResponse = await makeGraphqlAPIRequestWithMemberRole(
        createOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id',
          data: {
            id: UNATTACHED_MEMBER_ATTACHMENT_ID,
            name: 'unattached-member-attachment.pdf',
          },
        }),
      );
      const findResponse = await makeGraphqlAPIRequestWithMemberRole(
        findManyOperationFactory({
          objectMetadataSingularName: 'attachment',
          objectMetadataPluralName: 'attachments',
          gqlFields: 'id',
          filter: { id: { eq: UNATTACHED_MEMBER_ATTACHMENT_ID } },
        }),
      );

      expect(createResponse.body.errors).toBeUndefined();
      expect(findResponse.body.errors).toBeUndefined();
      expect(collectIds(findResponse.body.data.attachments.edges)).toEqual([
        UNATTACHED_MEMBER_ATTACHMENT_ID,
      ]);
    });
  });

  describe('once every share row on the note is gone', () => {
    beforeAll(async () => {
      await recordShareStorageService.deleteBySourceId({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        sourceId,
      });
    });

    it('should keep showing the member the attachments they created and hide the others', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data.attachments.edges)).toEqual(
        [MEMBER_ATTACHMENT_ID, UNATTACHED_MEMBER_ATTACHMENT_ID].sort(),
      );
    });

    it('should let the member update the attachment they created under the note', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'attachment',
          gqlFields: 'id name',
          recordId: MEMBER_ATTACHMENT_ID,
          data: { name: 'renamed-by-owner.pdf' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateAttachment).toEqual({
        id: MEMBER_ATTACHMENT_ID,
        name: 'renamed-by-owner.pdf',
      });
    });
  });

  describe('INHERITED readability without any parent field', () => {
    beforeAll(async () => {
      await setObjectReadability(
        personObjectMetadataId,
        MetadataReadability.INHERITED,
      );
    });

    afterAll(async () => {
      await setObjectReadability(
        personObjectMetadataId,
        MetadataReadability.OPEN,
      );
    });

    it('should gate reads through share rows on the record itself', async () => {
      const findPersonOperation = findManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { eq: PERSON_ID } },
      });

      const unsharedResponse =
        await makeGraphqlAPIRequestWithMemberRole(findPersonOperation);

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

      const sharedResponse =
        await makeGraphqlAPIRequestWithMemberRole(findPersonOperation);

      expect(unsharedResponse.body.errors).toBeUndefined();
      expect(unsharedResponse.body.data.people.edges).toHaveLength(0);
      expect(sharedResponse.body.errors).toBeUndefined();
      expect(collectIds(sharedResponse.body.data.people.edges)).toEqual([
        PERSON_ID,
      ]);
    });
  });
});
