/* @license Enterprise */

import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import {
  createValidationRule,
  deleteValidationRule,
  findValidationRules,
  findValidationRulesReadingField,
  updateValidationRule,
} from 'test/integration/metadata/suites/validation-rule/utils/validation-rule-api.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

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

  it('should disable the rule and keep its error field when the field is deactivated', async () => {
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
      errorFieldMetadataId: scoreFieldMetadataId,
    });

    const enableResponse = await updateValidationRule(validationRuleId, {
      isActive: true,
    });

    expect(enableResponse.body.errors?.[0]?.message).toBe(
      'Unknown field "points"',
    );
  });

  it('should keep the rule disabled and move its error to the record when the field is deleted', async () => {
    await deleteOneFieldMetadata({
      expectToFail: false,
      input: { idToDelete: scoreFieldMetadataId },
    });

    expect(await findValidationRule()).toMatchObject({
      isActive: false,
      errorFieldMetadataId: null,
    });
  });

  it('should disable the rule when the workspace deactivates a field on a standard object', async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });
    const companyObject = objects.find(
      ({ nameSingular }) => nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObject);
    const companyObjectMetadataId = companyObject.id;
    const {
      data: {
        createOneField: { id: headcountFieldId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'lifecycleHeadcount',
        label: 'Lifecycle headcount',
        type: FieldMetadataType.NUMBER,
        objectMetadataId: companyObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: 'id',
    });
    const response = await createValidationRule({
      objectMetadataId: companyObjectMetadataId,
      name: 'Company has employees',
      expression: 'lifecycleHeadcount > 0',
      message: 'Add employees',
    });
    const standardFieldRuleId = response.body.data.createValidationRule.id;

    try {
      expect(await findValidationRulesReadingField(headcountFieldId)).toEqual([
        expect.objectContaining({ name: 'Company has employees' }),
      ]);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: headcountFieldId,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
      });

      const validationRules = await findValidationRules(
        companyObjectMetadataId,
      );

      expect(
        validationRules.find(({ id }) => id === standardFieldRuleId),
      ).toMatchObject({ isActive: false });
      expect(await findValidationRulesReadingField(headcountFieldId)).toEqual(
        [],
      );

      const enableResponse = await updateValidationRule(standardFieldRuleId, {
        isActive: true,
      });

      expect(enableResponse.body.errors?.[0]?.message).toBe(
        'Unknown field "lifecycleHeadcount"',
      );
    } finally {
      await deleteValidationRule(standardFieldRuleId);
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: headcountFieldId,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
      });
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: headcountFieldId },
      });
    }
  }, 60000);

  it('should find a rule on another object reading the field through a relation', async () => {
    const rows: { fieldId: string; personObjectId: string }[] =
      await globalThis.testDataSource.query(
        `SELECT field.id AS "fieldId", person.id AS "personObjectId"
         FROM core."fieldMetadata" field
         JOIN core."objectMetadata" company ON company.id = field."objectMetadataId"
         JOIN core."objectMetadata" person ON person."workspaceId" = company."workspaceId"
         WHERE company."universalIdentifier" = $1
           AND person."universalIdentifier" = $2
           AND company."workspaceId" = $3
           AND field.name = 'employees'`,
        [
          STANDARD_OBJECTS.company.universalIdentifier,
          STANDARD_OBJECTS.person.universalIdentifier,
          SEED_APPLE_WORKSPACE_ID,
        ],
      );
    const { fieldId, personObjectId } = rows[0];
    const response = await createValidationRule({
      objectMetadataId: personObjectId,
      name: 'Person company has employees',
      expression: 'company.employees > 0',
      message: 'Add employees',
    });

    try {
      expect(await findValidationRulesReadingField(fieldId)).toEqual([
        expect.objectContaining({ name: 'Person company has employees' }),
      ]);

      const peopleRows: { id: string }[] =
        await globalThis.testDataSource.query(
          `SELECT field.id
           FROM core."fieldMetadata" field
           JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
           WHERE object."universalIdentifier" = $1
             AND object."workspaceId" = $2
             AND field.name = 'people'`,
          [
            STANDARD_OBJECTS.company.universalIdentifier,
            SEED_APPLE_WORKSPACE_ID,
          ],
        );

      expect(await findValidationRulesReadingField(peopleRows[0].id)).toEqual([
        expect.objectContaining({ name: 'Person company has employees' }),
      ]);
    } finally {
      await deleteValidationRule(response.body.data.createValidationRule.id);
    }
  }, 60000);

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
