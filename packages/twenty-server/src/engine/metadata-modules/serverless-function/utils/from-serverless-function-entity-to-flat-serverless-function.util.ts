import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

export const fromServerlessFunctionEntityToFlatServerlessFunction = (
  serverlessFunctionEntity: ServerlessFunctionEntity,
): FlatServerlessFunction => {
  const serverlessFunctionWithoutRelations = removePropertiesFromRecord(
    serverlessFunctionEntity,
    ['serverlessFunctionLayer', 'application'],
  );

  return {
    ...serverlessFunctionWithoutRelations,
    createdAt: serverlessFunctionEntity.createdAt.toISOString(),
    updatedAt: serverlessFunctionEntity.updatedAt.toISOString(),
    deletedAt: serverlessFunctionEntity.deletedAt?.toISOString() ?? null,
    universalIdentifier: serverlessFunctionEntity.universalIdentifier,
  };
};
