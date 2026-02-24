import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_SKILL_ID = uuidv4();
const TEST_SECOND_SKILL_ID = uuidv4();

const SKILL_GQL_FIELDS = 'id name label description content icon applicationId';

const buildManifest = (overrides?: Partial<Pick<Manifest, 'skills'>>) =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID, overrides });

const findAppSkills = async () => {
  const { data } = await findSkills({
    gqlFields: SKILL_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.skills.filter(
    (skill) => skill.name === 'enrichment' || skill.name === 'scoring',
  );
};

describe('Manifest update - skills', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing skill manifest updates',
      sourcePath: 'test-manifest-update-skill',
    });
  }, 60000);

  afterEach(async () => {
    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should create a new skill when added to manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({ skills: [] }),
      expectToFail: false,
    });

    const skillsAfterFirstSync = await findAppSkills();

    expect(skillsAfterFirstSync).toHaveLength(0);

    await syncApplication({
      manifest: buildManifest({
        skills: [
          {
            universalIdentifier: TEST_SKILL_ID,
            name: 'enrichment',
            label: 'Enrichment',
            description: 'Enrich contact data',
            icon: 'IconSparkles',
            content: '# Enrichment\n\nEnrich your data.',
          },
        ],
      }),
      expectToFail: false,
    });

    const skillsAfterSecondSync = await findAppSkills();

    expect(skillsAfterSecondSync).toHaveLength(1);
    expect(skillsAfterSecondSync[0]).toMatchObject({
      name: 'enrichment',
      label: 'Enrichment',
      description: 'Enrich contact data',
      icon: 'IconSparkles',
      content: '# Enrichment\n\nEnrich your data.',
    });
  }, 60000);

  it('should update a skill when properties change in manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        skills: [
          {
            universalIdentifier: TEST_SKILL_ID,
            name: 'enrichment',
            label: 'Enrichment',
            description: 'Enrich contact data',
            icon: 'IconSparkles',
            content: '# Enrichment\n\nEnrich your data.',
          },
        ],
      }),
      expectToFail: false,
    });

    const skillsAfterFirstSync = await findAppSkills();

    expect(skillsAfterFirstSync).toHaveLength(1);
    expect(skillsAfterFirstSync[0]).toMatchObject({
      label: 'Enrichment',
      description: 'Enrich contact data',
    });

    await syncApplication({
      manifest: buildManifest({
        skills: [
          {
            universalIdentifier: TEST_SKILL_ID,
            name: 'enrichment',
            label: 'Data Enrichment',
            description: 'Enrich contact and company data',
            icon: 'IconSparkles',
            content:
              '# Data Enrichment\n\nEnrich your contact and company data from multiple sources.',
          },
        ],
      }),
      expectToFail: false,
    });

    const skillsAfterSecondSync = await findAppSkills();

    expect(skillsAfterSecondSync).toHaveLength(1);
    expect(skillsAfterSecondSync[0]).toMatchObject({
      name: 'enrichment',
      label: 'Data Enrichment',
      description: 'Enrich contact and company data',
      content:
        '# Data Enrichment\n\nEnrich your contact and company data from multiple sources.',
    });
  }, 60000);

  it('should delete a skill when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        skills: [
          {
            universalIdentifier: TEST_SKILL_ID,
            name: 'enrichment',
            label: 'Enrichment',
            description: 'Enrich contact data',
            icon: 'IconSparkles',
            content: '# Enrichment\n\nEnrich your data.',
          },
          {
            universalIdentifier: TEST_SECOND_SKILL_ID,
            name: 'scoring',
            label: 'Lead Scoring',
            description: 'Score your leads',
            icon: 'IconChartBar',
            content: '# Lead Scoring\n\nScore leads automatically.',
          },
        ],
      }),
      expectToFail: false,
    });

    const skillsAfterFirstSync = await findAppSkills();

    expect(skillsAfterFirstSync).toHaveLength(2);
    expect(
      skillsAfterFirstSync.find((s) => s.name === 'enrichment'),
    ).toBeDefined();
    expect(
      skillsAfterFirstSync.find((s) => s.name === 'scoring'),
    ).toBeDefined();

    await syncApplication({
      manifest: buildManifest({
        skills: [
          {
            universalIdentifier: TEST_SKILL_ID,
            name: 'enrichment',
            label: 'Enrichment',
            description: 'Enrich contact data',
            icon: 'IconSparkles',
            content: '# Enrichment\n\nEnrich your data.',
          },
        ],
      }),
      expectToFail: false,
    });

    const skillsAfterSecondSync = await findAppSkills();

    expect(skillsAfterSecondSync).toHaveLength(1);
    expect(skillsAfterSecondSync[0]).toMatchObject({
      name: 'enrichment',
      label: 'Enrichment',
    });
    expect(
      skillsAfterSecondSync.find((s) => s.name === 'scoring'),
    ).toBeUndefined();
  }, 60000);
});
