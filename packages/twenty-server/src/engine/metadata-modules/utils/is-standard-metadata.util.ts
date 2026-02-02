import { isDefined } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export const isStandardMetadata = (
  metadata:
    | Pick<FlatObjectMetadata, 'standardId' | 'isCustom'>
    | Pick<FlatFieldMetadata, 'standardId' | 'isCustom'>,
) => !metadata.isCustom && isDefined(metadata.standardId);

export const belongsToTwentyStandardApp = <
  T extends UniversalSyncableFlatEntity,
>({
  applicationUniversalIdentifier,
}: T) =>
  applicationUniversalIdentifier ===
  TWENTY_STANDARD_APPLICATION.universalIdentifier;
