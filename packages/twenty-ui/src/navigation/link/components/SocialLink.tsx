import * as React from 'react';

import { RoundedLink } from '@ui/navigation/link/components/RoundedLink';
import { getDisplayValueByUrlType } from '@ui/utilities';

export enum LinkType {
  Url = 'url',
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
  Facebook = 'facebook',
}

type SocialLinkProps = {
  label: string;
  href: string;
  type: LinkType;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export const SocialLink = ({ label, href, onClick, type }: SocialLinkProps) => {
  const displayValue =
    getDisplayValueByUrlType({ type: type, href: href }) ?? label;

  return <RoundedLink href={href} onClick={onClick} label={displayValue} />;
};
