import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { createListFrontComponentsTool } from 'src/engine/metadata-modules/ai/ai-front-component/tools/list-front-components.tool';

const WORKSPACE_ID = 'workspace';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application';
const INSTALLED_APPLICATION_ID = 'installed-application';
const OTHER_APPLICATION_ID = 'other-application';
const APPLICATION_IDS = [
  WORKSPACE_CUSTOM_APPLICATION_ID,
  INSTALLED_APPLICATION_ID,
  OTHER_APPLICATION_ID,
];

const frontComponentService = {
  findAll: jest.fn().mockResolvedValue(
    APPLICATION_IDS.map((applicationId) => ({
      id: applicationId,
      name: applicationId,
      applicationId,
      isHeadless: false,
      widgetAvailability: [],
      sourceComponentPath: 'private/source.tsx',
    })),
  ),
};

const listComponents = async ({
  applicationId,
  sourceType = ApplicationRegistrationSourceType.LOCAL,
  workspaceCustomApplicationId = WORKSPACE_CUSTOM_APPLICATION_ID,
}: {
  applicationId?: string;
  sourceType?: ApplicationRegistrationSourceType;
  workspaceCustomApplicationId?: string | null;
}) => {
  const tool = createListFrontComponentsTool({
    frontComponentService,
    workspaceId: WORKSPACE_ID,
    callingApplication: isDefined(applicationId)
      ? {
          id: applicationId,
          universalIdentifier: applicationId,
          sourceType,
        }
      : undefined,
    workspaceCustomApplicationId: workspaceCustomApplicationId ?? undefined,
  });

  return executeToolFromToolSet(
    { list_front_components: tool },
    'list_front_components',
    {},
    ToolCategory.FRONT_COMPONENT,
  );
};

describe('createListFrontComponentsTool', () => {
  it.each([
    ApplicationRegistrationSourceType.LOCAL,
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
  ])(
    'limits an installed %s caller to its own components',
    async (sourceType) => {
      const result = await listComponents({
        applicationId: INSTALLED_APPLICATION_ID,
        sourceType,
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual([
        {
          id: INSTALLED_APPLICATION_ID,
          name: INSTALLED_APPLICATION_ID,
          applicationId: INSTALLED_APPLICATION_ID,
          isHeadless: false,
          widgetAvailability: [],
        },
      ]);
    },
  );

  it.each([
    { caller: 'user session', applicationId: undefined },
    { caller: 'Workspace app', applicationId: WORKSPACE_CUSTOM_APPLICATION_ID },
    {
      caller: 'OAuth-only app',
      applicationId: INSTALLED_APPLICATION_ID,
      sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
    },
  ])('allows $caller to list components from all apps', async (context) => {
    const result = await listComponents(context);

    expect(result.result).toEqual(
      APPLICATION_IDS.map((id) => expect.objectContaining({ id })),
    );
  });

  it('keeps a caller scoped when the Workspace app identity is unavailable', async () => {
    const result = await listComponents({
      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      workspaceCustomApplicationId: null,
    });

    expect(result.result).toEqual([
      expect.objectContaining({ id: WORKSPACE_CUSTOM_APPLICATION_ID }),
    ]);
  });
});
