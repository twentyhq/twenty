import { ColorSample, type ColorSampleProps } from '@ui/display';
import {
  LightIconButton,
  type LightIconButtonProps,
} from '@ui/input/button/components/LightIconButton';

import styles from './ColorPickerButton.module.scss';

type ColorPickerButtonProps = Pick<ColorSampleProps, 'colorName'> &
  Pick<LightIconButtonProps, 'onClick'> & {
    isSelected?: boolean;
  };

export const ColorPickerButton = ({
  colorName,
  isSelected,
  onClick,
}: ColorPickerButtonProps) => {
  return (
    <div className={styles.wrapper} data-selected={isSelected || undefined}>
      <LightIconButton
        size="medium"
        Icon={() => <ColorSample colorName={colorName} />}
        onClick={onClick}
      />
    </div>
  );
};
