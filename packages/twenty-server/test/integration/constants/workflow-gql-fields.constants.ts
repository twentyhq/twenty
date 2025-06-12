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
