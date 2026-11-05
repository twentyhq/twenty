import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ObjectOpenRecordIn } from 'twenty-shared/types';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type CreateStandardObjectArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/create-standard-object-args.type';

const getStandardFieldUniversalIdentifier = <
  TObjectName extends AllStandardObjectName,
>({
  objectName,
  fieldName,
}: {
  objectName: TObjectName;
  fieldName: AllStandardObjectFieldName<TObjectName>;
}): string => {
  const standardObjectFields: Record<
    PropertyKey,
    { universalIdentifier: string }
  > = STANDARD_OBJECTS[objectName].fields;

  return standardObjectFields[fieldName].universalIdentifier;
};

export const createStandardObjectFlatMetadata = <
  TObjectName extends AllStandardObjectName,
>({
  objectName,
  context: {
    universalIdentifier,
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    description,
    icon,
    isSystem = false,
    isSearchable = false,
    isAuditLogged = true,
    isUIEditable = true,
    isUICreatable = true,
    disabledObjectPermissionActions,
    openRecordIn = ObjectOpenRecordIn.USER_CHOICE,
    shortcut = null,
    duplicateCriteria = null,
    labelIdentifierFieldMetadataName,
    imageIdentifierFieldMetadataName,
  },
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardObjectArgs<TObjectName>): FlatObjectMetadata => {
  const labelIdentifierFieldMetadataUniversalIdentifier =
    getStandardFieldUniversalIdentifier({
      objectName,
      fieldName: labelIdentifierFieldMetadataName,
    });

  const imageIdentifierFieldMetadataUniversalIdentifier =
    imageIdentifierFieldMetadataName
      ? getStandardFieldUniversalIdentifier({
          objectName,
          fieldName: imageIdentifierFieldMetadataName,
        })
      : null;

  return {
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    workspaceId,
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    color: null,
    description,
    icon,
    isRemote: false,
    isActive: true,
    isSystem,
    isSearchable,
    isAuditLogged,
    isUIEditable,
    isUICreatable,
    disabledObjectPermissionActions: disabledObjectPermissionActions ?? null,
    openRecordIn,
    isLabelSyncedWithName: false,
    overrides: null,
    duplicateCriteria,
    shortcut,
    labelIdentifierFieldMetadataId:
      standardObjectMetadataRelatedEntityIds[objectName].fields[
        labelIdentifierFieldMetadataName
      ].id,
    imageIdentifierFieldMetadataId: imageIdentifierFieldMetadataName
      ? standardObjectMetadataRelatedEntityIds[objectName].fields[
          imageIdentifierFieldMetadataName
        ].id
      : null,
    targetTableName: 'DEPRECATED',
    fieldIds: [],
    indexMetadataIds: [],
    searchFieldMetadataIds: [],
    navigationMenuItemIds: [],
    commandMenuItemIds: [],
    objectPermissionIds: [],
    fieldPermissionIds: [],
    viewIds: [],
    pageLayoutIds: [],
    createdAt: now,
    updatedAt: now,
    id: standardObjectMetadataRelatedEntityIds[objectName].id,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    fieldUniversalIdentifiers: [],
    objectPermissionUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    viewUniversalIdentifiers: [],
    indexMetadataUniversalIdentifiers: [],
    searchFieldMetadataUniversalIdentifiers: [],
    pageLayoutUniversalIdentifiers: [],
    navigationMenuItemUniversalIdentifiers: [],
    commandMenuItemUniversalIdentifiers: [],
    labelIdentifierFieldMetadataUniversalIdentifier,
    imageIdentifierFieldMetadataUniversalIdentifier,
  };
};
