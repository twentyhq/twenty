import * as React from 'react';

import { getDisplayValueByUrlType } from '@ui/utilities';
import { RoundedLink } from './RoundedLink';

export enum LinkType {
  Url = 'url',
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
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
