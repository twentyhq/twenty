import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createSkill } from 'test/integration/metadata/suites/skill/utils/create-skill.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { type CreateSkillInput } from 'src/engine/metadata-modules/skill/dtos/create-skill.input';

type TestContext = {
  input: CreateSkillInput;
};

type GlobalTestContext = {
  existingSkillLabel: string;
  existingSkillName: string;
};

const globalTestContext: GlobalTestContext = {
  existingSkillLabel: 'Existing Test Skill',
  existingSkillName: 'existingTestSkill',
};

type CreateSkillTestingContext = EachTestingContext<TestContext>[];

describe('Skill creation should fail', () => {
  let existingSkillId: string | undefined;

  beforeAll(async () => {
    const { data } = await createSkill({
      expectToFail: false,
      input: {
        name: globalTestContext.existingSkillName,
        label: globalTestContext.existingSkillLabel,
        content: 'Existing skill for testing',
      },
    });

    existingSkillId = data.createSkill.id;
  });

  afterAll(async () => {
    if (isDefined(existingSkillId)) {
      await deleteSkill({
        expectToFail: false,
        input: { id: existingSkillId },
      });
    }
  });

  const failingSkillCreationTestCases: CreateSkillTestingContext = [
    // Missing required properties tests
    {
      title: 'when label is missing',
      context: {
        input: {
          name: 'skillMissingLabel',
          content: 'Test content',
        } as CreateSkillInput,
      },
    },
    {
      title: 'when content is missing',
      context: {
        input: {
          name: 'skillMissingContent',
          label: 'Skill Missing Content',
        } as CreateSkillInput,
      },
    },
    {
      title: 'when name is missing',
      context: {
        input: {
          label: 'Skill Missing Name',
          content: 'Test content',
        } as CreateSkillInput,
      },
    },
    {
      title: 'when label is empty string',
      context: {
        input: {
          name: 'emptyLabelSkill',
          label: '',
          content: 'Test content',
        },
      },
    },
    {
      title: 'when content is empty string',
      context: {
        input: {
          name: 'emptyContentSkill',
          label: 'Empty Content Skill',
          content: '',
        },
      },
    },
    // Name uniqueness test
    {
      title: 'when name already exists',
      context: {
        input: {
          name: globalTestContext.existingSkillName,
          label: 'Duplicate Name Skill',
          content: 'Duplicate skill content',
        },
      },
    },
  ];

  it.each(eachTestingContextFilter(failingSkillCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createSkill({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
