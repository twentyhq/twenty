import { useTheme } from '@emotion/react';

import IconRelationManyToOneRaw from '@assets/icons/many-to-one.svg?react';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

type IconRelationManyToOneProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconRelationManyToOne = (props: IconRelationManyToOneProps) => {
  const theme = useTheme();
  const size = props.size ?? 24;
  const stroke = props.stroke ?? theme.icon.stroke.md;

  return (
    <IconRelationManyToOneRaw height={size} width={size} strokeWidth={stroke} />
  );
};
