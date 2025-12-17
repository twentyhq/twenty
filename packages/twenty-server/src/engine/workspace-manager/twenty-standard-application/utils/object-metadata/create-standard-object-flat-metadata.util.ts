import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardBuilderArgs } from 'src/engine/workspace-manager/twenty-standard-application/types/metadata-standard-buillder-args.type';

export type CreateStandardObjectContext<O extends AllStandardObjectName> = {
  universalIdentifier: string;
  nameSingular: O;
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
  duplicateCriteria?: string[][] | null;
  labelIdentifierFieldMetadataName: AllStandardObjectFieldName<O>;
};

export type CreateStandardObjectArgs<
  O extends AllStandardObjectName = AllStandardObjectName,
> = StandardBuilderArgs<'objectMetadata'> & {
  objectName: O;
  context: CreateStandardObjectContext<O>;
};

export const createStandardObjectFlatMetadata = <
  O extends AllStandardObjectName,
>({
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
    isUIReadOnly = false,
    shortcut = null,
    duplicateCriteria = null,
    labelIdentifierFieldMetadataName,
  },
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  twentyStandardApplicationId,
  now,
}: CreateStandardObjectArgs<O>): FlatObjectMetadata => ({
  universalIdentifier,
  standardId: universalIdentifier,
  applicationId: twentyStandardApplicationId,
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
  duplicateCriteria,
  shortcut,
  labelIdentifierFieldMetadataId:
    standardObjectMetadataRelatedEntityIds[nameSingular].fields[
      labelIdentifierFieldMetadataName
    ].id,
  imageIdentifierFieldMetadataId: null,
  targetTableName: 'DEPRECATED',
  fieldMetadataIds: [],
  indexMetadataIds: [],
  viewIds: [],
  createdAt: now,
  updatedAt: now,
  id: standardObjectMetadataRelatedEntityIds[nameSingular].id,
});
