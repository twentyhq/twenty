import {
  Body as BaseBody,
  type BodyProps,
} from '@/design-system/components/Body/Body';
import type { Pages } from '@/enums/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const defaultHeroBodyColor = `var(--hero-body-color, ${theme.colors.primary.text[60]})`;

const BodyContainer = styled.div`
  --body-sm-color: ${defaultHeroBodyColor};
  color: ${defaultHeroBodyColor};

  &[data-color-scheme='primary'] {
    --hero-body-color: ${theme.colors.primary.text[60]};
  }

  &[data-color-scheme='secondary'] {
    --hero-body-color: ${theme.colors.secondary.text[80]};
  }

  &[data-preserve-line-breaks='true'] {
    white-space: pre-line;
  }

  margin-top: calc(${theme.spacing(2)} - ${theme.spacing(6)});
  max-width: 360px;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-page='home'] {
      max-width: 591px;
    }

    &[data-page='partners'] {
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
      white-space: pre-line;
    }

    &[data-page='caseStudies'] {
      max-width: 550px;
    }
  }
`;

export type HeroBodyColorScheme = 'primary' | 'secondary';

export type HeroBodyProps = BodyProps & {
  page: Pages;
  colorScheme?: HeroBodyColorScheme;
  preserveLineBreaks?: boolean;
};

export function Body({
  page,
  colorScheme,
  preserveLineBreaks = false,
  ...bodyProps
}: HeroBodyProps) {
  return (
    <BodyContainer
      data-color-scheme={colorScheme}
      data-page={page}
      data-preserve-line-breaks={preserveLineBreaks}
    >
      <BaseBody {...bodyProps} />
    </BodyContainer>
  );
}
