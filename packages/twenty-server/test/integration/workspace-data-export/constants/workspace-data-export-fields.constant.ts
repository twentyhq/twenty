export const WORKSPACE_DATA_EXPORT_FIELDS = `
  id
  workspaceId
  status
  sizeInBytes
  createdAt
  objects {
    nameSingular
    labelSingular
    fieldCount
    recordCount
    isExported
  }
  downloadUrl
`;
