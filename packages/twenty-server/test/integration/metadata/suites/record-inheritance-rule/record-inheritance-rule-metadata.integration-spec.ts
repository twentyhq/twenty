/* @license Enterprise */

import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/create-record-inheritance-rule.util';
import { deleteRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/delete-record-inheritance-rule.util';
import { findRecordInheritanceRules } from 'test/integration/metadata/suites/record-inheritance-rule/utils/find-record-inheritance-rules.util';
import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

type ObjectWithFields = Awaited<
  ReturnType<typeof findManyObjectMetadata>
>['objects'][number];

describe('Record inheritance rule metadata', () => {
  let objects: ObjectWithFields[];

  const findObject = (nameSingular: string): ObjectWithFields => {
    const object = objects.find(
      (candidate) => candidate.nameSingular === nameSingular,
    );

    jestExpectToBeDefined(object);

    return object;
  };

  const findFieldId = (nameSingular: string, fieldName: string): string => {
    const field = (findObject(nameSingular).fieldsList ?? []).find(
      (candidate) => candidate.name === fieldName,
    );

    jestExpectToBeDefined(field);

    return field.id;
  };

  const createRule = async (
    input: Parameters<typeof createRecordInheritanceRule>[0],
  ): Promise<RecordInheritanceRuleDTO> => {
    const { recordInheritanceRule: createdRule } =
      await createRecordInheritanceRule(input);

    jestExpectToBeDefined(createdRule);

    return createdRule;
  };

  beforeAll(async () => {
    const response = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
        fieldsList { id name }
      `,
    });

    objects = response.objects;
  });

  afterEach(async () => {
    for (const rule of await findRecordInheritanceRules()) {
      await deleteRecordInheritanceRule(rule.id);
    }
  });

  it('should create, list and delete a one hop rule', async () => {
    const createdRule = await createRule({
      objectMetadataId: findObject('person').id,
      fieldMetadataId: findFieldId('person', 'company'),
    });

    expect(createdRule).toMatchObject({
      objectMetadataId: findObject('person').id,
      parentObjectMetadataId: findObject('company').id,
      junctionFieldMetadataId: null,
    });
    expect(await findRecordInheritanceRules()).toEqual([createdRule]);

    await deleteRecordInheritanceRule(createdRule.id);

    expect(await findRecordInheritanceRules()).toEqual([]);
  });

  it('should create a two hop rule through a junction object', async () => {
    const createdRule = await createRule({
      objectMetadataId: findObject('note').id,
      fieldMetadataId: findFieldId('note', 'noteTargets'),
      junctionFieldMetadataId: findFieldId('noteTarget', 'targetCompany'),
    });

    expect(createdRule).toMatchObject({
      objectMetadataId: findObject('note').id,
      parentObjectMetadataId: findObject('company').id,
    });
  });

  it('should reject a duplicate rule', async () => {
    const input = {
      objectMetadataId: findObject('person').id,
      fieldMetadataId: findFieldId('person', 'company'),
    };

    await createRule(input);

    const response = await createRecordInheritanceRule(input);

    expect(response.errors).toBeDefined();
  });

  it('should reject a one hop rule on a field that does not point to a single parent', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('company').id,
      fieldMetadataId: findFieldId('company', 'people'),
    });

    expect(response.errors).toBeDefined();
  });

  it('should reject a rule on a field of another object', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('opportunity').id,
      fieldMetadataId: findFieldId('person', 'company'),
    });

    expect(response.errors).toBeDefined();
  });

  it('should reject a two hop rule whose junction field is not on the junction', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('note').id,
      fieldMetadataId: findFieldId('note', 'noteTargets'),
      junctionFieldMetadataId: findFieldId('person', 'company'),
    });

    expect(response.errors).toBeDefined();
  });
});
