import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { type AllStandardFieldByObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

export const createStandardObjectFlatMetadata = <
  T extends AllStandardObjectName,
>({
  options: {
    universalIdentifier,
    standardId,
    nameSingular,
    namePlural,
    labelSingular,
    labelPlural,
    description,
    icon,
    isSystem = false,
    isSearchable = false,
    isAuditLogged = true,
    isUIReadOnly = false,
    shortcut = null,
    createdAt,
    labelIdentifierFieldMetadataName,
  },
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  options: {
    universalIdentifier: string;
    standardId: string;
    nameSingular: T;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
    description: string;
    icon: string;
    isSystem?: boolean;
    isSearchable?: boolean;
    isAuditLogged?: boolean;
    isUIReadOnly?: boolean;
    shortcut?: string | null;
    createdAt: Date;
    labelIdentifierFieldMetadataName: AllStandardFieldByObjectName<T>;
  };
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): FlatObjectMetadata => ({
  universalIdentifier,
  standardId,
  applicationId: TWENTY_STANDARD_APPLICATION_ID,
  workspaceId,
  nameSingular,
  namePlural,
  labelSingular,
  labelPlural,
  description,
  icon,
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem,
  isSearchable,
  isAuditLogged,
  isUIReadOnly,
  isLabelSyncedWithName: false,
  standardOverrides: null,
  duplicateCriteria: null,
  shortcut,
  labelIdentifierFieldMetadataId:
    standardFieldMetadataIdByObjectAndFieldName[nameSingular].fields[
      labelIdentifierFieldMetadataName
    ],
  imageIdentifierFieldMetadataId: null,
  targetTableName: 'DEPRECATED',
  fieldMetadataIds: [],
  indexMetadataIds: [],
  viewIds: [],
  createdAt,
  updatedAt: createdAt,
  id: standardFieldMetadataIdByObjectAndFieldName[nameSingular].id,
});
