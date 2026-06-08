import { useIcons } from '@ui/display/icon/hooks/useIcons';
import { type IconComponentProps } from '@ui/display/icon/types/IconComponent';

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
    />
  );
};
