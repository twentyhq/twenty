'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { color } from '@/tokens';

export const MarketplaceBriefLink = styled(LocalizedLink)`
  color: ${color('blue')};
  text-decoration: underline;
  text-underline-offset: 2px;
`;
