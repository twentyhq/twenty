export type WorkspaceDataExportObjectPayload = {
  nameSingular: string;
  labelSingular: string;
  columnCount: number;
  rowCount: number;
  isExported: boolean;
};

export type WorkspaceDataExportPayload = {
  id: string;
  workspaceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  sizeInBytes: number;
  createdAt: string;
  objects: WorkspaceDataExportObjectPayload[];
  downloadUrl: string | null;
};

export type WorkspaceDataExportGraphqlError = {
  message: string;
  extensions?: { subCode?: string };
};
