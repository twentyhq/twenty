import {
  Body as BaseBody,
  type BodyProps,
} from '@/design-system/components/Body/Body';
import type { Pages } from '@/enums/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const BodyContainer = styled.div`
  color: ${theme.colors.primary.text[60]};
  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  max-width: 360px;
  width: 100%;

  &[data-page='whyTwenty'] {
    color: ${theme.colors.secondary.text[60]};
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='home'] {
      max-width: 591px;
    }

    &[data-page='partner'] {
      max-width: 500px;
    }

    &[data-page='pricing'] {
      max-width: 500px;
    }

    &[data-page='product'] {
      max-width: 591px;
    }

    &[data-page='whyTwenty'] {
      max-width: 443px;
    }

    &[data-page='releaseNotes'] {
      max-width: 591px;
    }

    &[data-page='caseStudies'] {
      max-width: 550px;
    }
  }
`;

export type HeroBodyProps = BodyProps & { page: Pages };

export function Body({ page, ...bodyProps }: HeroBodyProps) {
  return (
    <BodyContainer data-page={page}>
      <BaseBody {...bodyProps} />
    </BodyContainer>
  );
}
