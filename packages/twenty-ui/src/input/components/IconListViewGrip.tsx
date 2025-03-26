import { IconComponentProps } from '@ui/display/icon/types/IconComponent';
import IconListViewGripRaw from '@ui/input/components/list-view-grip.svg?react';

type IconListViewGripProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconListViewGrip = (props: IconListViewGripProps) => {
  const width = props.size ?? 8;
  const height = props.size ?? 32;

  return <IconListViewGripRaw height={height} width={width} />;
};
