import {
  ColorSample,
  type ColorSampleProps,
} from '@ui/primitives/data-display/ColorSample/ColorSample';
import { Button } from '@ui/primitives/input/Button/Button';
import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';

import styles from './ColorPickerButton.module.scss';

type ColorPickerButtonProps = Pick<ColorSampleProps, 'colorName'> &
  Pick<ButtonProps, 'onClick'> & {
    isSelected?: boolean;
  };

export const ColorPickerButton = ({
  colorName,
  isSelected,
  onClick,
}: ColorPickerButtonProps) => {
  return (
    <div className={styles.wrapper} data-selected={isSelected || undefined}>
      <Button
        size="md"
        variant="ghost"
        className={styles.button}
        startIcon={<ColorSample colorName={colorName} />}
        aria-label={`Select ${colorName} color`}
        onClick={onClick}
      />
    </div>
  );
};
