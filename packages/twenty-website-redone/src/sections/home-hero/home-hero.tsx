import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { mediaUp, spacing } from '@/tokens';
import { Body, Button, Heading, SectionShell } from '@/ui';

const CAL_FORM_URL =
  'https://cal.com/forms/f7841033-0a20-4958-8c92-4e34ec128a81';

// Pure-CSS glow behind the hero; the halftone visual that renders inside it
// arrives with the visual-runtime port.
const GradientBackdrop = styled.div`
  background: radial-gradient(
    ellipse 80% 60% at 50% 40%,
    rgba(245, 243, 240, 0.6) 0%,
    transparent 70%
  );
  inset: 0 -20%;
  position: absolute;
`;

const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(8)};
  text-align: center;
  width: 100%;
`;

const HeadingGroup = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  width: 100%;
`;

const HeadingMeasure = styled.div`
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 591px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;
`;

export function HomeHero() {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="muted"
    >
      <IntroStack>
        <HeadingGroup>
          <HeadingMeasure>
            <Heading as="h1" size="lg" weight="light">
              {i18n._(msg`Build your Enterprise CRM *at AI Speed*`)}
            </Heading>
          </HeadingMeasure>
          <BodyMeasure>
            <Body muted size="sm">
              {i18n._(
                msg`Twenty gives technical teams the building blocks for a custom CRM that meets complex business needs and quickly adapts as the business evolves.`,
              )}
            </Body>
          </BodyMeasure>
        </HeadingGroup>
        <CtaRow>
          <Button
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Get started`)}
          />
          <Button
            href={CAL_FORM_URL}
            label={i18n._(msg`Talk to us`)}
            variant="outlined"
          />
        </CtaRow>
      </IntroStack>
    </SectionShell>
  );
}
