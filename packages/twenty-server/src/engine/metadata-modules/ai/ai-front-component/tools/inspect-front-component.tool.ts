import { tool } from 'ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { frontComponentDraftIdSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft-id.schema';

export const createInspectFrontComponentTool = ({
  aiFrontComponentService,
  context,
}: {
  aiFrontComponentService: Pick<AiFrontComponentService, 'getDraftOrThrow'>;
  context: Pick<ToolProviderContext, 'workspaceId'> & {
    userWorkspaceId: string;
  };
}) =>
  tool({
    description:
      'Read a draft source, sample data, checksum, revision status and reported browser error to revise a preview. Drafts expire after 24 hours. No reported error does not prove rendering succeeded.',
    inputSchema: frontComponentDraftIdSchema,
    execute: async ({ draftId }) => {
      const draft = await aiFrontComponentService.getDraftOrThrow({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
        draftId,
      });

      return {
        success: true,
        message: 'Component draft retrieved.',
        result: {
          draftId: draft.id,
          checksum: draft.checksum,
          name: draft.name,
          source: draft.source,
          query: draft.query,
          sampleRecords: draft.sampleRecords,
          pageLayoutType: draft.pageLayoutType,
          isCurrent: !draft.isSuperseded,
          publishedComponentId: draft.publishedComponentId,
          previewError: draft.previewError,
        },
      };
    },
  });
