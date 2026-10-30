import { type FrontComponentDraft } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-draft.type';

export type FrontComponentDraftReference = Pick<
  FrontComponentDraft,
  | 'id'
  | 'rootId'
  | 'threadId'
  | 'userWorkspaceId'
  | 'expiresAt'
  | 'previewError'
> & {
  applicationUniversalIdentifier: string;
};
