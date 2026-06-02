'use client';

import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import type { LinkButtonType } from '@/design-system/components/Button/types/link-button-type';
import { styled } from '@linaria/react';
import Link from 'next/link';
import { type ComponentProps } from 'react';

import { useLocale } from './client';
import { localizeHref } from './locales';

type LocalizedLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
};

export const LocalizedLink = ({ href, ...rest }: LocalizedLinkProps) => {
  const locale = useLocale();
  // oxlint-disable-next-line eslint-plugin-react(jsx-props-no-spreading)
  return <Link href={localizeHref(locale, href)} {...rest} />;
};

const StyledButtonLink = styled(LocalizedLink)`
  ${buttonBaseStyles}
`;

type LocalizedLinkButtonProps = Omit<BaseButtonProps, 'label'> & LinkButtonType;

export function LocalizedLinkButton({
  color,
  href,
  label,
  leadingIcon,
  size = 'regular',
  variant,
}: LocalizedLinkButtonProps) {
  return (
    <StyledButtonLink
      data-color={color}
      data-size={size}
      data-variant={variant}
      href={href}
    >
      <BaseButton
        color={color}
        label={label}
        leadingIcon={leadingIcon}
        size={size}
        variant={variant}
      />
    </StyledButtonLink>
  );
}
