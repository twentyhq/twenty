import { type ObjectPermissionAction } from 'twenty-shared/application';
import { type ObjectOpenRecordIn } from 'twenty-shared/types';

import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

export type CreateStandardObjectContext<
  TObjectName extends AllStandardObjectName,
> = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
  isSystem?: boolean;
  isSearchable?: boolean;
  isAuditLogged?: boolean;
  isUIEditable?: boolean;
  isUICreatable?: boolean;
  disabledObjectPermissionActions?: ObjectPermissionAction[];
  openRecordIn?: ObjectOpenRecordIn;
  shortcut?: string | null;
  duplicateCriteria?: string[][] | null;
  labelIdentifierFieldMetadataName: AllStandardObjectFieldName<TObjectName>;
  imageIdentifierFieldMetadataName?: AllStandardObjectFieldName<TObjectName>;
};
