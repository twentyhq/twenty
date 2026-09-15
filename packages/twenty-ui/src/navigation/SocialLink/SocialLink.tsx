import * as React from 'react';

import { isNonEmptyString } from '@sniptt/guards';

import { type LinkType } from '@ui/navigation/SocialLink/LinkType';
import { RoundedLink } from '@ui/navigation/RoundedLink/RoundedLink';
import { getDisplayValueByUrlType } from '@ui/utilities';

type SocialLinkProps = {
  label?: string | null;
  href: string;
  type: LinkType;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export const SocialLink = ({ label, href, onClick, type }: SocialLinkProps) => {
  const displayValue = isNonEmptyString(label)
    ? label
    : (getDisplayValueByUrlType({ type: type, href: href }) ?? href);

  return <RoundedLink href={href} onClick={onClick} label={displayValue} />;
};
