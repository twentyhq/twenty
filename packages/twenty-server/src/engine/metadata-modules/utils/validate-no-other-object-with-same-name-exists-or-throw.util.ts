import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

type ValidateNoOtherObjectWithSameNameExistsOrThrowsParams = {
  objectMetadataNameSingular: string;
  objectMetadataNamePlural: string;
  existingObjectMetadataId?: string;
  objectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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
        userFriendlyMessage: msg`Object already exists`,
      },
    );
  }
};
