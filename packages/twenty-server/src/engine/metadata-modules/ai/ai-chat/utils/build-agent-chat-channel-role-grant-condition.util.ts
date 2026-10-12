// The grants that open a channel to a role, as its settings write them
export const buildAgentChatChannelRoleGrantCondition = (alias: string) =>
  `${alias}."principalType" = 'ROLE' AND ${alias}."rowCause" = 'RULE'
   AND ${alias}."sourceId" = ${alias}."recordId" AND ${alias}."deletedAt" IS NULL`;
