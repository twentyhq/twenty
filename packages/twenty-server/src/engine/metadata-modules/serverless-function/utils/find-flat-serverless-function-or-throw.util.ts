import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';

export const findFlatServerlessFunctionOrThrow = ({
  flatServerlessFunctionMaps,
  id,
}: {
  flatServerlessFunctionMaps: MetadataFlatEntityMaps<'serverlessFunction'>;
  id: string;
}) => {
  const flatServerlessFunction = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: id,
    flatEntityMaps: flatServerlessFunctionMaps,
  });

  if (
    !isDefined(flatServerlessFunction) ||
    isDefined(flatServerlessFunction.deletedAt)
  ) {
    throw new ServerlessFunctionException(
      `Serverless function with id ${id} not found`,
      ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
    );
  }

  return flatServerlessFunction;
};
