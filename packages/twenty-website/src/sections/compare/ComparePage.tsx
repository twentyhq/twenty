import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  GRADIENT,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';
import {
  Body,
  Button,
  EngagementBand,
  Eyebrow,
  Heading,
  HeadingPair,
  SectionShell,
} from '@/ui';

import { CompareCostTable } from './CompareCostTable';
import { CompareReceipt } from './CompareReceipt';
import { type CompetitorComparison } from './compare-data';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

const HeroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  text-align: center;
  width: 100%;
`;

const HeadingMeasure = styled.div`
  white-space: pre-line;

  ${mediaUp('md')} {
    max-width: 720px;
  }
`;

const IntroMeasure = styled.div`
  white-space: pre-line;

  ${mediaUp('md')} {
    max-width: 560px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  gap: ${spacing(3)};
  justify-content: center;
  margin-top: ${spacing(8)};
`;

const SectionHeading = styled.div`
  margin-bottom: ${spacing(8)};
  text-align: center;
`;

const FairPlayStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FairPlayHeading = styled.div`
  margin-top: ${spacing(4)};
  text-align: center;
`;

const FairPlayGrid = styled.div`
  display: grid;
  gap: ${spacing(4)};
  grid-template-columns: 1fr;
  margin-top: ${spacing(8)};
  width: 100%;

  ${mediaUp('md')} {
    gap: ${spacing(6)};
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const FairPlayCard = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  padding: ${spacing(5)};
`;

export function ComparePage({
  comparison,
}: {
  comparison: CompetitorComparison;
}) {
  const i18n = getServerI18n();

  return (
    <>
      <SectionShell
        background={<GradientBackdrop />}
        rhythm="hero"
        scheme="muted"
      >
        <HeroStack>
          <HeadingPair>
            <Eyebrow>{i18n._(comparison.eyebrow)}</Eyebrow>
            <HeadingMeasure>
              <Heading as="h1" size="lg" weight="light">
                {i18n._(comparison.heading)}
              </Heading>
            </HeadingMeasure>
            <IntroMeasure>
              <Body muted size="sm">
                {i18n._(comparison.intro)}
              </Body>
            </IntroMeasure>
          </HeadingPair>
          <CtaRow>
            <Button
              href="https://app.twenty.com/welcome"
              label={i18n._(msg`Start for free`)}
              variant="filled"
            />
            <Button
              href="/pricing"
              label={i18n._(msg`See Twenty pricing`)}
              variant="outlined"
            />
          </CtaRow>
        </HeroStack>
      </SectionShell>

      <SectionShell rhythm="section" scheme="dark">
        <SectionHeading>
          <Heading as="h2" size="md" weight="light">
            {i18n._(comparison.tableTitle)}
          </Heading>
        </SectionHeading>
        <CompareCostTable comparison={comparison} />
      </SectionShell>

      <SectionShell rhythm="section" scheme="muted">
        <SectionHeading>
          <Heading as="h2" size="md" weight="light">
            {i18n._(msg`The bill, side by side`)}
          </Heading>
        </SectionHeading>
        <CompareReceipt comparison={comparison} />
      </SectionShell>

      <SectionShell rhythm="section" scheme="muted">
        <FairPlayStack>
          <Eyebrow>{i18n._(msg`Fair play`)}</Eyebrow>
          <FairPlayHeading>
            <Heading as="h2" size="md" weight="light">
              {i18n._(comparison.honest.title)}
            </Heading>
          </FairPlayHeading>
          <FairPlayGrid>
            {comparison.honest.points.map((point) => (
              <FairPlayCard key={i18n._(point)}>
                <Body as="p" muted size="sm">
                  {i18n._(point)}
                </Body>
              </FairPlayCard>
            ))}
          </FairPlayGrid>
        </FairPlayStack>
      </SectionShell>

      <EngagementBand
        actions={
          <Button
            href="https://app.twenty.com/welcome"
            label={i18n._(msg`Get started`)}
            variant="filled"
          />
        }
        body={i18n._(comparison.migrationLine)}
        heading={i18n._(msg`Run the comparison on your own data`)}
      />
    </>
  );
}
