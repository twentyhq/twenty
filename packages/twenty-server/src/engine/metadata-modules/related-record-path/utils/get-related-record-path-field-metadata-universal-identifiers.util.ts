/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type UniversalFlatRelatedRecordPath } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-related-record-path.type';

export const getRelatedRecordPathFieldMetadataUniversalIdentifiers = ({
  firstFieldMetadataUniversalIdentifier,
  secondFieldMetadataUniversalIdentifier,
  thirdFieldMetadataUniversalIdentifier,
}: Pick<
  UniversalFlatRelatedRecordPath,
  | 'firstFieldMetadataUniversalIdentifier'
  | 'secondFieldMetadataUniversalIdentifier'
  | 'thirdFieldMetadataUniversalIdentifier'
>): string[] =>
  [
    firstFieldMetadataUniversalIdentifier,
    secondFieldMetadataUniversalIdentifier,
    thirdFieldMetadataUniversalIdentifier,
  ].filter(isDefined);
