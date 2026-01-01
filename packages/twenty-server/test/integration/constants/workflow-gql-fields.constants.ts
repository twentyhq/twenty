export const WORKFLOW_GQL_FIELDS = `
    id
    name
    lastPublishedVersionId
    statuses
    position
    createdBy {
      source
      workspaceMemberId
      name
    }
    createdAt
    updatedAt
    deletedAt
`;

export const WORKFLOW_RUN_GQL_FIELDS = `
    id
    name
    status
    startedAt
    endedAt
    createdAt
    updatedAt
    workflowVersionId
    state
`;
