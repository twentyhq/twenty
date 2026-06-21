import { useIcons } from '@ui/icon/hooks/useIcons';
import { type IconComponentProps } from '@ui/icon/types/IconComponent';

export type IconProps = IconComponentProps & {
  name: string;
};

export const Icon = ({
  name,
  className,
  style,
  size,
  stroke,
  color,
  'aria-hidden': ariaHidden,
}: IconProps) => {
  const { getIcon } = useIcons();

  const ResolvedIcon = getIcon(name);

  return (
    <ResolvedIcon
      className={className}
      style={style}
      size={size}
      stroke={stroke}
      color={color}
      aria-hidden={ariaHidden}
    />
  );
};
