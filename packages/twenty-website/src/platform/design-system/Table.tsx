import { styled } from '@linaria/react';

import { fontFamily, fontSize, semanticColor, spacing } from '@/tokens';

export const Table = styled.table`
  border-collapse: collapse;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  width: 100%;

  & th,
  & td {
    border-bottom: 1px solid ${semanticColor.line};
    padding: ${spacing(2)} ${spacing(3)} ${spacing(2)} 0;
    text-align: left;
    vertical-align: top;
  }

  & th {
    color: ${semanticColor.inkMuted};
    font-weight: 400;
  }
`;
