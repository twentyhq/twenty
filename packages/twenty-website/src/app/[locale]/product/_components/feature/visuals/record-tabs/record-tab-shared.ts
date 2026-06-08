import { styled } from '@linaria/react';

import { CARD_TEXT_SECONDARY } from '../visual-tokens';

export const RelChip = styled.span`
  align-items: center;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 11px;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RelAvatar = styled.img`
  border-radius: 999px;
  flex-shrink: 0;
  height: 14px;
  object-fit: cover;
  width: 14px;
`;
