/* @license Enterprise */

import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/create-record-inheritance-rule.util';
import { deleteRecordInheritanceRule } from 'test/integration/metadata/suites/record-inheritance-rule/utils/delete-record-inheritance-rule.util';
import { findRecordInheritanceRules } from 'test/integration/metadata/suites/record-inheritance-rule/utils/find-record-inheritance-rules.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type RecordInheritanceRuleDTO } from 'src/engine/metadata-modules/record-inheritance-rule/dtos/record-inheritance-rule.dto';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
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

  // The metadata API merges morph targets into one field, the core table keeps one per target
  const findFieldId = async ({
    nameSingular,
    fieldName,
  }: {
    nameSingular: string;
    fieldName: string;
  }): Promise<string> =>
    (
      await getCoreRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      ).findOneOrFail({
        where: {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          objectMetadataId: findObject(nameSingular).id,
          name: fieldName,
        },
      })
    ).id;

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
      fieldMetadataId: await findFieldId({
        nameSingular: 'person',
        fieldName: 'company',
      }),
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
      fieldMetadataId: await findFieldId({
        nameSingular: 'note',
        fieldName: 'noteTargets',
      }),
      junctionFieldMetadataId: await findFieldId({
        nameSingular: 'noteTarget',
        fieldName: 'targetCompany',
      }),
    });

    expect(createdRule).toMatchObject({
      objectMetadataId: findObject('note').id,
      parentObjectMetadataId: findObject('company').id,
    });
  });

  it('should reject a duplicate rule', async () => {
    const input = {
      objectMetadataId: findObject('person').id,
      fieldMetadataId: await findFieldId({
        nameSingular: 'person',
        fieldName: 'company',
      }),
    };

    await createRule(input);

    const response = await createRecordInheritanceRule(input);

    expect(response.errors).toBeDefined();
  });

  it('should reject a one hop rule on a field that does not point to a single parent', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('company').id,
      fieldMetadataId: await findFieldId({
        nameSingular: 'company',
        fieldName: 'people',
      }),
    });

    expect(response.errors).toBeDefined();
  });

  it('should reject a rule on a field of another object', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('opportunity').id,
      fieldMetadataId: await findFieldId({
        nameSingular: 'person',
        fieldName: 'company',
      }),
    });

    expect(response.errors).toBeDefined();
  });

  it('should reject a two hop rule whose junction field is not on the junction', async () => {
    const response = await createRecordInheritanceRule({
      objectMetadataId: findObject('note').id,
      fieldMetadataId: await findFieldId({
        nameSingular: 'note',
        fieldName: 'noteTargets',
      }),
      junctionFieldMetadataId: await findFieldId({
        nameSingular: 'person',
        fieldName: 'company',
      }),
    });

    expect(response.errors).toBeDefined();
  });
});
