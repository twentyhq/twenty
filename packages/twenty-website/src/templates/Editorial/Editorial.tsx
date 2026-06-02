import {
  Body as BaseBody,
  Container,
  Eyebrow as BaseEyebrow,
  GuideCrosshair,
  Heading as BaseHeading,
} from '@/design-system/components';
import { theme, type Scheme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

export type EditorialCrosshair = {
  crossX: string;
  crossY: string;
  lineColor?: string;
};

export type EditorialBodyLayout =
  | 'centered'
  | 'indented'
  | 'two-column'
  | 'two-column-left'
  | 'two-column-right';

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

  &[data-has-crosshair] {
    position: relative;
  }

  &[data-scheme='light'] {
    background-color: var(--color-white);
    color: var(--color-text);
  }

  &[data-scheme='muted'] {
    background-color: var(--color-neutral);
    color: var(--color-text);
  }

  &[data-scheme='dark'] {
    background-color: var(--color-black);
    color: var(--color-text);
  }
`;

const StyledContainer = styled(Container)`
  padding-bottom: ${theme.spacing(28)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(28)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
  }
`;

const Inner = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(10)};
  width: 100%;
`;

const IntroRoot = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  margin-bottom: ${theme.spacing(4)};
  max-width: 760px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-bottom: ${theme.spacing(8)};
  }

  &[data-align='right'] {
    @media (min-width: ${theme.breakpoints.md}px) {
      align-items: flex-end;
      margin-left: auto;
      margin-right: 0;
      text-align: right;
      width: auto;
    }
  }
`;

const HeadingWrap = styled.div`
  max-width: 760px;
  min-width: 0;
  width: 100%;
`;

const bodyParagraphClassName = css`
  color: var(--color-text-muted);
  min-width: 0;
`;

const TwoColumnGrid = styled.div`
  column-gap: ${theme.spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-left: auto;
  margin-right: auto;
  max-width: 902px;
  row-gap: ${theme.spacing(6)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &[data-align='left'] {
      margin-left: 0;
    }

    &[data-align='right'] {
      margin-right: 0;
    }
  }
`;

const SingleColumnBody = styled.div`
  max-width: 556px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: 384px;
    margin-right: 500px;
  }
`;

function EditorialParagraph({ children }: { children: ReactNode }) {
  return (
    <div className={bodyParagraphClassName}>
      <BaseBody
        as="p"
        family="sans"
        size="md"
        variant="body-paragraph"
        weight="regular"
      >
        {children}
      </BaseBody>
    </div>
  );
}

function EditorialBody({
  layout,
  paragraphs,
}: {
  layout: EditorialBodyLayout;
  paragraphs: ReactNode[];
}) {
  const renderedParagraphs = paragraphs.map((paragraph, index) => (
    <EditorialParagraph key={index}>{paragraph}</EditorialParagraph>
  ));

  if (
    layout === 'two-column' ||
    layout === 'two-column-left' ||
    layout === 'two-column-right'
  ) {
    return (
      <TwoColumnGrid
        data-align={
          layout === 'two-column-right'
            ? 'right'
            : layout === 'two-column-left'
              ? 'left'
              : undefined
        }
      >
        {renderedParagraphs}
      </TwoColumnGrid>
    );
  }

  return <SingleColumnBody>{renderedParagraphs}</SingleColumnBody>;
}

type EditorialProps = {
  bodyLayout: EditorialBodyLayout;
  bodyParagraphs: ReactNode[];
  crosshair?: EditorialCrosshair;
  eyebrow: ReactNode;
  eyebrowColorScheme?: 'primary' | 'secondary';
  heading: ReactNode;
  introAlign?: 'left' | 'right';
  scheme: Scheme;
};

export function Editorial({
  bodyLayout,
  bodyParagraphs,
  crosshair,
  eyebrow,
  eyebrowColorScheme,
  heading,
  introAlign = 'left',
  scheme,
}: EditorialProps) {
  return (
    <StyledSection
      data-has-crosshair={crosshair ? '' : undefined}
      data-scheme={scheme}
    >
      {crosshair ? (
        <GuideCrosshair
          crossX={crosshair.crossX}
          crossY={crosshair.crossY}
          lineColor={crosshair.lineColor}
        />
      ) : null}
      <StyledContainer>
        <Inner>
          <IntroRoot data-align={introAlign === 'right' ? 'right' : undefined}>
            <BaseEyebrow colorScheme={eyebrowColorScheme}>
              {eyebrow}
            </BaseEyebrow>
            <HeadingWrap>
              <BaseHeading as="h2" size="lg" weight="light">
                {heading}
              </BaseHeading>
            </HeadingWrap>
          </IntroRoot>
          <EditorialBody layout={bodyLayout} paragraphs={bodyParagraphs} />
        </Inner>
      </StyledContainer>
    </StyledSection>
  );
}
