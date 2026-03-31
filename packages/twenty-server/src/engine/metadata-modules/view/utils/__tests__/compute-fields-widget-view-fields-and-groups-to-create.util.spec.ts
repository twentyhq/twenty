import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

import { computeFieldsWidgetViewFieldsAndGroupsToCreate } from '../compute-fields-widget-view-fields-and-groups-to-create.util';

const makeFieldMetadata = (
  overrides: Partial<UniversalFlatFieldMetadata> & {
    name: string;
    type: FieldMetadataType;
  },
): UniversalFlatFieldMetadata => {
  const universalIdentifier = overrides.universalIdentifier ?? v4();

  return {
    universalIdentifier,
    objectMetadataUniversalIdentifier: 'object-uid',
    applicationUniversalIdentifier: 'app-uid',
    name: overrides.name,
    label: overrides.label ?? overrides.name,
    type: overrides.type,
    isCustom: overrides.isCustom ?? false,
    isActive: true,
    isSystem: false,
    isUIReadOnly: false,
    isNullable: true,
    isUnique: false,
    isLabelSyncedWithName: false,
    defaultValue: null,
    description: null,
    icon: null,
    options: null,
    settings: null,
    standardOverrides: null,
    relationTargetObjectMetadataUniversalIdentifier: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    deletedAt: null,
  } as unknown as UniversalFlatFieldMetadata;
};

const flatApplication = {
  universalIdentifier: 'app-uid',
  id: 'app-id',
} as never;

const viewUniversalIdentifier = 'view-uid';

describe('computeFieldsWidgetViewFieldsAndGroupsToCreate', () => {
  it('should create a "General" group with standard fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isCustom: false,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.flatViewFieldGroupsToCreate).toHaveLength(1);
    expect(result.flatViewFieldGroupsToCreate[0].name).toBe('General');
    expect(result.flatViewFieldGroupsToCreate[0].position).toBe(0);
    expect(result.flatViewFieldGroupsToCreate[0].isVisible).toBe(true);

    expect(result.flatViewFieldsToCreate).toHaveLength(2);
    result.flatViewFieldsToCreate.forEach((vf) => {
      expect(vf.viewFieldGroupUniversalIdentifier).toBe(
        result.flatViewFieldGroupsToCreate[0].universalIdentifier,
      );
      expect(vf.isVisible).toBe(true);
      expect(vf.size).toBe(DEFAULT_VIEW_FIELD_SIZE);
      expect(vf.viewUniversalIdentifier).toBe(viewUniversalIdentifier);
    });

    expect(result.flatViewFieldsToCreate[0].position).toBe(0);
    expect(result.flatViewFieldsToCreate[1].position).toBe(1);
  });

  it('should create an "Other" group when custom fields exist', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'customRating',
        type: FieldMetadataType.NUMBER,
        isCustom: true,
      }),
      makeFieldMetadata({
        name: 'customTag',
        type: FieldMetadataType.TEXT,
        isCustom: true,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.flatViewFieldGroupsToCreate).toHaveLength(2);
    expect(result.flatViewFieldGroupsToCreate[0].name).toBe('General');
    expect(result.flatViewFieldGroupsToCreate[0].position).toBe(0);
    expect(result.flatViewFieldGroupsToCreate[1].name).toBe('Other');
    expect(result.flatViewFieldGroupsToCreate[1].position).toBe(1);

    const generalGroupUid =
      result.flatViewFieldGroupsToCreate[0].universalIdentifier;
    const otherGroupUid =
      result.flatViewFieldGroupsToCreate[1].universalIdentifier;

    const generalFields = result.flatViewFieldsToCreate.filter(
      (vf) => vf.viewFieldGroupUniversalIdentifier === generalGroupUid,
    );
    const otherFields = result.flatViewFieldsToCreate.filter(
      (vf) => vf.viewFieldGroupUniversalIdentifier === otherGroupUid,
    );

    expect(generalFields).toHaveLength(1);
    expect(otherFields).toHaveLength(2);

    // Positions are sequential within each group
    expect(otherFields[0].position).toBe(0);
    expect(otherFields[1].position).toBe(1);
  });

  it('should not create an "Other" group when there are no custom fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.flatViewFieldGroupsToCreate).toHaveLength(1);
    expect(result.flatViewFieldGroupsToCreate[0].name).toBe('General');
  });

  it('should exclude deletedAt field', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        isCustom: false,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.flatViewFieldsToCreate).toHaveLength(1);
    expect(
      result.flatViewFieldsToCreate[0].fieldMetadataUniversalIdentifier,
    ).toBe(fields[0].universalIdentifier);
  });

  it('should exclude TS_VECTOR and POSITION fields', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'position',
        type: FieldMetadataType.POSITION,
        isCustom: false,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(result.flatViewFieldsToCreate).toHaveLength(1);
  });

  it('should always exclude id field even when it is the label identifier', () => {
    const idUid = v4();

    const fields = [
      makeFieldMetadata({
        name: 'id',
        type: FieldMetadataType.UUID,
        isCustom: false,
        universalIdentifier: idUid,
      }),
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
    ];

    // Without label identifier match: id excluded
    const resultWithout = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    expect(resultWithout.flatViewFieldsToCreate).toHaveLength(1);

    // With id as label identifier: id still excluded (label identifier fields are excluded)
    const resultWith = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: idUid,
    });

    expect(resultWith.flatViewFieldsToCreate).toHaveLength(1);
  });

  it('should set correct applicationUniversalIdentifier on all entities', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'custom',
        type: FieldMetadataType.TEXT,
        isCustom: true,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    result.flatViewFieldGroupsToCreate.forEach((group) => {
      expect(group.applicationUniversalIdentifier).toBe('app-uid');
    });
    result.flatViewFieldsToCreate.forEach((field) => {
      expect(field.applicationUniversalIdentifier).toBe('app-uid');
    });
  });

  it('should return empty fields when all fields are excluded', () => {
    const fields = [
      makeFieldMetadata({
        name: 'deletedAt',
        type: FieldMetadataType.DATE_TIME,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'searchVector',
        type: FieldMetadataType.TS_VECTOR,
        isCustom: false,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    // Still creates the "General" group, just with no fields
    expect(result.flatViewFieldGroupsToCreate).toHaveLength(1);
    expect(result.flatViewFieldsToCreate).toHaveLength(0);
  });

  it('should place label identifier field at position 0', () => {
    const labelUid = v4();

    const fields = [
      makeFieldMetadata({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'updatedAt',
        type: FieldMetadataType.DATE_TIME,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
        universalIdentifier: labelUid,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: labelUid,
    });

    // Label identifier field is excluded by isFieldMetadataEligibleForFieldsWidget
    expect(result.flatViewFieldsToCreate).toHaveLength(2);

    // The label identifier field should not be in the results
    const labelField = result.flatViewFieldsToCreate.find(
      (vf) => vf.fieldMetadataUniversalIdentifier === labelUid,
    );

    expect(labelField).toBeUndefined();
  });

  it('should make RELATION and MORPH_RELATION fields invisible by default', () => {
    const fields = [
      makeFieldMetadata({
        name: 'name',
        type: FieldMetadataType.TEXT,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'company',
        type: FieldMetadataType.RELATION,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'target',
        type: FieldMetadataType.MORPH_RELATION,
        isCustom: false,
      }),
      makeFieldMetadata({
        name: 'customRelation',
        type: FieldMetadataType.RELATION,
        isCustom: true,
      }),
    ];

    const result = computeFieldsWidgetViewFieldsAndGroupsToCreate({
      objectFlatFieldMetadatas: fields,
      viewUniversalIdentifier,
      flatApplication,
      labelIdentifierFieldMetadataUniversalIdentifier: null,
    });

    const viewFieldForName = result.flatViewFieldsToCreate.find(
      (vf) =>
        vf.fieldMetadataUniversalIdentifier === fields[0].universalIdentifier,
    );
    const viewFieldForCompany = result.flatViewFieldsToCreate.find(
      (vf) =>
        vf.fieldMetadataUniversalIdentifier === fields[1].universalIdentifier,
    );
    const viewFieldForTarget = result.flatViewFieldsToCreate.find(
      (vf) =>
        vf.fieldMetadataUniversalIdentifier === fields[2].universalIdentifier,
    );
    const viewFieldForCustomRelation = result.flatViewFieldsToCreate.find(
      (vf) =>
        vf.fieldMetadataUniversalIdentifier === fields[3].universalIdentifier,
    );

    expect(viewFieldForName!.isVisible).toBe(true);
    expect(viewFieldForCompany!.isVisible).toBe(false);
    expect(viewFieldForTarget!.isVisible).toBe(false);
    expect(viewFieldForCustomRelation!.isVisible).toBe(false);
  });
});
