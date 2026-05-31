import { Trans } from '@lingui/react/macro';
import {
  Body,
  Container,
  Eyebrow,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding-bottom: ${theme.spacing(10)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(20)};

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(6)};
    padding-bottom: ${theme.spacing(14)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(28)};
  }
`;

const HeaderBody = styled(Body)`
  max-width: 640px;
`;

export function MarketplaceHeader() {
  return (
    <Section>
      <StyledContainer>
        <Eyebrow>
          <HeadingPart fontFamily="sans">
            <Trans>Marketplace</Trans>
          </HeadingPart>
        </Eyebrow>
        <Heading size="lg" weight="light">
          <Trans>
            <HeadingPart fontFamily="serif">Find your</HeadingPart>
            <HeadingPart fontFamily="sans">Twenty partner</HeadingPart>
          </Trans>
        </Heading>
        <HeaderBody>
          <Trans>
            Twenty's certified partners help teams migrate, customise, and
            operate the open source CRM across regions, languages, and
            deployment models. Browse profiles and book a call.
          </Trans>
        </HeaderBody>
      </StyledContainer>
    </Section>
  );
}
