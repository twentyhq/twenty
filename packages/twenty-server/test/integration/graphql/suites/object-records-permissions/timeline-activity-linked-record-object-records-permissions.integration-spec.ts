import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setObjectReadability } from 'test/integration/metadata/suites/object-metadata/utils/set-object-readability.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import {
  FeatureFlagKey,
  MetadataReadability,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PERSON_ID = randomUUID();
const NOTE_ID = randomUUID();
const NOTE_TARGET_ID = randomUUID();
const NOTE_TITLE = 'Private note on a person';

type TimelineActivityRow = {
  id: string;
  linkedRecordId: string | null;
  linkedRecordCachedName: string | null;
  linkedObjectMetadataId: string | null;
};

const personTimelineOperation = findManyOperationFactory({
  objectMetadataSingularName: 'timelineActivity',
  objectMetadataPluralName: 'timelineActivities',
  gqlFields: 'id linkedRecordId linkedRecordCachedName linkedObjectMetadataId',
  filter: { targetPersonId: { eq: PERSON_ID } },
  orderBy: [{ happensAt: 'DescNullsFirst' }],
});

const readLinkedNoteActivities = (response: {
  body: {
    errors?: unknown;
    data: { timelineActivities: { edges: { node: TimelineActivityRow }[] } };
  };
}): TimelineActivityRow[] => {
  expect(response.body.errors).toBeUndefined();

  return response.body.data.timelineActivities.edges
    .map((edge) => edge.node)
    .filter((activity) => activity.linkedRecordId === NOTE_ID);
};

const shareNoteWithJonyOperation = (noteObjectMetadataId: string) => ({
  query: gql`
    mutation ShareRecord(
      $objectMetadataId: UUID!
      $recordId: UUID!
      $shareWith: [ShareWithInput!]!
    ) {
      shareRecord(
        objectMetadataId: $objectMetadataId
        recordId: $recordId
        shareWith: $shareWith
      ) {
        shares {
          principalId
          accessLevel
        }
      }
    }
  `,
  variables: {
    objectMetadataId: noteObjectMetadataId,
    recordId: NOTE_ID,
    shareWith: [
      {
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        accessLevel: RecordShareAccessLevel.READ,
      },
    ],
  },
});

const setRecordSharingEnabled = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
    value,
    expectToFail: false,
  });

const createRecordAsAdmin = async (
  objectMetadataSingularName: string,
  data: object,
) => {
  const response = await makeGraphqlAPIRequest(
    createOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      data,
    }),
  );

  expect(response.body.errors).toBeUndefined();
};

const destroyRecordAsAdmin = (
  objectMetadataSingularName: string,
  recordId: string,
) =>
  makeGraphqlAPIRequest(
    destroyOneOperationFactory({
      objectMetadataSingularName,
      gqlFields: 'id',
      recordId,
    }),
  );

describe('timelineActivityLinkedRecordObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let noteObjectMetadataId: string;

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');

    noteObjectMetadataId = (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular: 'note' },
      })
    ).id;

    await setObjectReadability(
      noteObjectMetadataId,
      MetadataReadability.PRIVATE,
    );
    await setRecordSharingEnabled(true);

    await createRecordAsAdmin('person', {
      id: PERSON_ID,
      name: { firstName: 'Timeline', lastName: 'Host' },
    });
    await createRecordAsAdmin('note', { id: NOTE_ID, title: NOTE_TITLE });
    await createRecordAsAdmin('noteTarget', {
      id: NOTE_TARGET_ID,
      noteId: NOTE_ID,
      targetPersonId: PERSON_ID,
    });
    await waitForAllJobsToFinish();
  });

  afterAll(async () => {
    await setRecordSharingEnabled(false);
    await deleteRecordsByIds(
      'recordShare',
      (
        await recordShareService.findByRecord({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: noteObjectMetadataId,
          recordId: NOTE_ID,
        })
      ).map((recordShare) => recordShare.id),
    );
    await setObjectReadability(noteObjectMetadataId, MetadataReadability.OPEN);
    await destroyRecordAsAdmin('noteTarget', NOTE_TARGET_ID);
    await destroyRecordAsAdmin('note', NOTE_ID);
    await destroyRecordAsAdmin('person', PERSON_ID);
    await waitForAllJobsToFinish();
  });

  it('should show the private note activity on the person timeline to the note owner', async () => {
    expect(
      readLinkedNoteActivities(
        await makeGraphqlAPIRequest(personTimelineOperation),
      ),
    ).toEqual([
      expect.objectContaining({
        linkedRecordId: NOTE_ID,
        linkedRecordCachedName: NOTE_TITLE,
        linkedObjectMetadataId: noteObjectMetadataId,
      }),
    ]);
  });

  it('should hide the private note activity from a member holding no row on the note', async () => {
    expect(
      readLinkedNoteActivities(
        await makeGraphqlAPIRequestWithMemberRole(personTimelineOperation),
      ),
    ).toEqual([]);
  });

  it('should show the activity to the member once the note is shared with them', async () => {
    const shareResponse = await makeMetadataAPIRequest(
      shareNoteWithJonyOperation(noteObjectMetadataId),
    );

    expect(shareResponse.body.errors).toBeUndefined();

    expect(
      readLinkedNoteActivities(
        await makeGraphqlAPIRequestWithMemberRole(personTimelineOperation),
      ),
    ).toEqual([
      expect.objectContaining({
        linkedRecordId: NOTE_ID,
        linkedRecordCachedName: NOTE_TITLE,
      }),
    ]);
  });

  it('should show the activity to everyone when record sharing is disabled', async () => {
    await deleteRecordsByIds(
      'recordShare',
      (
        await recordShareService.findByRecord({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: noteObjectMetadataId,
          recordId: NOTE_ID,
        })
      )
        .filter(
          (recordShare) =>
            recordShare.principalId === WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        )
        .map((recordShare) => recordShare.id),
    );
    await setRecordSharingEnabled(false);

    expect(
      readLinkedNoteActivities(
        await makeGraphqlAPIRequestWithMemberRole(personTimelineOperation),
      ),
    ).toEqual([
      expect.objectContaining({
        linkedRecordId: NOTE_ID,
        linkedRecordCachedName: NOTE_TITLE,
      }),
    ]);
  });
});
