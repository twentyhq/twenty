import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { deactivateSkill } from 'test/integration/metadata/suites/skill/utils/deactivate-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { type Manifest, type SkillManifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const SKILL_NAME = 'additiveModeSkill';

const skill: SkillManifest = {
  universalIdentifier: uuidv4(),
  name: SKILL_NAME,
  label: 'Additive Mode Skill',
  content: 'Summarize the record in one sentence.',
};

const ticketObject = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'additiveTicket',
  namePlural: 'additiveTickets',
  labelSingular: 'Additive Ticket',
  labelPlural: 'Additive Tickets',
  description: 'A support ticket',
});

const invoiceObject = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'additiveInvoice',
  namePlural: 'additiveInvoices',
  labelSingular: 'Additive Invoice',
  labelPlural: 'Additive Invoices',
  description: 'A billing invoice',
});

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'objects' | 'skills'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { skills: [skill], ...overrides },
  });

const findObjectNames = async (): Promise<string[]> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id nameSingular',
    expectToFail: false,
  });

  return objects.map((object) => object.nameSingular);
};

const findTestSkill = async () => {
  const { data } = await findSkills({
    input: undefined,
    gqlFields: 'id name isActive',
    expectToFail: false,
  });

  const found = data.skills.find(
    (candidate: { name: string }) => candidate.name === SKILL_NAME,
  );

  expect(isDefined(found)).toBe(true);

  return found as { id: string; name: string; isActive: boolean };
};

describe('Manifest sync - additive mode', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Additive Mode Test Application',
      description: 'App for testing additive manifest sync',
      sourcePath: 'additive-mode-manifest-sync',
    });

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject, invoiceObject] }),
      expectToFail: false,
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('keeps entities missing from the manifest when deletions are turned off', async () => {
    const manifestWithoutInvoice = buildManifest({ objects: [ticketObject] });

    const additivePlan = await syncApplication({
      manifest: manifestWithoutInvoice,
      dryRun: true,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(additivePlan.errors).toBeUndefined();
    expect(
      additivePlan.data.syncApplication.actions.filter(
        (action) => (action as { type: string }).type === 'delete',
      ),
    ).toHaveLength(0);

    const pruningPlan = await syncApplication({
      manifest: manifestWithoutInvoice,
      dryRun: true,
      expectToFail: false,
    });

    expect(
      pruningPlan.data.syncApplication.actions.filter(
        (action) => (action as { type: string }).type === 'delete',
      ).length,
    ).toBeGreaterThan(0);

    const additiveSync = await syncApplication({
      manifest: manifestWithoutInvoice,
      inferDeletionFromMissingEntities: false,
      expectToFail: false,
    });

    expect(additiveSync.errors).toBeUndefined();

    const objectNames = await findObjectNames();

    expect(objectNames).toContain('additiveTicket');
    expect(objectNames).toContain('additiveInvoice');
  }, 60000);

  it('keeps a skill deactivated by the workspace across a sync', async () => {
    const skillBefore = await findTestSkill();

    expect(skillBefore.isActive).toBe(true);

    const deactivation = await deactivateSkill({
      input: { id: skillBefore.id },
      expectToFail: false,
    });

    expect(deactivation.errors).toBeUndefined();

    await syncApplication({
      manifest: buildManifest({ objects: [ticketObject, invoiceObject] }),
      expectToFail: false,
    });

    const skillAfter = await findTestSkill();

    expect(skillAfter.isActive).toBe(false);
  }, 60000);
});
