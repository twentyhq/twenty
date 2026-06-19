import { type IconComponent } from '@ui/icon';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { ThemeContext } from '@ui/theme-constants';
import { clsx } from 'clsx';
import { useContext } from 'react';

import styles from './JsonNodeLabel.module.scss';

export const JsonNodeLabel = ({
  label,
  Icon,
  highlighting,
}: {
  label: string;
  Icon: IconComponent;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <span
      className={clsx(
        styles.labelContainer,
        highlighting === 'blue' && styles.blue,
        highlighting === 'red' && styles.red,
      )}
    >
      <Icon
        size={theme.icon.size.md}
        color={
          highlighting === 'blue'
            ? theme.color.blue
            : highlighting === 'red'
              ? theme.font.color.danger
              : theme.font.color.tertiary
        }
      />

      <span>{label}</span>
    </span>
  );
};
