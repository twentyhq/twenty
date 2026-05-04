import { isDefined } from 'twenty-shared/utils';

import { type ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatConnectionProvider } from 'src/engine/metadata-modules/flat-connection-provider/types/flat-connection-provider.type';
import { type FromEntityToFlatEntityArgs } from 'src/engine/workspace-cache/types/from-entity-to-flat-entity-args.type';

export const fromConnectionProviderEntityToFlatConnectionProvider = ({
  entity: connectionProviderEntity,
  applicationIdToUniversalIdentifierMap,
}: FromEntityToFlatEntityArgs<'connectionProvider'>): FlatConnectionProvider => {
  const applicationUniversalIdentifier =
    applicationIdToUniversalIdentifierMap.get(
      connectionProviderEntity.applicationId,
    );

  if (!isDefined(applicationUniversalIdentifier)) {
    throw new FlatEntityMapsException(
      `Application with id ${connectionProviderEntity.applicationId} not found for connection provider ${connectionProviderEntity.id}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return {
    id: connectionProviderEntity.id,
    universalIdentifier: connectionProviderEntity.universalIdentifier,
    applicationId: connectionProviderEntity.applicationId,
    workspaceId: connectionProviderEntity.workspaceId,
    name: connectionProviderEntity.name,
    displayName: connectionProviderEntity.displayName,
    authorizationEndpoint: connectionProviderEntity.authorizationEndpoint,
    tokenEndpoint: connectionProviderEntity.tokenEndpoint,
    revokeEndpoint: connectionProviderEntity.revokeEndpoint,
    scopes: connectionProviderEntity.scopes,
    clientIdVariable: connectionProviderEntity.clientIdVariable,
    clientSecretVariable: connectionProviderEntity.clientSecretVariable,
    authorizationParams: connectionProviderEntity.authorizationParams,
    tokenRequestContentType: connectionProviderEntity.tokenRequestContentType,
    usePkce: connectionProviderEntity.usePkce,
    createdAt: connectionProviderEntity.createdAt.toISOString(),
    updatedAt: connectionProviderEntity.updatedAt.toISOString(),
    deletedAt: connectionProviderEntity.deletedAt?.toISOString() ?? null,
    applicationUniversalIdentifier,
  };
};
