import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import {
  COMMAND_MENU_ITEM_SEEDS,
  FRONT_COMPONENT_SEEDS,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/front-component-and-command-menu-item-seeds.constant';
import { generateSeedId } from 'src/engine/workspace-manager/dev-seeder/core/utils/generate-seed-id.util';

type FrontComponentSeed = {
  id: string;
  name: string;
  workspaceId: string;
  universalIdentifier: string;
  applicationId: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  componentName: string;
  builtComponentChecksum: string;
};

type CommandMenuItemSeed = {
  id: string;
  workspaceId: string;
  universalIdentifier: string;
  applicationId: string;
  workflowVersionId: null;
  frontComponentId: string;
  label: string;
  icon: string | null;
  isPinned: boolean;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId: null;
};

type FrontComponentAndCommandMenuItemSeeds = {
  frontComponents: FrontComponentSeed[];
  commandMenuItems: CommandMenuItemSeed[];
};

export const getFrontComponentAndCommandMenuItemDataSeeds = (
  workspaceId: string,
  applicationId: string,
): FrontComponentAndCommandMenuItemSeeds => {
  const frontComponentId = generateSeedId(
    workspaceId,
    FRONT_COMPONENT_SEEDS.DEMO_APP,
  );

  const frontComponents: FrontComponentSeed[] = [
    {
      id: frontComponentId,
      name: 'Demo App',
      workspaceId,
      universalIdentifier: frontComponentId,
      applicationId,
      sourceComponentPath: 'src/front-components/demo-app.tsx',
      builtComponentPath: 'src/front-components/demo-app.mjs',
      componentName: 'DemoApp',
      builtComponentChecksum: '1234567890',
    },
  ];

  const commandMenuItemId = generateSeedId(
    workspaceId,
    COMMAND_MENU_ITEM_SEEDS.DEMO_FRONT_COMPONENT,
  );

  const commandMenuItems: CommandMenuItemSeed[] = [
    {
      id: commandMenuItemId,
      workspaceId,
      universalIdentifier: commandMenuItemId,
      applicationId,
      workflowVersionId: null,
      frontComponentId,
      label: 'Open Demo App',
      icon: 'IconApps',
      isPinned: false,
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      availabilityObjectMetadataId: null,
    },
  ];

  return { frontComponents, commandMenuItems };
};
