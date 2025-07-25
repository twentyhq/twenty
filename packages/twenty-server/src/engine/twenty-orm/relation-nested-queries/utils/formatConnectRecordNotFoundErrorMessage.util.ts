import { t } from '@lingui/core/macro';

import { UniqueConstraintCondition } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';

export const formatConnectRecordNotFoundErrorMessage = (
  connectFieldName: string,
  recordToConnectTotal: number,
  uniqueConstraint: UniqueConstraintCondition,
) => {
  const formattedConnectCondition = uniqueConstraint
    .map(([field, value]) => `${field} = ${value}`)
    .join(' and ');

  return {
    errorMessage: `Expected 1 record to connect to ${connectFieldName}, but found ${recordToConnectTotal} for ${formattedConnectCondition}`,
    userFriendlyMessage: t`Expected 1 record to connect to ${connectFieldName}, but found ${recordToConnectTotal} for ${formattedConnectCondition}`,
  };
};
