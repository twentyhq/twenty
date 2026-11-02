/* @license Enterprise */

import { PRIVATE_BY_DEFAULT_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/private-record/constants/private-by-default-object-universal-identifiers.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isPrivateByDefaultObject = (
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  PRIVATE_BY_DEFAULT_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier,
  );
