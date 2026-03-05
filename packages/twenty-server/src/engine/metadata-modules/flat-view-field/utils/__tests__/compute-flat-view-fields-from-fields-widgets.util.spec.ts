import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { computeFlatViewFieldsFromFieldsWidgets } from 'src/engine/metadata-modules/flat-view-field/utils/compute-flat-view-fields-from-fields-widgets.util';
import { type FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { type FlatViewFieldGroupMaps } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group-maps.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'app-uid-1';
const VIEW_ID = 'view-db-id-1';
const VIEW_UNIVERSAL_IDENTIFIER = 'view-uid-1';
const VIEW_FIELD_GROUP_ID = 'vfg-db-id-1';
const VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER = 'vfg-uid-1';
const OBJECT_METADATA_UNIVERSAL_IDENTIFIER = 'obj-uid-1';

const buildEmptyFlatEntityMaps = () => ({
  byUniversalIdentifier: {},
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
});

const buildFlatViewMaps = (
  entries: { id: string; universalIdentifier: string }[] = [],
): FlatViewMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entries.map((entry) => [
        entry.universalIdentifier,
        { universalIdentifier: entry.universalIdentifier, id: entry.id },
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      entries.map((entry) => [entry.id, entry.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatViewMaps;

const buildFlatViewFieldGroupMaps = (
  entries: { id: string; universalIdentifier: string }[] = [],
): FlatViewFieldGroupMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entries.map((entry) => [
        entry.universalIdentifier,
        { universalIdentifier: entry.universalIdentifier, id: entry.id },
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      entries.map((entry) => [entry.id, entry.universalIdentifier]),
    ),
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatViewFieldGroupMaps;

const buildFlatViewFieldMaps = (
  entries: {
    universalIdentifier: string;
    viewId: string;
    viewFieldGroupId: string | null;
    position: number;
    deletedAt: string | null;
  }[] = [],
): FlatViewFieldMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entries.map((entry) => [entry.universalIdentifier, entry]),
    ),
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatViewFieldMaps;

const buildFieldsWidget = ({
  widgetUniversalIdentifier = 'widget-uid-1',
  objectMetadataUniversalIdentifier = OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
  viewId = VIEW_ID,
  isVisible = true,
  viewFieldGroupId = null as string | null,
  deletedAt = null as string | null,
}: {
  widgetUniversalIdentifier?: string;
  objectMetadataUniversalIdentifier?: string;
  viewId?: string | null;
  isVisible?: boolean;
  viewFieldGroupId?: string | null;
  deletedAt?: string | null;
} = {}) => ({
  universalIdentifier: widgetUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  type: WidgetType.FIELDS,
  deletedAt,
  configuration: {
    configurationType: WidgetConfigurationType.FIELDS,
    viewId,
    newFieldDefaultConfiguration: {
      isVisible,
      viewFieldGroupId,
    },
  },
  universalConfiguration: null,
});

const buildFlatPageLayoutWidgetMaps = (
  widgets: ReturnType<typeof buildFieldsWidget>[],
): FlatPageLayoutWidgetMaps =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      widgets.map((widget) => [widget.universalIdentifier, widget]),
    ),
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as unknown as FlatPageLayoutWidgetMaps;

describe('computeFlatViewFieldsFromFieldsWidgets', () => {
  describe('when no matching widgets exist', () => {
    it('should return empty array when widget maps are empty', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps:
          buildEmptyFlatEntityMaps() as unknown as FlatPageLayoutWidgetMaps,
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps(),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });

    it('should return empty array when fieldsToCreate is empty', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });

    it('should skip widgets for a different object', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier: 'other-obj-uid',
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });

    it('should skip deleted widgets', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ deletedAt: '2024-01-01T00:00:00.000Z' }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });

    it('should skip widgets without viewId', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewId: null }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps(),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });

    it('should skip widgets whose viewId cannot be resolved', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewId: 'non-existent-view-id' }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps(),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toEqual([]);
    });
  });

  describe('when creating view fields for a single field', () => {
    it('should create a view field with correct properties', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ isVisible: true }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: 'field-uid-1',
        viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
        viewFieldGroupUniversalIdentifier: null,
        isVisible: true,
        size: DEFAULT_VIEW_FIELD_SIZE,
        position: 0,
        aggregateOperation: null,
        deletedAt: null,
      });
      expect(result[0].universalIdentifier).toBeDefined();
      expect(result[0].createdAt).toBeDefined();
      expect(result[0].updatedAt).toBeDefined();
    });

    it('should respect isVisible: false from configuration', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ isVisible: false }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(1);
      expect(result[0].isVisible).toBe(false);
    });
  });

  describe('position computation', () => {
    it('should start at position 0 when no existing view fields', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(0);
    });

    it('should append after the last existing view field position', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'existing-vf-1',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 3,
            deletedAt: null,
          },
          {
            universalIdentifier: 'existing-vf-2',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 7,
            deletedAt: null,
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(8);
    });

    it('should assign sequential positions for multiple fields in the same batch', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-2',
          },
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-3',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'existing-vf-1',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 2,
            deletedAt: null,
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(3);
      expect(result[0].position).toBe(3);
      expect(result[1].position).toBe(4);
      expect(result[2].position).toBe(5);
    });

    it('should ignore deleted view fields when computing position', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'existing-vf-1',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 5,
            deletedAt: null,
          },
          {
            universalIdentifier: 'deleted-vf',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 99,
            deletedAt: '2024-01-01T00:00:00.000Z',
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(6);
    });

    it('should ignore view fields from a different view', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'other-view-vf',
            viewId: 'other-view-db-id',
            viewFieldGroupId: null,
            position: 50,
            deletedAt: null,
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(0);
    });
  });

  describe('view field group handling', () => {
    it('should resolve viewFieldGroupUniversalIdentifier when viewFieldGroupId is set', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewFieldGroupId: VIEW_FIELD_GROUP_ID }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps([
          {
            id: VIEW_FIELD_GROUP_ID,
            universalIdentifier: VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
          },
        ]),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(1);
      expect(result[0].viewFieldGroupUniversalIdentifier).toBe(
        VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
      );
    });

    it('should set viewFieldGroupUniversalIdentifier to null when viewFieldGroupId is null', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewFieldGroupId: null }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].viewFieldGroupUniversalIdentifier).toBeNull();
    });

    it('should compute position only from view fields in the same group', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewFieldGroupId: VIEW_FIELD_GROUP_ID }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'vf-in-group',
            viewId: VIEW_ID,
            viewFieldGroupId: VIEW_FIELD_GROUP_ID,
            position: 2,
            deletedAt: null,
          },
          {
            universalIdentifier: 'vf-no-group',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 99,
            deletedAt: null,
          },
          {
            universalIdentifier: 'vf-other-group',
            viewId: VIEW_ID,
            viewFieldGroupId: 'other-group-id',
            position: 50,
            deletedAt: null,
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps([
          {
            id: VIEW_FIELD_GROUP_ID,
            universalIdentifier: VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIER,
          },
        ]),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(3);
    });

    it('should compute position only from ungrouped view fields when viewFieldGroupId is null', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({ viewFieldGroupId: null }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps([
          {
            universalIdentifier: 'vf-no-group',
            viewId: VIEW_ID,
            viewFieldGroupId: null,
            position: 1,
            deletedAt: null,
          },
          {
            universalIdentifier: 'vf-in-group',
            viewId: VIEW_ID,
            viewFieldGroupId: VIEW_FIELD_GROUP_ID,
            position: 99,
            deletedAt: null,
          },
        ]),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result[0].position).toBe(2);
    });
  });

  describe('multiple widgets for the same object', () => {
    it('should create view fields for each matching widget', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({
            widgetUniversalIdentifier: 'widget-uid-1',
            viewId: 'view-db-id-A',
          }),
          buildFieldsWidget({
            widgetUniversalIdentifier: 'widget-uid-2',
            viewId: 'view-db-id-B',
          }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: 'view-db-id-A', universalIdentifier: 'view-uid-A' },
          { id: 'view-db-id-B', universalIdentifier: 'view-uid-B' },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(2);
      expect(result[0].viewUniversalIdentifier).toBe('view-uid-A');
      expect(result[1].viewUniversalIdentifier).toBe('view-uid-B');
    });
  });

  describe('multiple objects', () => {
    it('should create view fields for fields across different objects', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier: 'obj-uid-1',
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
          {
            objectMetadataUniversalIdentifier: 'obj-uid-2',
            fieldMetadataUniversalIdentifier: 'field-uid-2',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget({
            widgetUniversalIdentifier: 'widget-uid-1',
            objectMetadataUniversalIdentifier: 'obj-uid-1',
            viewId: 'view-db-id-A',
          }),
          buildFieldsWidget({
            widgetUniversalIdentifier: 'widget-uid-2',
            objectMetadataUniversalIdentifier: 'obj-uid-2',
            viewId: 'view-db-id-B',
          }),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: 'view-db-id-A', universalIdentifier: 'view-uid-A' },
          { id: 'view-db-id-B', universalIdentifier: 'view-uid-B' },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toHaveLength(2);

      const viewFieldForObj1 = result.find(
        (viewField) =>
          viewField.fieldMetadataUniversalIdentifier === 'field-uid-1',
      );
      const viewFieldForObj2 = result.find(
        (viewField) =>
          viewField.fieldMetadataUniversalIdentifier === 'field-uid-2',
      );

      expect(viewFieldForObj1?.viewUniversalIdentifier).toBe('view-uid-A');
      expect(viewFieldForObj2?.viewUniversalIdentifier).toBe('view-uid-B');
    });
  });

  describe('unique universal identifiers', () => {
    it('should generate unique universalIdentifier for each created view field', () => {
      const result = computeFlatViewFieldsFromFieldsWidgets({
        fieldsToCreate: [
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-1',
          },
          {
            objectMetadataUniversalIdentifier:
              OBJECT_METADATA_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier: 'field-uid-2',
          },
        ],
        flatPageLayoutWidgetMaps: buildFlatPageLayoutWidgetMaps([
          buildFieldsWidget(),
        ]),
        flatViewFieldMaps: buildFlatViewFieldMaps(),
        flatViewMaps: buildFlatViewMaps([
          { id: VIEW_ID, universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER },
        ]),
        flatViewFieldGroupMaps: buildFlatViewFieldGroupMaps(),
        applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      });

      const universalIdentifiers = result.map(
        (viewField) => viewField.universalIdentifier,
      );

      expect(new Set(universalIdentifiers).size).toBe(
        universalIdentifiers.length,
      );
    });
  });
});
