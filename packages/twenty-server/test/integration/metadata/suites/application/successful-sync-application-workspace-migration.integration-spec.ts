import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();
const TEST_SKILL_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'ticket',
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  description: 'A support ticket',
  icon: 'IconTicket',
});

const TEST_SKILL = {
  universalIdentifier: TEST_SKILL_ID,
  name: 'test-skill',
  label: 'Test Skill',
  description: 'A skill for testing',
  icon: 'IconBrain',
  content: '# Test Skill\n\nThis is a test skill.',
};

const TEST_FIELD: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'description',
  label: 'Description',
  description: 'Ticket description',
  icon: 'IconFileDescription',
  objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
};

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'fields' | 'skills' | 'objects'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [TEST_OBJECT],
      skills: [TEST_SKILL],
      fields: [TEST_FIELD],
      ...overrides,
    },
  });

describe('syncApplication', () => {
  let appCreated = false;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'A test application',
      sourcePath: 'test-sync',
    });

    appCreated = true;
  }, 60000);

  afterEach(async () => {
    if (!appCreated) {
      return;
    }

    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should return workspace migration actions on initial sync then on second sync with field rename and new role', async () => {
    const { data: firstSyncData } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(firstSyncData).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstSyncData),
    );

    // Verify database state after first sync
    const { objects: objectsAfterSync } = await findManyObjectMetadata({
      input: {
        filter: { isCustom: { is: true } },
        paging: { first: 100 },
      },
      gqlFields:
        'id nameSingular namePlural labelSingular labelPlural description icon isCustom',
      expectToFail: false,
    });

    const ticketObject = objectsAfterSync.find(
      (obj) => obj.nameSingular === 'ticket',
    );

    expect(ticketObject).toBeDefined();
    expect(ticketObject).toMatchObject({
      nameSingular: 'ticket',
      namePlural: 'tickets',
      labelSingular: 'Ticket',
      labelPlural: 'Tickets',
      description: 'A support ticket',
      icon: 'IconTicket',
      isCustom: true,
    });

    const objects = await findManyObjectMetadataWithIndexes({
      expectToFail: false,
    });

    const fieldsAfterSync = objects.find(
      (o) => o.universalIdentifier === TEST_OBJECT.universalIdentifier,
    )?.fieldsList;

    const descriptionField = fieldsAfterSync?.find(
      (f) => f.universalIdentifier === TEST_FIELD_ID,
    );

    expect(descriptionField).toBeDefined();
    expect(descriptionField).toMatchObject({
      name: 'description',
      label: 'Description',
      type: FieldMetadataType.TEXT,
      description: 'Ticket description',
      icon: 'IconFileDescription',
    });

    const { data: rolesAfterSync } = await findRoles({
      gqlFields: 'id label description universalIdentifier',
      expectToFail: false,
    });

    const testRole = rolesAfterSync.getRoles.find(
      (role) => role.universalIdentifier === TEST_ROLE_ID,
    );

    const { data: skillsAfterSync } = await findSkills({
      gqlFields: 'id name label description content icon',
      expectToFail: false,
      input: undefined,
    });

    const testSkill = skillsAfterSync.skills.find(
      (skill) => skill.name === 'test-skill',
    );

    expect(testRole).toBeDefined();
    expect(testRole).toMatchObject({
      label: 'Test Role',
      description: 'A test role',
    });

    expect(testSkill).toBeDefined();
    expect(testSkill).toMatchObject({
      name: 'test-skill',
      label: 'Test Skill',
      description: 'A skill for testing',
      icon: 'IconBrain',
      content: '# Test Skill\n\nThis is a test skill.',
    });
  }, 60000);

  it('should create a TEXT field on the standard Company object', async () => {
    const companyFieldId = uuidv4();

    const manifest = buildManifest({
      skills: [],
      objects: [],
      fields: [
        {
          universalIdentifier: companyFieldId,
          type: FieldMetadataType.TEXT,
          name: 'industry',
          label: 'Industry',
          description: 'The industry of the company',
          icon: 'IconBuildingFactory2',
          objectUniversalIdentifier:
            STANDARD_OBJECTS.company.universalIdentifier,
        },
      ],
    });

    const { data: syncData } = await syncApplication({
      manifest,
      expectToFail: false,
    });

    expect(syncData).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(syncData),
    );
  }, 60000);
});
