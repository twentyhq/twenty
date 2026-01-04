import { type MessageDescriptor } from '@lingui/core';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';

import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { AllMetadataName } from 'twenty-shared/metadata';

export type FlatEntityValidationError<TCode extends string = string> = {
  code: TCode;
  message: string;
  userFriendlyMessage?: MessageDescriptor;
  value?: unknown;
};

export type FailedFlatEntityValidation<
  TMetadataName extends AllMetadataName,
  TAcionType extends WorkspaceMigrationActionTypeV2,
  TRequiredProperties extends
    keyof MetadataFlatEntity<TMetadataName> = TAcionType extends 'update'
    ? 'id'
    : 'id' | 'universalIdentifier',
> = {
  type: TAcionType;
  metadataName: TMetadataName;
  errors: FlatEntityValidationError[];
  flatEntityMinimalInformation: Pick<
    MetadataFlatEntity<TMetadataName>,
    TRequiredProperties
  > &
    Partial<Omit<MetadataFlatEntity<TMetadataName>, TRequiredProperties>>;
};
