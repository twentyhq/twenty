import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft-input.type';

export type FrontComponentDraft = FrontComponentDraftInput & {
  id: string;
  applicationId: string;
  expiresAt: number;
  threadId: string;
  userWorkspaceId: string;
  entrySource: string;
  componentName: string;
  hasSdkClientImport: boolean;
  objectNamePlural: string;
  compiledSource: string;
  checksum: string;
  dependencyRevision?: string;
  previewError?: string;
  isSuperseded?: boolean;
  isPublicationStarted?: boolean;
  publishedComponentId?: string;
};
