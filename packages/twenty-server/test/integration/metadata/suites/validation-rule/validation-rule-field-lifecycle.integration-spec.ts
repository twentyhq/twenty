import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  createValidationRule,
  findValidationRules,
  updateValidationRule,
} from 'test/integration/metadata/suites/validation-rule/utils/validation-rule-api.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FeatureFlagKey, FieldMetadataType } from 'twenty-shared/types';

const OBJECT_NAME_SINGULAR = 'validationRuleLifecycleGadget';

describe('Validation rules should follow the fields they read', () => {
  let objectMetadataId: string;
  let scoreFieldMetadataId: string;
  let validationRuleId: string;

  const findValidationRule = async () =>
    (await findValidationRules(objectMetadataId)).find(
      ({ id }) => id === validationRuleId,
    );

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
      value: true,
      expectToFail: false,
    });

    const {
      data: {
        createOneObject: { id },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: OBJECT_NAME_SINGULAR,
        namePlural: `${OBJECT_NAME_SINGULAR}s`,
        labelSingular: 'Lifecycle gadget',
        labelPlural: 'Lifecycle gadgets',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    objectMetadataId = id;

    const {
      data: {
        createOneField: { id: scoreFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'score',
        label: 'Score',
        type: FieldMetadataType.NUMBER,
        objectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });

    scoreFieldMetadataId = scoreFieldId;

    const response = await createValidationRule({
      objectMetadataId,
      name: 'Score is positive',
      expression: 'not isDefined(score) or score >= 0',
      message: 'Score cannot be negative',
      errorFieldMetadataId: scoreFieldMetadataId,
    });

    validationRuleId = response.body.data.createValidationRule.id;
    jestExpectToBeDefined(validationRuleId);
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: objectMetadataId },
    });
  });

  it('should rewrite the rule when the field is renamed', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: scoreFieldMetadataId,
        updatePayload: { name: 'points', label: 'Points' },
      },
      gqlFields: 'id',
    });

    expect(await findValidationRule()).toMatchObject({
      expression: 'not isDefined(points) or points >= 0',
      isActive: true,
      errorFieldMetadataId: scoreFieldMetadataId,
    });
  });

  it('should disable the rule and move its error to the record when the field is deactivated', async () => {
    await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: scoreFieldMetadataId,
        updatePayload: { isActive: false },
      },
      gqlFields: 'id',
    });

    expect(await findValidationRule()).toMatchObject({
      isActive: false,
      errorFieldMetadataId: null,
    });

    const enableResponse = await updateValidationRule(validationRuleId, {
      isActive: true,
    });

    expect(enableResponse.body.errors?.[0]?.message).toBe(
      'Unknown field "points"',
    );
  });

  it('should keep the rule disabled when the field is deleted', async () => {
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: scoreFieldMetadataId },
    });

    expect(await findValidationRule()).toMatchObject({ isActive: false });
  });

  it('should delete the rules of an object when the object is deleted', async () => {
    const {
      data: {
        createOneObject: { id: temporaryObjectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: `${OBJECT_NAME_SINGULAR}Temporary`,
        namePlural: `${OBJECT_NAME_SINGULAR}Temporaries`,
        labelSingular: 'Temporary gadget',
        labelPlural: 'Temporary gadgets',
        icon: 'IconBox',
        isLabelSyncedWithName: false,
      },
    });

    await createValidationRule({
      objectMetadataId: temporaryObjectMetadataId,
      name: 'Has a name',
      expression: 'isNonEmptyString(name)',
      message: 'Name it',
    });

    expect(await findValidationRules(temporaryObjectMetadataId)).toHaveLength(
      1,
    );

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: temporaryObjectMetadataId,
        updatePayload: { isActive: false },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: temporaryObjectMetadataId },
    });

    expect(await findValidationRules(temporaryObjectMetadataId)).toEqual([]);
  });
});
