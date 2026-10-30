import { type FrontComponentDraftInput } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft-input.type';
import { type FrontComponentDiagnostic } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-diagnostic.type';

export type FrontComponentDraft = FrontComponentDraftInput & {
  id: string;
  applicationId: string;
  rootId: string;
  expiresAt: number;
  threadId: string;
  userWorkspaceId: string;
  entrySource: string;
  componentName: string;
  usesSdkClient: boolean;
  objectNamePlural: string;
  compiledSource: string;
  checksum: string;
  dependencyRevision?: string;
  diagnostic?: FrontComponentDiagnostic;
};
