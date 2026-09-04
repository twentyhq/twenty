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
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const NOTE_ID = randomUUID();
const PERSON_ID = randomUUID();
const NOTE_ATTACHMENT_ID = randomUUID();
const PERSON_ATTACHMENT_ID = randomUUID();
const ORPHAN_ATTACHMENT_ID = randomUUID();
const NOTE_TARGET_ID = randomUUID();

const ATTACHMENT_IDS = [
  NOTE_ATTACHMENT_ID,
  PERSON_ATTACHMENT_ID,
  ORPHAN_ATTACHMENT_ID,
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
  let recordShareService: RecordShareService;
  let noteObjectMetadataId: string;
  let personObjectMetadataId: string;

  const sourceId = randomUUID();

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    const noteObjectMetadata = await getCoreRepository<ObjectMetadataEntity>(
      ObjectMetadataEntity,
    ).findOneOrFail({
      where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'note' },
    });

    noteObjectMetadataId = noteObjectMetadata.id;

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
        data: { id: NOTE_TARGET_ID, noteId: NOTE_ID },
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
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
    await setObjectReadability(noteObjectMetadataId, MetadataReadability.OPEN);
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

  describe('without a share row on the note', () => {
    it('should hide the attachment and the note target hanging off the note', async () => {
      const attachmentsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOperation,
      );
      const noteTargetsResponse = await makeGraphqlAPIRequestWithMemberRole(
        findNoteTargetsOperation,
      );

      expect(attachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(attachmentsResponse.body.data.attachments.edges),
      ).toEqual([ORPHAN_ATTACHMENT_ID, PERSON_ATTACHMENT_ID].sort());
      expect(noteTargetsResponse.body.errors).toBeUndefined();
      expect(noteTargetsResponse.body.data.noteTargets.edges).toHaveLength(0);
    });

    it('should keep the attachment hidden when ordering through its note', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findAttachmentsOrderedByNoteOperation,
      );

      expect(response.body.errors).toBeUndefined();
      expect(collectIds(response.body.data.attachments.edges)).toEqual(
        [ORPHAN_ATTACHMENT_ID, PERSON_ATTACHMENT_ID].sort(),
      );
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
      await recordShareService.insertMany({
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

    it('should show the attachment and the note target hanging off the note', async () => {
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
      ).toEqual([...ATTACHMENT_IDS].sort());
      expect(orderedAttachmentsResponse.body.errors).toBeUndefined();
      expect(
        collectIds(orderedAttachmentsResponse.body.data.attachments.edges),
      ).toEqual([...ATTACHMENT_IDS].sort());
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
  });

  describe('with a READ_WRITE share row on the note for the member role', () => {
    beforeAll(async () => {
      const memberRole = await findOneRoleByLabel({ label: 'Member' });

      await recordShareService.insertMany({
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

    it('should refuse reads instead of falling open', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findManyOperationFactory({
          objectMetadataSingularName: 'person',
          objectMetadataPluralName: 'people',
          gqlFields: 'id',
          filter: { id: { eq: PERSON_ID } },
        }),
      );

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not readable');
    });
  });
});
