import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { findOneCoreView } from 'test/integration/metadata/suites/view/utils/find-one-core-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

const VIEW_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  position
`;

type TestSetup = {
  objectMetadataId: string;
  groupByFieldMetadataId: string;
  nonGroupByFieldMetadataId: string;
  viewWithGroupId: string;
  viewWithoutGroupId: string;
};

describe('field-for-group-by-deactivation-deletes-views', () => {
  let testSetup: TestSetup;

  const verifyViewExists = async (viewId: string, shouldExist: boolean) => {
    const {
      data: { getCoreView },
    } = await findOneCoreView({
      viewId,
      gqlFields: VIEW_FIELDS,
      expectToFail: false,
    });

    if (shouldExist) {
      expect(isDefined(getCoreView)).toBe(true);
    } else {
      expect(getCoreView).toBeNull();
    }

    return getCoreView;
  };

  const deactivateFieldAndVerify = async (fieldId: string) => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldId);
    expect(data.updateOneField.isActive).toBe(false);
  };

  beforeEach(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'viewGroupDeletionTestObject',
        namePlural: 'viewGroupDeletionTestObjects',
        labelSingular: 'View Group Deletion Test Object',
        labelPlural: 'View Group Deletion Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: groupByFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'groupByField',
        type: FieldMetadataType.SELECT,
        label: 'Group By Field',
        objectMetadataId,
        options: [
          { label: 'Option 1', value: 'OPTION_1', color: 'blue', position: 0 },
          { label: 'Option 2', value: 'OPTION_2', color: 'red', position: 1 },
          { label: 'Option 3', value: 'OPTION_3', color: 'green', position: 2 },
        ],
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: nonGroupByFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'normalField',
        type: FieldMetadataType.TEXT,
        label: 'Normal Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: { createCoreView: viewWithGroup },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('View With Group'),
        objectMetadataId,
        type: ViewType.TABLE,
        mainGroupByFieldMetadataId: groupByFieldMetadataId,
        icon: 'IconTable',
      },
      gqlFields: VIEW_FIELDS,
      expectToFail: false,
    });

    const {
      data: { createCoreView: viewWithoutGroup },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('View Without Group'),
        objectMetadataId,
        type: ViewType.TABLE,
        icon: 'IconTable',
      },
      gqlFields: VIEW_FIELDS,
      expectToFail: false,
    });

    testSetup = {
      objectMetadataId,
      groupByFieldMetadataId,
      nonGroupByFieldMetadataId,
      viewWithGroupId: viewWithGroup.id,
      viewWithoutGroupId: viewWithoutGroup.id,
    };
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  it('should delete view when mainGroupByFieldMetadata is deactivated', async () => {
    await verifyViewExists(testSetup.viewWithGroupId, true);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);

    await deactivateFieldAndVerify(testSetup.groupByFieldMetadataId);

    await verifyViewExists(testSetup.viewWithGroupId, false);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);
  });

  it('should not delete view when field not used in view group is deactivated', async () => {
    await verifyViewExists(testSetup.viewWithGroupId, true);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);

    await deactivateFieldAndVerify(testSetup.nonGroupByFieldMetadataId);

    await verifyViewExists(testSetup.viewWithGroupId, true);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);
  });

  it('should delete multiple views when they all use the same field in view groups', async () => {
    const {
      data: { createCoreView: secondViewWithGroup },
    } = await createOneCoreView({
      input: {
        name: generateRecordName('Second View With Group'),
        objectMetadataId: testSetup.objectMetadataId,
        type: ViewType.TABLE,
        mainGroupByFieldMetadataId: testSetup.groupByFieldMetadataId,
        icon: 'IconTable',
      },
      gqlFields: VIEW_FIELDS,
      expectToFail: false,
    });

    await verifyViewExists(testSetup.viewWithGroupId, true);
    await verifyViewExists(secondViewWithGroup.id, true);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);

    await deactivateFieldAndVerify(testSetup.groupByFieldMetadataId);

    await verifyViewExists(testSetup.viewWithGroupId, false);
    await verifyViewExists(secondViewWithGroup.id, false);
    await verifyViewExists(testSetup.viewWithoutGroupId, true);
  });
});
