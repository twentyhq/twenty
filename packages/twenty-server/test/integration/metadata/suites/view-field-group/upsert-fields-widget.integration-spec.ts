import {
  VIEW_FIELD_GQL_FIELDS,
  VIEW_FIELD_GROUP_GQL_FIELDS,
  VIEW_GQL_FIELDS,
} from 'test/integration/constants/view-gql-fields.constants';
import { findCoreViewFieldGroups } from 'test/integration/metadata/suites/view-field-group/utils/find-core-view-field-groups.util';
import { upsertFieldsWidget } from 'test/integration/metadata/suites/view-field-group/utils/upsert-fields-widget.util';
import { findCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields.util';
import { v4 as uuidv4 } from 'uuid';

type FieldsWidgetTestSetup = {
  widgetId: string;
  viewId: string;
  viewFields: Array<{
    id: string;
    fieldMetadataId: string;
    position: number;
    isVisible: boolean;
    viewFieldGroupId: string | null;
  }>;
};

const VIEW_WITH_FIELDS_AND_GROUPS_GQL_FIELDS = `
  ${VIEW_GQL_FIELDS}
  viewFields {
    ${VIEW_FIELD_GQL_FIELDS}
  }
  viewFieldGroups {
    ${VIEW_FIELD_GROUP_GQL_FIELDS}
  }
`;

const fetchFieldsWidgetTestSetup = async (): Promise<FieldsWidgetTestSetup> => {
  const widgets = await global.testDataSource.query(
    `SELECT id, configuration->>'viewId' AS "viewId"
     FROM core."pageLayoutWidget"
     WHERE type = 'FIELDS'
       AND "deletedAt" IS NULL
     LIMIT 1`,
  );

  expect(widgets.length).toBeGreaterThan(0);

  const { id: widgetId, viewId } = widgets[0];

  expect(widgetId).toBeDefined();
  expect(viewId).toBeDefined();

  const { data } = await findCoreViewFields({
    viewId,
    gqlFields: 'id fieldMetadataId position isVisible viewFieldGroupId',
    expectToFail: false,
  });

  const viewFields = data.getCoreViewFields;

  return { widgetId, viewId, viewFields };
};

describe('upsertFieldsWidget', () => {
  let testSetup: FieldsWidgetTestSetup;

  beforeAll(async () => {
    testSetup = await fetchFieldsWidgetTestSetup();
  });

  describe('with groups input', () => {
    it('should upsert fields widget with a new group and return a view', async () => {
      const newGroupId = uuidv4();
      const targetFields = testSetup.viewFields.slice(0, 2);

      const { data, errors } = await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: newGroupId,
              name: 'Test Group',
              position: 0,
              isVisible: true,
              fields: targetFields.map((f, index) => ({
                viewFieldId: f.id,
                isVisible: true,
                position: index,
              })),
            },
          ],
        },
        gqlFields: VIEW_WITH_FIELDS_AND_GROUPS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertFieldsWidget).toBeDefined();
      expect(data.upsertFieldsWidget.id).toBeDefined();
      expect(data.upsertFieldsWidget.name).toBeDefined();

      const { data: groupsData } = await findCoreViewFieldGroups({
        viewId: testSetup.viewId,
        gqlFields: 'id name',
        expectToFail: false,
      });

      const createdGroup = groupsData.getCoreViewFieldGroups.find(
        (g: { id: string }) => g.id === newGroupId,
      );

      expect(createdGroup).toBeDefined();
      expect(createdGroup!.name).toBe('Test Group');
    });

    it('should hard-delete groups not included in the input', async () => {
      // First, create a group via upsert
      const groupToDeleteId = uuidv4();
      const groupToKeepId = uuidv4();

      const twoFields = testSetup.viewFields.slice(0, 2);

      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: groupToDeleteId,
              name: 'Group To Delete',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: twoFields[0].id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
            {
              id: groupToKeepId,
              name: 'Group To Keep',
              position: 1,
              isVisible: true,
              fields: [
                {
                  viewFieldId: twoFields[1].id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
          ],
        },
      });

      // Now upsert again without the first group
      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: groupToKeepId,
              name: 'Group To Keep',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: twoFields[1].id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
          ],
        },
      });

      // Verify the omitted group was hard-deleted (row should be completely gone)
      const deletedGroup = await global.testDataSource.query(
        `SELECT id FROM core."viewFieldGroup"
         WHERE id = $1`,
        [groupToDeleteId],
      );

      expect(deletedGroup.length).toBe(0);

      // Verify the kept group is still active
      const { data: keptGroupData } = await findCoreViewFieldGroups({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      const keptGroup = keptGroupData.getCoreViewFieldGroups.find(
        (g: { id: string }) => g.id === groupToKeepId,
      );

      expect(keptGroup).toBeDefined();
    });

    it('should update view field positions and visibility within groups', async () => {
      const groupId = uuidv4();
      const targetField = testSetup.viewFields[0];

      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: groupId,
              name: 'Position Test Group',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: targetField.id,
                  isVisible: false,
                  position: 42,
                },
              ],
            },
          ],
        },
      });

      // Verify the view field was updated
      const { data: fieldsData } = await findCoreViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id isVisible position viewFieldGroupId',
        expectToFail: false,
      });

      const updatedField = fieldsData.getCoreViewFields.find(
        (f: { id: string }) => f.id === targetField.id,
      );

      expect(updatedField).toBeDefined();
      expect(updatedField!.isVisible).toBe(false);
      expect(updatedField!.position).toBe(42);
      expect(updatedField!.viewFieldGroupId).toBe(groupId);
    });
  });

  describe('with fields input (ungrouped)', () => {
    it('should upsert fields widget with flat fields and return a view', async () => {
      const targetFields = testSetup.viewFields.slice(0, 3);

      const { data, errors } = await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          fields: targetFields.map((f, index) => ({
            viewFieldId: f.id,
            isVisible: true,
            position: index,
          })),
        },
        gqlFields: VIEW_WITH_FIELDS_AND_GROUPS_GQL_FIELDS,
      });

      expect(errors).toBeUndefined();
      expect(data.upsertFieldsWidget).toBeDefined();
      expect(data.upsertFieldsWidget.id).toBeDefined();
    });

    it('should hard-delete all existing groups when using flat fields', async () => {
      // First create a group via upsert
      const groupId = uuidv4();
      const targetField = testSetup.viewFields[0];

      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: groupId,
              name: 'Group To Be Deleted',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: targetField.id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
          ],
        },
      });

      // Verify group exists
      const { data: groupBeforeData } = await findCoreViewFieldGroups({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      const groupBefore = groupBeforeData.getCoreViewFieldGroups.find(
        (g: { id: string }) => g.id === groupId,
      );

      expect(groupBefore).toBeDefined();

      // Now upsert with flat fields
      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          fields: [
            {
              viewFieldId: targetField.id,
              isVisible: true,
              position: 0,
            },
          ],
        },
      });

      // Verify all groups are soft-deleted
      const { data: activeGroupsData } = await findCoreViewFieldGroups({
        viewId: testSetup.viewId,
        gqlFields: 'id',
        expectToFail: false,
      });

      expect(activeGroupsData.getCoreViewFieldGroups.length).toBe(0);

      // Verify the field's viewFieldGroupId is null
      const { data: updatedFieldData } = await findCoreViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id viewFieldGroupId',
        expectToFail: false,
      });

      const updatedField = updatedFieldData.getCoreViewFields.find(
        (f: { id: string }) => f.id === targetField.id,
      );

      expect(updatedField).toBeDefined();
      expect(updatedField!.viewFieldGroupId).toBeNull();
    });

    it('should update field positions and visibility without groups', async () => {
      const targetField = testSetup.viewFields[0];
      const groupId = uuidv4();

      // First assign the field to a group so it has a non-null viewFieldGroupId
      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: groupId,
              name: 'Temporary Group',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: targetField.id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
          ],
        },
      });

      // Now switch to flat fields with different position and visibility
      await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          fields: [
            {
              viewFieldId: targetField.id,
              isVisible: false,
              position: 99,
            },
          ],
        },
      });

      const { data: updatedFieldData } = await findCoreViewFields({
        viewId: testSetup.viewId,
        gqlFields: 'id isVisible position viewFieldGroupId',
        expectToFail: false,
      });

      const updatedField = updatedFieldData.getCoreViewFields.find(
        (f: { id: string }) => f.id === targetField.id,
      );

      expect(updatedField).toBeDefined();
      expect(updatedField!.isVisible).toBe(false);
      expect(updatedField!.position).toBe(99);
      expect(updatedField!.viewFieldGroupId).toBeNull();
    });
  });

  describe('validation', () => {
    it('should fail when both groups and fields are provided', async () => {
      const targetField = testSetup.viewFields[0];

      const { errors } = await upsertFieldsWidget({
        expectToFail: true,
        input: {
          widgetId: testSetup.widgetId,
          groups: [
            {
              id: uuidv4(),
              name: 'Test',
              position: 0,
              isVisible: true,
              fields: [
                {
                  viewFieldId: targetField.id,
                  isVisible: true,
                  position: 0,
                },
              ],
            },
          ],
          fields: [
            {
              viewFieldId: targetField.id,
              isVisible: true,
              position: 0,
            },
          ],
        },
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when neither groups nor fields are provided', async () => {
      const { errors } = await upsertFieldsWidget({
        expectToFail: true,
        input: {
          widgetId: testSetup.widgetId,
        },
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when widget id does not exist', async () => {
      const { errors } = await upsertFieldsWidget({
        expectToFail: true,
        input: {
          widgetId: uuidv4(),
          fields: [
            {
              viewFieldId: testSetup.viewFields[0].id,
              isVisible: true,
              position: 0,
            },
          ],
        },
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('return type', () => {
    it('should return a view with the expected fields', async () => {
      const targetField = testSetup.viewFields[0];

      const { data } = await upsertFieldsWidget({
        expectToFail: false,
        input: {
          widgetId: testSetup.widgetId,
          fields: [
            {
              viewFieldId: targetField.id,
              isVisible: true,
              position: 0,
            },
          ],
        },
        gqlFields: VIEW_WITH_FIELDS_AND_GROUPS_GQL_FIELDS,
      });

      const view = data.upsertFieldsWidget;

      expect(view.id).toBeDefined();
      expect(view.name).toBeDefined();
      expect(view.objectMetadataId).toBeDefined();
      expect(view.workspaceId).toBeDefined();
      expect(view.createdAt).toBeDefined();
      expect(view.updatedAt).toBeDefined();
      expect(Array.isArray(view.viewFields)).toBe(true);
      expect(Array.isArray(view.viewFieldGroups)).toBe(true);
    });
  });
});
