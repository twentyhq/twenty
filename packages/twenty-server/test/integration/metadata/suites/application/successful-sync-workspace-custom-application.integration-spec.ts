import { randomUUID } from 'node:crypto';

import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { pullWorkspaceCustomApplicationManifest } from 'test/integration/metadata/suites/application/utils/pull-workspace-custom-application-manifest.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { type Manifest, type SkillManifest } from 'twenty-shared/application';

const SKILL: SkillManifest = {
  universalIdentifier: randomUUID(),
  name: 'blank-workspace-custom-application-skill',
  label: 'Blank workspace custom application skill',
  content: 'Declared by the workspace custom application manifest',
};

const findSkillByName = async (name: string) => {
  const { data } = await findSkills({
    input: undefined,
    gqlFields: 'id name applicationId',
    expectToFail: false,
    token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
  });

  return data.skills.find((skill) => skill.name === name);
};

describe('Workspace custom application manifest sync', () => {
  let pulledManifest: Manifest;

  beforeAll(async () => {
    pulledManifest = await pullWorkspaceCustomApplicationManifest({
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  });

  afterAll(async () => {
    await syncApplication({
      manifest: pulledManifest,
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });
  });

  it('applies the pulled manifest back without any change', async () => {
    const { data } = await syncApplication({
      manifest: pulledManifest,
      dryRun: true,
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    expect(data.syncApplication.actions).toEqual([]);
  });

  it('creates what the manifest adds and deletes it once the pulled manifest is applied again', async () => {
    await syncApplication({
      manifest: {
        ...pulledManifest,
        skills: [...pulledManifest.skills, SKILL],
      },
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    expect(await findSkillByName(SKILL.name)).toMatchObject({
      applicationId: await findWorkspaceCustomApplicationId(
        BLANK_ADA_ADMIN_ACCESS_TOKEN,
      ),
    });

    await syncApplication({
      manifest: pulledManifest,
      expectToFail: false,
      token: BLANK_ADA_ADMIN_ACCESS_TOKEN,
    });

    expect(await findSkillByName(SKILL.name)).toBeUndefined();
  });
});
