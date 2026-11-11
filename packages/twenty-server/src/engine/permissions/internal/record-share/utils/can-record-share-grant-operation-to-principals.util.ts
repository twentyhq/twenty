/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRecordShareGrantOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation.util';

// a scope bounds everything a run reaches, so shares never carry a scoped principal past its roles
export const canRecordShareGrantOperationToPrincipals = ({
  principals,
  flatObjectMetadata,
  metadataMaps,
  operationType,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'flatObjectMetadata' | 'metadataMaps' | 'operationType'
>): boolean =>
  !isDefined(principals.runtimeLimitingRole) &&
  canRecordShareGrantOperation({
    flatObjectMetadata,
    featureFlagsMap: metadataMaps.featureFlagsMap,
    operationType,
  });
