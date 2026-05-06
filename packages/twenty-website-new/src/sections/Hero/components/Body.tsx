import {
  Body as BaseBody,
  type BodyType,
  type BodyProps,
} from '@/design-system/components/Body';
import type { Page } from '@/lib/pages';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const defaultHeroBodyColor = `var(--hero-body-color, ${theme.colors.primary.text[60]})`;

const StyledBody = styled.div`
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

export type HeroBodyProps<TText = ReactNode> = Omit<
  BodyProps<TText>,
  'renderText'
> & {
  page: Page;
  colorScheme?: HeroBodyColorScheme;
  preserveLineBreaks?: boolean;
  renderText?: (text: TText) => ReactNode;
};

export function Body<TText = ReactNode>({
  as,
  body,
  className,
  page,
  colorScheme,
  family,
  preserveLineBreaks = false,
  renderText,
  size,
  variant,
  weight,
}: HeroBodyProps<TText>) {
  return (
    <StyledBody
      data-color-scheme={colorScheme}
      data-page={page}
      data-preserve-line-breaks={preserveLineBreaks}
    >
      {renderText === undefined ? (
        <BaseBody
          as={as}
          body={body as BodyType<ReactNode>}
          className={className}
          family={family}
          size={size}
          variant={variant}
          weight={weight}
        />
      ) : (
        <BaseBody<TText>
          as={as}
          body={body}
          className={className}
          family={family}
          renderText={renderText}
          size={size}
          variant={variant}
          weight={weight}
        />
      )}
    </StyledBody>
  );
}
