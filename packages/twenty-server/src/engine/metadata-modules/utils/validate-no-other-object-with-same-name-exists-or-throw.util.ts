import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type ValidateNoOtherObjectWithSameNameExistsOrThrowsParams = {
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
  existingObjectMetadataId?: string;
  objectMetadataMaps: ObjectMetadataMaps | FlatObjectMetadataMaps;
};

export const doesOtherObjectWithSameNameExists = ({
  objectMetadataMaps,
  objectMetadataNamePlural,
  objectMetadataNameSingular,
  existingObjectMetadataId,
}: ValidateNoOtherObjectWithSameNameExistsOrThrowsParams) =>
  Object.values(objectMetadataMaps.byId)
    .filter(isDefined)
    .some(
      (objectMetadata) =>
        (objectMetadata.nameSingular === objectMetadataNameSingular ||
          objectMetadata.namePlural === objectMetadataNamePlural ||
          objectMetadata.nameSingular === objectMetadataNamePlural ||
          objectMetadata.namePlural === objectMetadataNameSingular) &&
        objectMetadata.id !== existingObjectMetadataId,
    );

export const validatesNoOtherObjectWithSameNameExistsOrThrows = (
  args: ValidateNoOtherObjectWithSameNameExistsOrThrowsParams,
) => {
  const objectAlreadyExists = doesOtherObjectWithSameNameExists(args);

  if (objectAlreadyExists) {
    throw new ObjectMetadataException(
      'Object already exists',
      ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
      {
        userFriendlyMessage: t`Object already exists`,
      },
    );
  }
};
