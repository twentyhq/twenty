import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

import {
  Body as BaseBody,
  Container,
  GuideCrosshair,
  Heading as BaseHeading,
} from '@/design-system/components';
import { theme, type Scheme } from '@/theme';

// The tall, centered sign-off has only ever anchored its decorative guide
// crosshair at this one position, so it stays an internal constant rather
// than a per-call-site prop.
const CENTERED_GUIDE_CROSSHAIR = {
  crossX: 'calc(50% + 334px)',
  crossY: '198px',
};

const StyledSection = styled.section`
  min-width: 0;
  width: 100%;

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

  &[data-center='true'] {
    position: relative;
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    &[data-center='true'] {
      min-height: 759px;
      overflow: hidden;
    }

    &[data-center='true'] > div {
      justify-content: center;
      min-height: 759px;
      padding-bottom: 0;
      padding-top: 0;
    }
  }
`;

const StyledContainer = styled(Container)`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding-bottom: ${theme.spacing(20)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(20)};
  text-align: center;
  position: relative;
  z-index: 10;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(28)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(28)};
  }
`;

const HeadingWrap = styled.div`
  margin-bottom: ${theme.spacing(2)};
  margin-left: auto;
  margin-right: auto;
  max-width: ${theme.layout.editorial};
  min-width: 0;
  width: 100%;
`;

const Subline = styled.div`
  color: var(
    --color-text-muted,
    color-mix(in srgb, currentColor 80%, transparent)
  );
  margin-bottom: ${theme.spacing(6)};
  max-width: 452px;
  min-width: 0;
  width: 100%;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: ${theme.spacing(2)};
  justify-content: center;
  row-gap: ${theme.spacing(1)};
`;

type SignoffProps = {
  children: ReactNode;
  heading: ReactNode;
  body: ReactNode;
  scheme: Scheme;
  centered?: boolean;
};

export function Signoff({
  children,
  heading,
  body,
  scheme,
  centered = false,
}: SignoffProps) {
  return (
    <StyledSection
      data-center={centered ? 'true' : undefined}
      data-scheme={scheme}
    >
      {centered ? (
        <GuideCrosshair
          crossX={CENTERED_GUIDE_CROSSHAIR.crossX}
          crossY={CENTERED_GUIDE_CROSSHAIR.crossY}
        />
      ) : null}
      <StyledContainer>
        <HeadingWrap>
          <BaseHeading as="h2" size="xl" weight="light">
            {heading}
          </BaseHeading>
        </HeadingWrap>
        <Subline>
          <BaseBody as="p" size="sm" weight="regular">
            {body}
          </BaseBody>
        </Subline>
        <Actions>{children}</Actions>
      </StyledContainer>
    </StyledSection>
  );
}
