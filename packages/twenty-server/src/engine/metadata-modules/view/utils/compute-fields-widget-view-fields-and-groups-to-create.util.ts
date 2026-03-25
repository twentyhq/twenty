import { FieldMetadataType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewFieldGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field-group.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

export const computeFieldsWidgetViewFieldsAndGroupsToCreate = ({
  objectFlatFieldMetadatas,
  viewUniversalIdentifier,
  flatApplication,
  labelIdentifierFieldMetadataUniversalIdentifier,
}: {
  objectFlatFieldMetadatas: UniversalFlatFieldMetadata[];
  viewUniversalIdentifier: string;
  flatApplication: FlatApplication;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
}): {
  flatViewFieldGroupsToCreate: UniversalFlatViewFieldGroup[];
  flatViewFieldsToCreate: UniversalFlatViewField[];
} => {
  const createdAt = new Date().toISOString();
  const applicationUniversalIdentifier = flatApplication.universalIdentifier;

  const eligibleFields = objectFlatFieldMetadatas.filter(
    (field) =>
      field.name !== 'deletedAt' &&
      field.type !== FieldMetadataType.TS_VECTOR &&
      field.type !== FieldMetadataType.POSITION &&
      (field.name !== 'id' ||
        field.universalIdentifier ===
          labelIdentifierFieldMetadataUniversalIdentifier),
  );

  const standardFields = eligibleFields.filter((field) => !field.isCustom);
  const customFields = eligibleFields.filter((field) => field.isCustom);

  const sortedStandardFields = [...standardFields].sort((a, b) => {
    const aIsLabel =
      a.universalIdentifier === labelIdentifierFieldMetadataUniversalIdentifier;
    const bIsLabel =
      b.universalIdentifier === labelIdentifierFieldMetadataUniversalIdentifier;

    if (aIsLabel && !bIsLabel) return -1;
    if (!aIsLabel && bIsLabel) return 1;

    return 0;
  });

  const flatViewFieldGroupsToCreate: UniversalFlatViewFieldGroup[] = [];
  const flatViewFieldsToCreate: UniversalFlatViewField[] = [];

  const generalGroupUniversalIdentifier = v4();

  flatViewFieldGroupsToCreate.push({
    universalIdentifier: generalGroupUniversalIdentifier,
    applicationUniversalIdentifier,
    viewUniversalIdentifier,
    name: 'General',
    position: 0,
    isVisible: true,
    overrides: null,
    viewFieldUniversalIdentifiers: [],
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  });

  sortedStandardFields.forEach((field, index) => {
    const isVisible =
      field.type !== FieldMetadataType.RELATION &&
      field.type !== FieldMetadataType.MORPH_RELATION;

    flatViewFieldsToCreate.push({
      fieldMetadataUniversalIdentifier: field.universalIdentifier,
      viewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: generalGroupUniversalIdentifier,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier: v4(),
      isVisible,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position: index,
      aggregateOperation: null,
      universalOverrides: null,
      applicationUniversalIdentifier,
    });
  });

  if (customFields.length > 0) {
    const otherGroupUniversalIdentifier = v4();

    flatViewFieldGroupsToCreate.push({
      universalIdentifier: otherGroupUniversalIdentifier,
      applicationUniversalIdentifier,
      viewUniversalIdentifier,
      name: 'Other',
      position: 1,
      isVisible: true,
      overrides: null,
      viewFieldUniversalIdentifiers: [],
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    });

    customFields.forEach((field, index) => {
      const isVisible =
        field.type !== FieldMetadataType.RELATION &&
        field.type !== FieldMetadataType.MORPH_RELATION;

      flatViewFieldsToCreate.push({
        fieldMetadataUniversalIdentifier: field.universalIdentifier,
        viewUniversalIdentifier,
        viewFieldGroupUniversalIdentifier: otherGroupUniversalIdentifier,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
        universalIdentifier: v4(),
        isVisible,
        size: DEFAULT_VIEW_FIELD_SIZE,
        position: index,
        aggregateOperation: null,
        universalOverrides: null,
        applicationUniversalIdentifier,
      });
    });
  }

  return {
    flatViewFieldGroupsToCreate,
    flatViewFieldsToCreate,
  };
};
