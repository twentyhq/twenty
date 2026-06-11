import { useContext } from 'react';

import { IconChartBar } from '@ui/display/icon/components/TablerIcons';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';
import { ThemeContext } from '@ui/theme-constants';

import styles from './IconChartBarHorizontal.module.scss';

type IconChartBarHorizontalProps = Pick<
  IconComponentProps,
  'size' | 'stroke' | 'color'
>;

export const IconChartBarHorizontal = (props: IconChartBarHorizontalProps) => {
  const { theme } = useContext(ThemeContext);
  const size = props.size ?? theme.icon.size.md;
  const stroke = props.stroke ?? theme.icon.stroke.sm;

  return (
    <div className={styles.rotatedIconWrapper}>
      <IconChartBar size={size} stroke={stroke} color={props.color} />
    </div>
  );
};
