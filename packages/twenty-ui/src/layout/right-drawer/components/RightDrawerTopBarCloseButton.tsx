import { IconChevronsRight } from 'src/display';
import { LightIconButton } from 'src/input';

import { useRightDrawer } from '../hooks/useRightDrawer';

export const RightDrawerTopBarCloseButton = () => {
  const { closeRightDrawer } = useRightDrawer();

  const handleButtonClick = () => {
    closeRightDrawer();
  };

  return (
    <LightIconButton
      Icon={IconChevronsRight}
      onClick={handleButtonClick}
      size="medium"
      accent="tertiary"
    />
  );
};
