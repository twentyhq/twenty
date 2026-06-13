import { styled } from '@linaria/react';

import { GRADIENT } from '@/tokens';
import { SectionShell } from '@/ui';

import { PricingBoard } from './pricing-board';
import { PricingIntro } from './pricing-intro';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The pricing headline and the plans read as one composition on the hero's
// vertical rhythm: Heading->Body 12px, Body->switcher 32px, switcher->cards
// 68px. The intro is server copy; the switcher and cards are a client
// island (PricingBoard) that owns the billing/hosting state.
const PlansStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  width: 100%;
`;

// Centered copy is scoped to the intro: the cards keep their natural
// left-aligned internals (a stack-level text-align cascades into them).
const IntroSlot = styled.div`
  text-align: center;
`;

export function PricingPlans() {
  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="muted"
    >
      <PlansStack>
        <IntroSlot>
          <PricingIntro />
        </IntroSlot>
        <PricingBoard />
      </PlansStack>
    </SectionShell>
  );
}
