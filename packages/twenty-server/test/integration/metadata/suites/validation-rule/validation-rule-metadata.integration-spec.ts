import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  createValidationRule,
  deleteValidationRule,
  findValidationRules,
  updateValidationRule,
} from 'test/integration/metadata/suites/validation-rule/utils/validation-rule-api.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('Validation rule metadata', () => {
  let companyObjectMetadataId: string;
  const createdValidationRuleIds: string[] = [];

  const createRule = async (input: Record<string, unknown>) => {
    const response = await createValidationRule(input);
    const createdValidationRule = response.body.data.createValidationRule;

    jestExpectToBeDefined(createdValidationRule);
    createdValidationRuleIds.push(createdValidationRule.id);

    return createdValidationRule;
  };

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const findObjectId = (nameSingular: string): string => {
      const object = objects.find(
        (candidate: { id: string; nameSingular: string }) =>
          candidate.nameSingular === nameSingular,
      );

      jestExpectToBeDefined(object);

      return object.id;
    };

    companyObjectMetadataId = findObjectId('company');
  });

  afterAll(async () => {
    for (const validationRuleId of createdValidationRuleIds) {
      await deleteValidationRule(validationRuleId);
    }
  });

  it('should create, list, update and delete a rule', async () => {
    const createdValidationRule = await createRule({
      objectMetadataId: companyObjectMetadataId,
      name: '  Company has a name  ',
      description: 'Every company needs a name',
      icon: 'IconBuilding',
      expression: 'isNonEmptyString(name)',
      message: 'A company needs a name',
    });

    expect(createdValidationRule).toMatchObject({
      objectMetadataId: companyObjectMetadataId,
      name: 'Company has a name',
      description: 'Every company needs a name',
      icon: 'IconBuilding',
      expression: 'isNonEmptyString($f1)',
      bindings: { $f1: expect.any(String) },
      isActive: true,
      errorFieldMetadataId: null,
    });

    expect(
      (await findValidationRules(companyObjectMetadataId)).map(({ id }) => id),
    ).toContain(createdValidationRule.id);

    const updateResponse = await updateValidationRule(
      createdValidationRule.id,
      { message: 'Name the company', description: null, isActive: false },
    );

    expect(updateResponse.body.data.updateValidationRule).toMatchObject({
      name: 'Company has a name',
      message: 'Name the company',
      description: null,
      isActive: false,
    });

    const deleteResponse = await deleteValidationRule(createdValidationRule.id);

    expect(deleteResponse.body.data.deleteValidationRule.id).toBe(
      createdValidationRule.id,
    );
    expect(
      (await findValidationRules(companyObjectMetadataId)).map(({ id }) => id),
    ).not.toContain(createdValidationRule.id);
  });

  it('should keep both edits when two rules of the same object are updated at the same time', async () => {
    const firstValidationRule = await createRule({
      objectMetadataId: companyObjectMetadataId,
      name: 'First',
      expression: 'isDefined(name)',
      message: 'First message',
    });
    const secondValidationRule = await createRule({
      objectMetadataId: companyObjectMetadataId,
      name: 'Second',
      expression: 'not isDefined(employees) or employees >= 0',
      message: 'Second message',
    });

    const responses = await Promise.all([
      updateValidationRule(firstValidationRule.id, {
        message: 'First message, edited',
      }),
      updateValidationRule(secondValidationRule.id, { isActive: false }),
    ]);

    expect(responses.map((response) => response.body.errors)).toEqual([
      undefined,
      undefined,
    ]);

    const validationRuleById = new Map(
      (await findValidationRules(companyObjectMetadataId)).map(
        (validationRule) => [validationRule.id, validationRule],
      ),
    );

    expect(validationRuleById.get(firstValidationRule.id)).toMatchObject({
      message: 'First message, edited',
      isActive: true,
    });
    expect(validationRuleById.get(secondValidationRule.id)).toMatchObject({
      message: 'Second message',
      isActive: false,
    });
  });
  it('should accept back the condition it returns, and field names mixed with its symbols', async () => {
    const validationRule = await createRule({
      objectMetadataId: companyObjectMetadataId,
      name: 'Named or staffed',
      expression: 'isNonEmptyString(name) or employees > 0',
      message: 'Name the company or give it employees',
    });

    expect(validationRule.expression).toBe('isNonEmptyString($f1) or $f2 > 0');

    const unchangedResponse = await updateValidationRule(validationRule.id, {
      expression: validationRule.expression,
      bindings: validationRule.bindings,
    });

    expect(unchangedResponse.body.data.updateValidationRule).toMatchObject({
      expression: validationRule.expression,
      bindings: validationRule.bindings,
    });

    const mixedResponse = await updateValidationRule(validationRule.id, {
      expression: '$f2 > 0 or isNonEmptyString(name)',
    });

    expect(mixedResponse.body.data.updateValidationRule).toMatchObject({
      expression: '$f1 > 0 or isNonEmptyString($f2)',
      bindings: {
        $f1: validationRule.bindings.$f2,
        $f2: validationRule.bindings.$f1,
      },
    });
  });
});
