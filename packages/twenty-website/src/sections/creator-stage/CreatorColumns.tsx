import { styled } from '@linaria/react';

import { mediaUp, semanticColor, spacing } from '@/tokens';

// PROTOTYPE the page's one column grid (the hero's 5fr / 6fr): intro on the
// left, content on the right, a hairline on top to part dark sections.
export const CreatorColumns = styled.div`
  border-top: 1px solid ${semanticColor.line};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding-top: ${spacing(10)};

  & > * + * {
    margin-top: ${spacing(10)};
  }

  ${mediaUp('md')} {
    align-items: start;
    column-gap: ${spacing(10)};
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    padding-top: ${spacing(14)};

    & > * + * {
      margin-top: 0;
    }
  }
`;
