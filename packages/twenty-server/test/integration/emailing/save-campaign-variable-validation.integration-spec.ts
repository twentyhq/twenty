import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { type MessageCampaignDraftService } from 'src/modules/emailing/services/message-campaign-draft.service';

const saveDraftWithVariable = (variable: string) =>
  getAppProviderByClassName<MessageCampaignDraftService>(
    'MessageCampaignDraftService',
  ).saveDraft({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    subject: 'Hello',
    body: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi ' },
            { type: 'variableTag', attrs: { variable } },
          ],
        },
      ],
    },
  });

describe('Saving a campaign draft with variables', () => {
  it('should reject a fallback written without the default filter', async () => {
    await expect(
      saveDraftWithVariable('{{jobTitle | "there"}}'),
    ).rejects.toThrow('Malformed campaign variable: {{jobTitle | "there"}}');
  });

  it('should reject an unknown variable even when it has a fallback', async () => {
    await expect(
      saveDraftWithVariable('{{notAPersonField | default: "there"}}'),
    ).rejects.toThrow('Unknown campaign variables: notAPersonField');
  });
});
