import { msg } from '@lingui/core/macro';

import { type UniqueConstraintCondition } from 'src/engine/twenty-orm/entity-manager/types/relation-connect-query-config.type';

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
    userFriendlyMessage: msg`Can't connect to ${connectFieldName}. No unique record found with condition: ${formattedConnectCondition}`,
  };
};
