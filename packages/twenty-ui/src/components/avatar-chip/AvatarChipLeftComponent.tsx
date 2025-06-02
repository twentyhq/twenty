import { Avatar } from '@ui/display/avatar/components/Avatar';
import { AvatarType } from '@ui/display/avatar/types/AvatarType';
import { Nullable } from '@ui/utilities';

export type AvatarChipsLeftComponentProps = {
  name: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  isIconInverted?: boolean;
  placeholderColorSeed?: string;
};

export const AvatarChipsLeftComponent = ({
  placeholderColorSeed,
  avatarType,
  avatarUrl,
  name,
}: AvatarChipsLeftComponentProps) => {
  return (
    <Avatar
      avatarUrl={avatarUrl}
      placeholderColorSeed={placeholderColorSeed}
      placeholder={name}
      size="sm"
      type={avatarType}
    />
  );
};
