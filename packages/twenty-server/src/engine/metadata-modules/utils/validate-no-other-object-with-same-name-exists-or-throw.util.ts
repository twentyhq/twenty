import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type ValidateNoOtherObjectWithSameNameExistsOrThrowsParams = {
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
  existingObjectMetadataId?: string;
  objectMetadataMaps: ObjectMetadataMaps;
};

export const validatesNoOtherObjectWithSameNameExistsOrThrows = ({
  objectMetadataNameSingular,
  objectMetadataNamePlural,
  existingObjectMetadataId,
  objectMetadataMaps,
}: ValidateNoOtherObjectWithSameNameExistsOrThrowsParams) => {
  const objectAlreadyExists = Object.values(objectMetadataMaps.byId)
    .filter(isDefined)
    .find(
      (objectMetadata) =>
        (objectMetadata.nameSingular === objectMetadataNameSingular ||
          objectMetadata.namePlural === objectMetadataNamePlural ||
          objectMetadata.nameSingular === objectMetadataNamePlural ||
          objectMetadata.namePlural === objectMetadataNameSingular) &&
        objectMetadata.id !== existingObjectMetadataId,
    );

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
