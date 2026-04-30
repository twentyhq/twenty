import { v5 as uuidv5 } from 'uuid';

import { PAGE_LAYOUT_SEEDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/page-layout-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

const SEED_FRONT_COMPONENT_ID_NAMESPACE =
  'e7a3b1c4-f5d6-4e8a-9b2c-3d4e5f6a7b8c';

export type SeedFrontComponentDefinition = {
  id: string;
  universalIdentifier: string;
  name: string;
  description: string;
  componentName: string;
  isHeadless: boolean;
  usesSdkClient: boolean;
  seedProjectSubdir: string;
};

export type SeedFrontComponentCommandMenuItemDefinition = {
  universalIdentifier: string;
  frontComponentId: string;
  label: string;
  icon: string;
  position: number;
  isPinned?: boolean;
  pageLayoutId?: string | null;
};

export const getSeedFrontComponentIds = (workspaceId: string) => ({
  helloWorldId: uuidv5(
    `${workspaceId}:seed-front-component:hello-world`,
    SEED_FRONT_COMPONENT_ID_NAMESPACE,
  ),
  showNotificationId: uuidv5(
    `${workspaceId}:seed-front-component:show-notification`,
    SEED_FRONT_COMPONENT_ID_NAMESPACE,
  ),
});

export const getSeedFrontComponentDefinitions = (
  workspaceId: string,
): SeedFrontComponentDefinition[] => {
  const { helloWorldId, showNotificationId } =
    getSeedFrontComponentIds(workspaceId);

  return [
    {
      id: helloWorldId,
      universalIdentifier: uuidv5(
        `${workspaceId}:seed-front-component-uid:hello-world`,
        SEED_FRONT_COMPONENT_ID_NAMESPACE,
      ),
      name: 'Hello World',
      description:
        'A sample visual front component that displays execution context',
      componentName: 'HelloWorld',
      isHeadless: false,
      usesSdkClient: false,
      seedProjectSubdir: 'hello-world',
    },
    {
      id: showNotificationId,
      universalIdentifier: uuidv5(
        `${workspaceId}:seed-front-component-uid:show-notification`,
        SEED_FRONT_COMPONENT_ID_NAMESPACE,
      ),
      name: 'Show Notification',
      description:
        'A sample headless front component that displays a notification',
      componentName: 'ShowNotification',
      isHeadless: true,
      usesSdkClient: false,
      seedProjectSubdir: 'show-notification',
    },
  ];
};

export const getSeedFrontComponentCommandMenuItemDefinitions = (
  workspaceId: string,
): SeedFrontComponentCommandMenuItemDefinition[] => {
  const { helloWorldId, showNotificationId } =
    getSeedFrontComponentIds(workspaceId);

  return [
    {
      universalIdentifier: uuidv5(
        `${workspaceId}:seed-front-component-command:hello-world`,
        SEED_FRONT_COMPONENT_ID_NAMESPACE,
      ),
      frontComponentId: helloWorldId,
      label: 'Hello World',
      icon: 'IconAppWindow',
      position: 200,
    },
    {
      universalIdentifier: uuidv5(
        `${workspaceId}:seed-front-component-command:show-notification`,
        SEED_FRONT_COMPONENT_ID_NAMESPACE,
      ),
      frontComponentId: showNotificationId,
      label: 'Show Notification',
      icon: 'IconBell',
      position: 201,
    },
    {
      universalIdentifier: uuidv5(
        `${workspaceId}:seed-front-component-command:standalone-page-show-notification`,
        SEED_FRONT_COMPONENT_ID_NAMESPACE,
      ),
      frontComponentId: showNotificationId,
      label: 'Show Notification',
      icon: 'IconStar',
      position: 202,
      isPinned: true,
      pageLayoutId: generateSeedId(
        workspaceId,
        PAGE_LAYOUT_SEEDS.DOCUMENTATION_STANDALONE_PAGE,
      ),
    },
  ];
};
