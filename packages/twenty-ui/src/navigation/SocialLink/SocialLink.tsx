import * as React from 'react';

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
  const displayValue =
    (label && label.trim() !== '' ? label : null) ??
    getDisplayValueByUrlType({ type, href, label }) ??
    href;

  return <RoundedLink href={href} onClick={onClick} label={displayValue} />;
};