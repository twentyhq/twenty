import { isBoolean, isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { AvatarFallback } from './internal/AvatarFallback';
import { AvatarImage } from './internal/AvatarImage';
import { AvatarRoot } from './internal/AvatarRoot';
import { getAvatarInitial } from './internal/getAvatarInitial';
import { type AvatarProps } from './types/AvatarProps';

const AvatarAssembly = ({
  src,
  name,
  icon,
  imageProps,
  fallbackProps,
  backgroundColor,
  ...props
}: AvatarProps) => {
  const initial = getAvatarInitial(name);
  const hasIcon = isDefined(icon) && !isBoolean(icon) && icon !== '';
  const imageLabel = imageProps?.alt ?? name ?? '';
  const hasImageLabel = !hasIcon && isNonEmptyString(imageLabel);
  const { children = hasIcon ? icon : initial || '-', ...fallbackAttributes } =
    fallbackProps ?? {};
  const hasFallbackSemantics =
    isDefined(fallbackAttributes.role) ||
    isDefined(fallbackAttributes['aria-label']) ||
    isDefined(fallbackAttributes['aria-labelledby']);
  const isFallbackDecorative =
    !hasImageLabel &&
    !hasFallbackSemantics &&
    !isDefined(fallbackAttributes.render);

  return (
    <AvatarRoot
      {...props}
      name={name}
      backgroundColor={hasIcon ? 'inherit' : backgroundColor}
    >
      {!hasIcon && (
        <AvatarImage src={src ?? undefined} {...imageProps} alt={imageLabel} />
      )}
      <AvatarFallback
        role={hasImageLabel ? 'img' : undefined}
        aria-label={hasImageLabel ? imageLabel : undefined}
        aria-hidden={isFallbackDecorative || undefined}
        {...fallbackAttributes}
      >
        {children}
      </AvatarFallback>
    </AvatarRoot>
  );
};

export const Avatar = Object.assign(AvatarAssembly, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
