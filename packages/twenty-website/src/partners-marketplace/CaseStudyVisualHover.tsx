import { styled } from '@linaria/react';

export const CaseStudyVisualHover = styled.div`
  overflow: hidden;
  width: 100%;

  &[data-layout='featured'] {
    flex-shrink: 0;
    width: 100%;
  }

  &:hover [data-size='card'] img {
    transform: scale(1.045);
  }
`;
