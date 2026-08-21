'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { color } from '@/tokens';

import { useClientBriefModal } from './use-client-brief-modal';

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${color('blue')};
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

export function ClientBriefTextLink({ children }: { children: ReactNode }) {
  const { openClientBriefModal } = useClientBriefModal();

  return (
    <LinkButton onClick={() => openClientBriefModal()} type="button">
      {children}
    </LinkButton>
  );
}
