import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/create-one-core-view-group.util';
import { deleteOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/delete-one-core-view-group.util';
import { destroyOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/destroy-one-core-view-group.util';
import { findCoreViewGroups } from 'test/integration/metadata/suites/view-group/utils/find-core-view-groups.util';
import { updateOneCoreViewGroup } from 'test/integration/metadata/suites/view-group/utils/update-one-core-view-group.util';
import { destroyOneCoreView } from 'test/integration/metadata/suites/view/utils/destroy-one-core-view.util';
import { assertViewGroupStructure } from 'test/integration/utils/view-test.util';
import { FieldMetadataType } from 'twenty-shared/types';

const TEST_NOT_EXISTING_VIEW_GROUP_ID = '20202020-0000-4000-8000-000000000003';

describe('View Group Resolver', () => {
  let testViewId: string;
  let testObjectMetadataId: string;
  let testFieldMetadataId: string;

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myGroupTestObject',
        namePlural: 'myGroupTestObjects',
        labelSingular: 'My Group Test Object',
        labelPlural: 'My Group Test Objects',
        icon: 'Icon123',
      },
    });

    testObjectMetadataId = objectMetadataId;

    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'testField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testObjectMetadataId,
        isLabelSyncedWithName: true,
      },
    });

    testFieldMetadataId = fieldMetadataId;
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testObjectMetadataId },
    });
  });

  beforeEach(async () => {
    const view = await createTestViewWithGraphQL({
      name: 'Test View for Groups',
      objectMetadataId: testObjectMetadataId,
    });

    testViewId = view.id;
  });

  afterEach(async () => {
    await destroyOneCoreView({
      viewId: testViewId,
      expectToFail: false,
    });
  });

  describe('getCoreViewGroups', () => {
    it('should return empty array when no view groups exist', async () => {
      const { data } = await findCoreViewGroups({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(data.getCoreViewGroups).toEqual([]);
    });

    it('should return view groups for a specific view', async () => {
      await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: true,
          fieldValue: 'active',
          position: 0,
        },
      });

      const { data } = await findCoreViewGroups({
        viewId: testViewId,
        expectToFail: false,
      });

      expect(data.getCoreViewGroups).toHaveLength(1);
      assertViewGroupStructure(data.getCoreViewGroups[0], {
        fieldMetadataId: testFieldMetadataId,
        isVisible: true,
        fieldValue: 'active',
        position: 0,
        viewId: testViewId,
      });
    });
  });

  describe('createCoreViewGroup', () => {
    it('should create a new view group', async () => {
      const { data } = await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: false,
          fieldValue: 'inactive',
          position: 1,
        },
      });

      assertViewGroupStructure(data.createCoreViewGroup, {
        fieldMetadataId: testFieldMetadataId,
        isVisible: false,
        fieldValue: 'inactive',
        position: 1,
        viewId: testViewId,
      });
    });

    it('should create a view group with null fieldValue', async () => {
      const { data } = await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: true,
          fieldValue: '',
          position: 2,
        },
      });

      assertViewGroupStructure(data.createCoreViewGroup, {
        fieldMetadataId: testFieldMetadataId,
        isVisible: true,
        fieldValue: '',
        position: 2,
      });
    });
  });

  describe('updateCoreViewGroup', () => {
    it('should update an existing view group', async () => {
      const { data: createData } = await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: true,
          fieldValue: 'original',
          position: 0,
        },
      });
      const viewGroup = createData.createCoreViewGroup;

      const { data } = await updateOneCoreViewGroup({
        expectToFail: false,
        input: {
          id: viewGroup.id,
          update: {
            isVisible: false,
            fieldValue: 'updated',
            position: 5,
          },
        },
      });

      expect(data.updateCoreViewGroup).toMatchObject({
        id: viewGroup.id,
        isVisible: false,
        fieldValue: 'updated',
        position: 5,
      });
    });

    it('should throw an error when updating non-existent view group', async () => {
      const { errors } = await updateOneCoreViewGroup({
        expectToFail: true,
        input: {
          id: TEST_NOT_EXISTING_VIEW_GROUP_ID,
          update: {
            isVisible: false,
          },
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('deleteCoreViewGroup', () => {
    it('should delete an existing view group', async () => {
      const { data: createData } = await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: true,
          fieldValue: 'to delete',
          position: 0,
        },
      });
      const viewGroup = createData.createCoreViewGroup;

      const { data } = await deleteOneCoreViewGroup({
        expectToFail: false,
        input: {
          id: viewGroup.id,
        },
      });

      expect(data.deleteCoreViewGroup).toMatchObject({
        id: viewGroup.id,
      });
      expect(data.deleteCoreViewGroup.deletedAt).toBeDefined();
    });

    it('should throw an error when deleting non-existent view group', async () => {
      const { errors } = await deleteOneCoreViewGroup({
        expectToFail: true,
        input: {
          id: TEST_NOT_EXISTING_VIEW_GROUP_ID,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });

  describe('destroyCoreViewGroup', () => {
    it('should destroy an existing view group', async () => {
      const { data: createData } = await createOneCoreViewGroup({
        expectToFail: false,
        input: {
          viewId: testViewId,
          fieldMetadataId: testFieldMetadataId,
          isVisible: true,
          fieldValue: 'to destroy',
          position: 0,
        },
      });
      const viewGroup = createData.createCoreViewGroup;

      await deleteOneCoreViewGroup({
        input: {
          id: viewGroup.id,
        },
        expectToFail: false,
      });

      const { data } = await destroyOneCoreViewGroup({
        expectToFail: false,
        input: {
          id: viewGroup.id,
        },
      });

      expect(data.destroyCoreViewGroup).toMatchObject({
        id: viewGroup.id,
      });
    });

    it('should throw an error when destroying non-existent view group', async () => {
      const { errors } = await destroyOneCoreViewGroup({
        expectToFail: true,
        input: {
          id: TEST_NOT_EXISTING_VIEW_GROUP_ID,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    });
  });
});
