import IconListViewGripRaw from '@ui/input/components/list-view-grip.svg?react';
import { IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconListViewGripProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconListViewGrip = (props: IconListViewGripProps) => {
  const width = props.size ?? 8;
  const height = props.size ?? 32;

  return <IconListViewGripRaw height={height} width={width} />;
};
