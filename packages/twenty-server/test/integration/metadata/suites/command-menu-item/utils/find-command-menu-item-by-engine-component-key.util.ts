import { findCommandMenuItems } from 'test/integration/metadata/suites/command-menu-item/utils/find-command-menu-items.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { type CommandMenuItemDTO } from 'src/engine/metadata-modules/command-menu-item/dtos/command-menu-item.dto';
import { type EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

export const findCommandMenuItemByEngineComponentKey = async (
  engineComponentKey: EngineComponentKey,
): Promise<
  Pick<
    CommandMenuItemDTO,
    'id' | 'engineComponentKey' | 'isPinned' | 'isPinLocked' | 'position'
  >
> => {
  const {
    data: { commandMenuItems },
  } = await findCommandMenuItems({
    expectToFail: false,
    input: undefined,
    gqlFields: `
      id
      engineComponentKey
      isPinned
      isPinLocked
      position
    `,
  });

  const commandMenuItem = commandMenuItems.find(
    (item) => item.engineComponentKey === engineComponentKey,
  );

  jestExpectToBeDefined(commandMenuItem);

  return commandMenuItem;
};
