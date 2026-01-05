import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import { updateSkill } from 'test/integration/metadata/suites/skill/utils/update-skill.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateSkillInput } from 'src/engine/metadata-modules/skill/dtos/update-skill.input';

type TestContext = {
  input: (testSetup: TestSetup) => UpdateSkillInput;
};

type TestSetup = {
  testSkillId: string;
  existingSkillNameForDuplicate: string;
};

type GlobalTestContext = {
  existingSkillNameForDuplicate: string;
};

const globalTestContext: GlobalTestContext = {
  existingSkillNameForDuplicate: 'existingSkillForDuplicateTest',
};

type UpdateSkillTestingContext = EachTestingContext<TestContext>[];

describe('Skill update should fail', () => {
  let testSkillId: string;
  let existingSkillIdForDuplicate: string;

  beforeAll(async () => {
    const { data: duplicateData } = await createSkill({
      expectToFail: false,
      input: {
        name: globalTestContext.existingSkillNameForDuplicate,
        label: 'Existing Skill For Duplicate Test',
        content: 'Existing skill for duplicate test',
      },
    });

    existingSkillIdForDuplicate = duplicateData.createSkill.id;
  });

  beforeEach(async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: 'testSkillToUpdate',
        label: 'Test Skill To Update',
        description: 'Original description',
        icon: 'IconSparkles',
        content: 'Original content',
      },
    });

    testSkillId = data.createSkill.id;
  });

  afterEach(async () => {
    await deleteSkill({
      expectToFail: false,
      input: { id: testSkillId },
    });
  });

  afterAll(async () => {
    await deleteSkill({
      expectToFail: false,
      input: { id: existingSkillIdForDuplicate },
    });
  });

  const failingSkillUpdateTestCases: UpdateSkillTestingContext = [
    {
      title: 'when updating with empty label',
      context: {
        input: (testSetup) => ({
          id: testSetup.testSkillId,
          label: '',
        }),
      },
    },
    {
      title: 'when updating with empty content',
      context: {
        input: (testSetup) => ({
          id: testSetup.testSkillId,
          content: '',
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingSkillUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const testSetup: TestSetup = {
        testSkillId,
        existingSkillNameForDuplicate:
          globalTestContext.existingSkillNameForDuplicate,
      };

      const input = context.input(testSetup);

      const { errors } = await updateSkill({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('should fail when updating a non-existent skill', async () => {
    const nonExistentSkillId = faker.string.uuid();

    const { errors } = await updateSkill({
      expectToFail: true,
      input: {
        id: nonExistentSkillId,
        label: 'Updated Label',
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('should fail when attempting to update a standard skill', async () => {
    const { data } = await findSkills({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id name isCustom',
    });

    const standardSkill = data.skills.find((skill) => skill.isCustom === false);

    // If there are no standard skills, skip this test
    if (!standardSkill) {
      return;
    }

    const { errors } = await updateSkill({
      expectToFail: true,
      input: {
        id: standardSkill.id,
        label: 'Attempted Update to Standard Skill',
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
