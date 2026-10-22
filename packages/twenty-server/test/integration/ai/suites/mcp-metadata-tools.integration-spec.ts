import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ToolCategory } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const OBJECT_AND_FIELD_TOOL_NAMES = [
  'get_object_metadata',
  'create_object_metadata',
  'update_object_metadata',
  'delete_object_metadata',
  'create_many_object_metadata',
  'update_many_object_metadata',
  'get_field_metadata',
  'create_field_metadata',
  'update_field_metadata',
  'delete_field_metadata',
  'create_many_field_metadata',
  'update_many_field_metadata',
  'create_many_relation_fields',
];

const VALIDATION_RULE_TOOL_NAMES = [
  'get_validation_rules',
  'validate_validation_rule_expression',
  'create_validation_rule',
  'update_validation_rule',
];

const METADATA_TOOL_NAMES = [
  ...OBJECT_AND_FIELD_TOOL_NAMES,
  ...VALIDATION_RULE_TOOL_NAMES,
];

const OBJECT_NAME_PREFIX = 'mcpMetadataTools';
const PET_NAME_SINGULAR = `${OBJECT_NAME_PREFIX}Pet`;
const PET_NAME_PLURAL = `${OBJECT_NAME_PREFIX}Pets`;
const VISIT_NAME_SINGULAR = `${OBJECT_NAME_PREFIX}Visit`;
const VISIT_NAME_PLURAL = `${OBJECT_NAME_PREFIX}Visits`;
const PETS_ON_COMPANY_FIELD_NAME = 'mcpMetadataToolsPets';

type FieldSummary = { id: string; name: string; type: string; label?: string };
type ObjectSummary = {
  id: string;
  nameSingular: string;
  namePlural: string;
  fields?: FieldSummary[];
};
type ValidationRuleSummary = { id: string; name: string };

const callMetadataTool = ({
  toolName,
  toolArguments,
  token = API_KEY_ACCESS_TOKEN,
}: {
  toolName: string;
  toolArguments: Record<string, unknown>;
  token?: string;
}) =>
  callMcpTool({
    toolName: 'execute_tool',
    toolArguments: { toolName, arguments: toolArguments },
    token,
  });

const runMetadataTool = async <TResult>(
  call: Parameters<typeof callMetadataTool>[0],
): Promise<TResult | undefined> => {
  const result = await callMetadataTool(call);

  expect(result.isError).toBe(false);

  const output: ToolOutput<TResult> = JSON.parse(result.content[0].text);

  expect(output.success).toBe(true);

  return output.result;
};

const runFailingMetadataTool = async (
  call: Parameters<typeof callMetadataTool>[0],
): Promise<ToolOutput> => {
  const result = await callMetadataTool(call);

  expect(result.isError).toBe(true);

  return JSON.parse(result.content[0].text);
};

const listObjects = async (
  toolArguments: Record<string, unknown>,
): Promise<ObjectSummary[]> => {
  const result = await runMetadataTool<{ objects: ObjectSummary[] }>({
    toolName: 'get_object_metadata',
    toolArguments,
  });

  jestExpectToBeDefined(result);

  return result.objects;
};

const listFields = async (
  toolArguments: Record<string, unknown>,
): Promise<FieldSummary[]> => {
  const result = await runMetadataTool<{ fields: FieldSummary[] }>({
    toolName: 'get_field_metadata',
    toolArguments,
  });

  jestExpectToBeDefined(result);

  return result.fields;
};

const findObjectOrThrow = async (objectName: string) => {
  const [object] = await listObjects({ objectName });

  jestExpectToBeDefined(object);

  return object;
};

const findFieldOrThrow = async ({
  objectName,
  fieldName,
}: {
  objectName: string;
  fieldName: string;
}) => {
  const field = (await listFields({ objectName })).find(
    ({ name }) => name === fieldName,
  );

  jestExpectToBeDefined(field);

  return field;
};

describe('MCP metadata tools (integration)', () => {
  afterAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });

    for (const { id, nameSingular } of objects ?? []) {
      if (!nameSingular.startsWith(OBJECT_NAME_PREFIX)) {
        continue;
      }

      await updateOneObjectMetadata({
        expectToFail: false,
        input: { idToUpdate: id, updatePayload: { isActive: false } },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: id },
      });
    }
  });

  it('should describe the metadata tools to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: { toolNames: METADATA_TOOL_NAMES },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should list the metadata tools in the metadata category', async () => {
    const catalog = await getMcpToolCatalog({ token: API_KEY_ACCESS_TOKEN });

    expect(catalog[ToolCategory.METADATA].map(({ name }) => name)).toEqual(
      METADATA_TOOL_NAMES,
    );
  });

  it('should build, edit and delete a custom object', async () => {
    const createdPet = await runMetadataTool<ObjectSummary>({
      toolName: 'create_object_metadata',
      toolArguments: {
        nameSingular: PET_NAME_SINGULAR,
        namePlural: PET_NAME_PLURAL,
        labelSingular: 'MCP metadata tools pet',
        labelPlural: 'MCP metadata tools pets',
        icon: 'paw',
      },
    });

    expect(createdPet).toEqual({
      id: expect.any(String),
      nameSingular: PET_NAME_SINGULAR,
      labelSingular: 'MCP metadata tools pet',
    });

    const petId = createdPet?.id;

    jestExpectToBeDefined(petId);

    expect(
      await listObjects({ objectName: PET_NAME_PLURAL, includeFields: true }),
    ).toEqual([
      expect.objectContaining({
        id: petId,
        nameSingular: PET_NAME_SINGULAR,
        namePlural: PET_NAME_PLURAL,
        labelPlural: 'MCP metadata tools pets',
        icon: 'IconPaw',
        fields: expect.arrayContaining([
          { id: expect.any(String), name: 'name', type: 'TEXT', label: 'Name' },
        ]),
      }),
    ]);

    expect(
      await runMetadataTool({
        toolName: 'update_object_metadata',
        toolArguments: {
          id: petId,
          labelSingular: 'MCP metadata tools animal',
          description: 'Animals followed by the clinic',
        },
      }),
    ).toEqual({
      id: petId,
      nameSingular: PET_NAME_SINGULAR,
      labelSingular: 'MCP metadata tools animal',
    });

    const nicknameField = await runMetadataTool<FieldSummary>({
      toolName: 'create_field_metadata',
      toolArguments: {
        objectMetadataId: petId,
        type: 'TEXT',
        name: 'nickname',
        label: 'Nickname',
      },
    });

    jestExpectToBeDefined(nicknameField);
    expect(nicknameField).toEqual({
      id: expect.any(String),
      name: 'nickname',
      label: 'Nickname',
      type: 'TEXT',
      objectMetadataId: petId,
    });

    expect(
      await runMetadataTool({
        toolName: 'update_field_metadata',
        toolArguments: { id: nicknameField.id, label: 'Pet nickname' },
      }),
    ).toEqual({
      id: nicknameField.id,
      name: 'nickname',
      label: 'Pet nickname',
      type: 'TEXT',
    });

    expect(
      await runMetadataTool({
        toolName: 'create_many_field_metadata',
        toolArguments: {
          fields: [
            {
              objectMetadataId: petId,
              type: 'NUMBER',
              name: 'age',
              label: 'Age',
            },
            {
              objectMetadataId: petId,
              type: 'SELECT',
              name: 'species',
              label: 'Species',
              options: [
                { label: 'Dog', value: 'DOG', position: 0, color: 'blue' },
                { label: 'Cat', value: 'CAT', position: 1, color: 'green' },
              ],
            },
          ],
        },
      }),
    ).toBeUndefined();

    const ageField = await findFieldOrThrow({
      objectName: PET_NAME_SINGULAR,
      fieldName: 'age',
    });

    expect(
      await runMetadataTool({
        toolName: 'update_many_field_metadata',
        toolArguments: {
          fields: [{ id: ageField.id, label: 'Age in years' }],
        },
      }),
    ).toBeUndefined();

    const petFields = await listFields({ objectMetadataId: petId });

    expect(petFields).toEqual(
      expect.arrayContaining([
        { id: expect.any(String), name: 'id', type: 'UUID' },
        expect.objectContaining({
          id: ageField.id,
          name: 'age',
          type: 'NUMBER',
          label: 'Age in years',
        }),
        expect.objectContaining({
          name: 'species',
          type: 'SELECT',
          label: 'Species',
        }),
        expect.objectContaining({
          id: nicknameField.id,
          name: 'nickname',
          label: 'Pet nickname',
        }),
      ]),
    );
    expect(petFields.map(({ name }) => name)).not.toContain('position');

    const company = await findObjectOrThrow('company');

    expect(
      await runMetadataTool({
        toolName: 'create_many_relation_fields',
        toolArguments: {
          relations: [
            {
              objectMetadataId: petId,
              name: 'company',
              label: 'Company',
              type: 'MANY_TO_ONE',
              targetObjectMetadataId: company.id,
              targetFieldLabel: 'MCP metadata tools pets',
              targetFieldIcon: 'IconPaw',
            },
          ],
        },
      }),
    ).toBeUndefined();

    expect(
      await findFieldOrThrow({
        objectName: PET_NAME_SINGULAR,
        fieldName: 'company',
      }),
    ).toMatchObject({ type: 'RELATION', label: 'Company' });
    expect(
      await findFieldOrThrow({
        objectName: 'company',
        fieldName: PETS_ON_COMPANY_FIELD_NAME,
      }),
    ).toMatchObject({ type: 'RELATION', label: 'MCP metadata tools pets' });

    expect(
      await runMetadataTool({
        toolName: 'create_many_object_metadata',
        toolArguments: {
          objects: [
            {
              nameSingular: VISIT_NAME_SINGULAR,
              namePlural: VISIT_NAME_PLURAL,
              labelSingular: 'MCP metadata tools visit',
              labelPlural: 'MCP metadata tools visits',
              icon: 'IconStethoscope',
            },
          ],
        },
      }),
    ).toBeUndefined();

    const visit = await findObjectOrThrow(VISIT_NAME_SINGULAR);

    expect(
      await runMetadataTool({
        toolName: 'update_many_object_metadata',
        toolArguments: {
          objects: [{ id: visit.id, description: 'Visits to the clinic' }],
        },
      }),
    ).toBeUndefined();
    expect(await findObjectOrThrow(VISIT_NAME_SINGULAR)).toMatchObject({
      description: 'Visits to the clinic',
    });

    expect(
      await runMetadataTool({
        toolName: 'create_field_metadata',
        toolArguments: {
          objectMetadataId: visit.id,
          type: 'RELATION',
          name: 'pet',
          label: 'Pet',
          relationCreationPayload: {
            type: 'MANY_TO_ONE',
            targetObjectMetadataId: petId,
            targetFieldLabel: 'Visits',
          },
        },
      }),
    ).toMatchObject({
      name: 'pet',
      type: 'RELATION',
      objectMetadataId: visit.id,
    });
    expect(
      await findFieldOrThrow({
        objectName: PET_NAME_SINGULAR,
        fieldName: 'visits',
      }),
    ).toMatchObject({ type: 'RELATION', label: 'Visits' });

    expect(
      await runMetadataTool({
        toolName: 'get_validation_rules',
        toolArguments: { objectName: PET_NAME_SINGULAR },
      }),
    ).toEqual([]);

    expect(
      await runMetadataTool({
        toolName: 'validate_validation_rule_expression',
        toolArguments: {
          objectName: PET_NAME_SINGULAR,
          expression: 'age >= 0',
        },
      }),
    ).toBeUndefined();

    const validationRule = await runMetadataTool<ValidationRuleSummary>({
      toolName: 'create_validation_rule',
      toolArguments: {
        objectName: PET_NAME_PLURAL,
        name: 'Non-negative age',
        expression: 'age >= 0',
        message: 'Age cannot be negative',
        errorFieldMetadataId: ageField.id,
      },
    });

    jestExpectToBeDefined(validationRule);
    expect(validationRule).toMatchObject({
      name: 'Non-negative age',
      expression: 'age >= 0',
      message: 'Age cannot be negative',
      errorFieldMetadataId: ageField.id,
      objectMetadataId: petId,
    });

    expect(
      await runMetadataTool({
        toolName: 'update_validation_rule',
        toolArguments: {
          id: validationRule.id,
          message: 'An age cannot be negative',
          isActive: false,
        },
      }),
    ).toMatchObject({
      id: validationRule.id,
      message: 'An age cannot be negative',
      isActive: false,
    });

    expect(
      await runMetadataTool<ValidationRuleSummary[]>({
        toolName: 'get_validation_rules',
        toolArguments: { objectName: PET_NAME_SINGULAR },
      }),
    ).toEqual([expect.objectContaining({ id: validationRule.id })]);

    expect(
      await runMetadataTool({
        toolName: 'delete_field_metadata',
        toolArguments: { id: nicknameField.id },
      }),
    ).toEqual({ id: nicknameField.id, deleted: true });
    expect(
      (await listFields({ objectMetadataId: petId })).map(({ id }) => id),
    ).not.toContain(nicknameField.id);

    for (const objectId of [visit.id, petId]) {
      expect(
        await runMetadataTool({
          toolName: 'delete_object_metadata',
          toolArguments: { id: objectId },
        }),
      ).toEqual({ id: objectId, deleted: true });
    }

    expect(await listObjects({ objectName: PET_NAME_SINGULAR })).toEqual([]);
    expect(
      (await listFields({ objectMetadataId: company.id })).map(
        ({ name }) => name,
      ),
    ).not.toContain(PETS_ON_COMPANY_FIELD_NAME);
  });

  it.each([
    {
      toolName: 'get_field_metadata',
      toolArguments: { objectName: 'unknownObject' },
    },
    {
      toolName: 'get_validation_rules',
      toolArguments: { objectName: 'unknownObject' },
    },
    {
      toolName: 'create_validation_rule',
      toolArguments: {
        objectName: 'unknownObject',
        name: 'Rule',
        expression: 'true',
        message: 'Message',
      },
    },
  ])(
    'should refuse $toolName on an unknown object name',
    async ({ toolName, toolArguments }) => {
      expect(await runFailingMetadataTool({ toolName, toolArguments })).toEqual(
        {
          success: false,
          message: `Failed to execute ${toolName}`,
          error:
            'Object "unknownObject" not found. Use get_object_metadata to list available objects.',
        },
      );
    },
  );

  it('should refuse an expression on an unknown field', async () => {
    expect(
      await runFailingMetadataTool({
        toolName: 'validate_validation_rule_expression',
        toolArguments: {
          objectName: 'company',
          expression: 'unknownField > 1',
        },
      }),
    ).toMatchObject({
      success: false,
      message: 'Failed to execute validate_validation_rule_expression',
    });
  });

  // The seeded member and guest roles cannot update settings, so they lack DATA_MODEL
  describe.each([
    { caller: 'a member', token: APPLE_JONY_MEMBER_ACCESS_TOKEN },
    { caller: 'a guest', token: APPLE_PHIL_GUEST_ACCESS_TOKEN },
  ])('for $caller without DATA_MODEL', ({ token }) => {
    it('should not list the metadata category', async () => {
      const catalog = await getMcpToolCatalog({ token });

      expect(catalog[ToolCategory.METADATA]).toBeUndefined();
      expect(Object.keys(catalog)).not.toHaveLength(0);
    });

    it.each(METADATA_TOOL_NAMES)('should refuse %s', async (toolName) => {
      expect(
        await runFailingMetadataTool({ toolName, toolArguments: {}, token }),
      ).toMatchObject({
        success: false,
        message: `Tool "${toolName}" not found`,
      });
    });
  });

  describe('with IS_RECORD_CREATION_FORM_ENABLED off', () => {
    beforeAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
        value: false,
        expectToFail: false,
      });
    });

    // The flag is seeded on
    afterAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED,
        value: true,
        expectToFail: false,
      });
    });

    it('should list the object and field tools only', async () => {
      const catalog = await getMcpToolCatalog({ token: API_KEY_ACCESS_TOKEN });

      expect(catalog[ToolCategory.METADATA].map(({ name }) => name)).toEqual(
        OBJECT_AND_FIELD_TOOL_NAMES,
      );
    });

    it('should still run an object tool', async () => {
      expect(await findObjectOrThrow('company')).toMatchObject({
        nameSingular: 'company',
      });
    });

    it.each(VALIDATION_RULE_TOOL_NAMES)(
      'should refuse %s',
      async (toolName) => {
        expect(
          await runFailingMetadataTool({ toolName, toolArguments: {} }),
        ).toMatchObject({
          success: false,
          message: `Tool "${toolName}" not found`,
        });
      },
    );
  });
});
