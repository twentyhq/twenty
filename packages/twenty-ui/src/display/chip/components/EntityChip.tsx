import { useTheme } from '@emotion/react';
import { isNonEmptyString } from '@sniptt/guards';

import { Avatar, AvatarType } from '@ui/display/avatar/components/Avatar';
import { IconComponent } from '@ui/display/icon/types/IconComponent';
import { Nullable } from '@ui/utilities/types/Nullable';

import { Chip, ChipVariant } from './Chip';

export type EntityChipProps = {
  linkToEntity?: string;
  entityId: string;
  name: string;
  avatarUrl?: string;
  avatarType?: Nullable<AvatarType>;
  variant?: EntityChipVariant;
  LeftIcon?: IconComponent;
  className?: string;
  maxWidth?: number;
};

type InnerEntityChipProps = EntityChipProps;

export enum EntityChipVariant {
  Regular = 'regular',
  Transparent = 'transparent',
}

const InnerEntityChip = ({
  linkToEntity,
  entityId,
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant = EntityChipVariant.Regular,
  LeftIcon,
  className,
  maxWidth,
}: InnerEntityChipProps) => {
  const theme = useTheme();

  return (
    <Chip
      label={name}
      variant={
        linkToEntity
          ? variant === EntityChipVariant.Regular
            ? ChipVariant.Highlighted
            : ChipVariant.Regular
          : ChipVariant.Transparent
      }
      leftComponent={
        LeftIcon ? (
          <LeftIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        ) : (
          <Avatar
            avatarUrl={avatarUrl}
            entityId={entityId}
            placeholder={name}
            size="sm"
            type={avatarType}
          />
        )
      }
      clickable={!!linkToEntity}
      className={className}
      maxWidth={maxWidth}
    />
  );
};

export const EntityChip = ({
  linkToEntity,
  entityId,
  name,
  avatarUrl,
  avatarType = 'rounded',
  variant = EntityChipVariant.Regular,
  LeftIcon,
  className,
  maxWidth,
}: EntityChipProps) => {
  if (isNonEmptyString(linkToEntity)) {
    return (
      <a href={linkToEntity}>
        <InnerEntityChip
          entityId={entityId}
          name={name}
          avatarUrl={avatarUrl}
          avatarType={avatarType}
          variant={variant}
          LeftIcon={LeftIcon}
          className={className}
          maxWidth={maxWidth}
        />
      </a>
    );
  } else {
    return (
      <InnerEntityChip
        entityId={entityId}
        name={name}
        avatarUrl={avatarUrl}
        avatarType={avatarType}
        variant={variant}
        LeftIcon={LeftIcon}
        className={className}
        maxWidth={maxWidth}
      />
    );
  }
};