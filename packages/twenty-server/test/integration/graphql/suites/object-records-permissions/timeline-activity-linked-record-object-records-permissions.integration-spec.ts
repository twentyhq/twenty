import { randomUUID } from 'node:crypto';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { setObjectAccess } from 'test/integration/metadata/suites/object-metadata/utils/set-object-access.util';
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
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { type RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const PERSON_ID = randomUUID();
const NOTE_ID = randomUUID();
const LINKED_ACTIVITY_ID = randomUUID();
const PLAIN_ACTIVITY_ID = randomUUID();

const SECRET_NOTE_TITLE = 'Secret acquisition note';

const ACTIVITY_IDS = [LINKED_ACTIVITY_ID, PLAIN_ACTIVITY_ID];

const findActivities = findManyOperationFactory({
  objectMetadataSingularName: 'timelineActivity',
  objectMetadataPluralName: 'timelineActivities',
  gqlFields: `
    id
    linkedRecordCachedName
  `,
  filter: { id: { in: ACTIVITY_IDS } },
});

const findNotes = findManyOperationFactory({
  objectMetadataSingularName: 'note',
  objectMetadataPluralName: 'notes',
  gqlFields: 'id',
  filter: { id: { in: [NOTE_ID] } },
});

const collectNodes = (edges: { node: { id: string } }[]) =>
  edges.map((edge) => edge.node);

describe('timelineActivityLinkedRecordObjectRecordsPermissions', () => {
  let recordShareService: RecordShareService;
  let noteObjectMetadataId: string;
  let personObjectMetadataId: string;
  let memberRoleId: string;
  let timelineActivityTypeId: string;

  const sourceId = randomUUID();

  const findObjectMetadataId = async (nameSingular: string) =>
    (
      await getCoreRepository<ObjectMetadataEntity>(
        ObjectMetadataEntity,
      ).findOneOrFail({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID, nameSingular },
      })
    ).id;

  beforeAll(async () => {
    recordShareService =
      getAppProviderByClassName<RecordShareService>('RecordShareService');
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    noteObjectMetadataId = await findObjectMetadataId('note');
    personObjectMetadataId = await findObjectMetadataId('person');
    timelineActivityTypeId = (
      await getCoreRepository<TimelineActivityTypeEntity>(
        TimelineActivityTypeEntity,
      ).findOneOrFail({
        where: { workspaceId: SEED_APPLE_WORKSPACE_ID, name: 'recordCreated' },
      })
    ).id;

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: PERSON_ID, name: { firstName: 'Acme', lastName: 'Lead' } },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'note',
        gqlFields: 'id',
        data: { id: NOTE_ID, title: SECRET_NOTE_TITLE },
      }),
    );

    const linkedActivityResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        gqlFields: 'id',
        data: {
          id: LINKED_ACTIVITY_ID,
          timelineActivityTypeId,
          happensAt: new Date().toISOString(),
          targetPersonId: PERSON_ID,
          linkedObjectMetadataId: noteObjectMetadataId,
          linkedRecordId: NOTE_ID,
          linkedRecordCachedName: SECRET_NOTE_TITLE,
        },
      }),
    );

    expect(linkedActivityResponse.body.errors).toBeUndefined();

    const plainActivityResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        gqlFields: 'id',
        data: {
          id: PLAIN_ACTIVITY_ID,
          timelineActivityTypeId,
          happensAt: new Date().toISOString(),
          targetPersonId: PERSON_ID,
        },
      }),
    );

    expect(plainActivityResponse.body.errors).toBeUndefined();

    await setObjectAccess(noteObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_RECORD_SHARING_ENABLED,
      value: false,
      expectToFail: false,
    });
    await recordShareService.deleteBySourceId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      sourceId,
    });
    await setObjectAccess(noteObjectMetadataId, {
      readability: MetadataReadability.OPEN,
    });
    await setObjectAccess(personObjectMetadataId, {
      readability: MetadataReadability.OPEN,
    });

    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'timelineActivity',
        objectMetadataPluralName: 'timelineActivities',
        gqlFields: 'id',
        filter: { id: { in: ACTIVITY_IDS } },
      }),
    );
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'note',
        objectMetadataPluralName: 'notes',
        gqlFields: 'id',
        filter: { id: { in: [NOTE_ID] } },
      }),
    );
    await makeGraphqlAPIRequest(
      destroyManyOperationFactory({
        objectMetadataSingularName: 'person',
        objectMetadataPluralName: 'people',
        gqlFields: 'id',
        filter: { id: { in: [PERSON_ID] } },
      }),
    );
  });

  it('hides the activity and its cached title when the linked note is unreadable', async () => {
    const response = await makeGraphqlAPIRequestWithMemberRole(findActivities);

    expect(response.body.errors).toBeUndefined();

    const nodes = collectNodes(response.body.data.timelineActivities.edges);

    expect(nodes.map((node) => node.id)).toEqual([PLAIN_ACTIVITY_ID]);
    expect(JSON.stringify(nodes)).not.toContain(SECRET_NOTE_TITLE);
  });

  it('keeps an ordinary activity without linked content readable through its target', async () => {
    const response = await makeGraphqlAPIRequestWithMemberRole(findActivities);

    expect(response.body.errors).toBeUndefined();
    expect(
      collectNodes(response.body.data.timelineActivities.edges).map(
        (node) => node.id,
      ),
    ).toContain(PLAIN_ACTIVITY_ID);
  });

  it('shows the activity again once the note is shared', async () => {
    await recordShareService.insertMany({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      recordShares: [
        {
          recordId: NOTE_ID,
          objectMetadataId: noteObjectMetadataId,
          principalId: memberRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId,
        },
      ],
    });

    const response = await makeGraphqlAPIRequestWithMemberRole(findActivities);

    expect(response.body.errors).toBeUndefined();
    expect(
      collectNodes(response.body.data.timelineActivities.edges)
        .map((node) => node.id)
        .sort(),
    ).toEqual([...ACTIVITY_IDS].sort());
  });

  it('keeps the note readable on its own while its target person timeline is denied', async () => {
    await setObjectAccess(personObjectMetadataId, {
      readability: MetadataReadability.PRIVATE,
    });

    const activitiesResponse =
      await makeGraphqlAPIRequestWithMemberRole(findActivities);

    expect(activitiesResponse.body.errors).toBeUndefined();
    expect(activitiesResponse.body.data.timelineActivities.edges).toEqual([]);

    const notesResponse = await makeGraphqlAPIRequestWithMemberRole(findNotes);

    expect(notesResponse.body.errors).toBeUndefined();
    expect(
      collectNodes(notesResponse.body.data.notes.edges).map((node) => node.id),
    ).toEqual([NOTE_ID]);

    await setObjectAccess(personObjectMetadataId, {
      readability: MetadataReadability.OPEN,
    });
  });
});
