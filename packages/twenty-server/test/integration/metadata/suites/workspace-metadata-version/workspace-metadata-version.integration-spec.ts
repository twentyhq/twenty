import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-view-filter.util';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const getMetadataVersion = async (): Promise<number> => {
  const [{ metadataVersion }] = await global.testDataSource.query(
    `SELECT "metadataVersion" FROM core.workspace WHERE id = $1`,
    [SEED_APPLE_WORKSPACE_ID],
  );

  return metadataVersion;
};

describe('Workspace metadata version', () => {
  let objectMetadataId: string;
  let fieldMetadataId: string;

  beforeAll(async () => {
    const { data: objectData } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'metadataVersionTestObject',
        namePlural: 'metadataVersionTestObjects',
        labelSingular: 'Metadata Version Test Object',
        labelPlural: 'Metadata Version Test Objects',
        icon: 'IconBox',
      },
    });

    objectMetadataId = objectData.createOneObject.id;

    const { data: fieldData } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: true,
      },
    });

    fieldMetadataId = fieldData.createOneField.id;
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

  it('should not bump the metadata version when a view filter is created', async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Metadata version test view',
      objectMetadataId,
    });

    const versionBefore = await getMetadataVersion();

    await createOneViewFilter({
      expectToFail: false,
      input: {
        fieldMetadataId,
        viewId: view.id,
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
      },
    });

    expect(await getMetadataVersion()).toBe(versionBefore);
  });

  it('should bump the metadata version when a field is created', async () => {
    const versionBefore = await getMetadataVersion();

    await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'otherTestField',
        label: 'Other Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: true,
      },
    });

    expect(await getMetadataVersion()).toBeGreaterThan(versionBefore);
  });
});
