import { Body, Heading } from '@/design-system/components';
import { useLingui } from '@lingui/react';
import type { PlanTableCalculatorDataType } from '@/sections/PlanTable/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import type { ReactNode } from 'react';

const CALCULATOR_BORDER = '#feffb7';

const Shell = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid ${CALCULATOR_BORDER};
  border-radius: ${theme.radius(1)};
  display: grid;
  gap: ${theme.spacing(15)};
  overflow: clip;
  padding: ${theme.spacing(4)} ${theme.spacing(10)};
  width: 100%;
  transition:
    border-color 0.4s ease,
    box-shadow 0.4s ease;

  &:hover {
    border-color: ${theme.colors.highlight[100]};
    box-shadow: 0 0 20px rgba(74, 56, 245, 0.15);
  }

  @media (min-width: ${theme.breakpoints.md}px) {
    align-items: center;
    gap: ${theme.spacing(30)};
    grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
    padding: ${theme.spacing(4)} ${theme.spacing(10)};
  }
`;

const VisualColumn = styled.div`
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  min-width: 0;
`;

const VisualFrame = styled.div`
  aspect-ratio: 400 / 227;
  max-width: 400px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const BodyOnDark = styled.div`
  & p {
    color: ${theme.colors.secondary.text[80]};
  }
`;

const ControlsColumn = styled.div`
  border-radius: ${theme.radius(1)};
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
`;

const SectionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(4)} ${theme.spacing(8)};
  width: 100%;
`;

const SectionTitleRow = styled.div`
  align-items: center;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  justify-content: space-between;
  line-height: ${theme.spacing(5.5)};
  width: 100%;
`;

const FieldsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(4)};
  width: 100%;
`;

const Field = styled.div`
  display: flex;
  flex: 1 1 140px;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  min-width: 0;
`;

const FieldLabel = styled.span`
  color: ${theme.colors.secondary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  line-height: ${theme.spacing(3.5)};
`;

const FakeInput = styled.div`
  align-items: center;
  background-color: ${theme.colors.secondary.background[100]};
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  justify-content: space-between;
  line-height: ${theme.spacing(5.5)};
  min-height: ${theme.spacing(11)};
  padding: ${theme.spacing(2)} ${theme.spacing(4)};
  width: 100%;
`;

const StepperInner = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(1)};
`;

const StepperBtn = styled.span`
  background-color: ${theme.colors.secondary.border[40]};
  border-radius: ${theme.radius(0.5)};
  display: grid;
  height: ${theme.spacing(7)};
  place-items: center;
  width: ${theme.spacing(7)};
`;

const PriceFooter = styled.div`
  border-top: 1px solid ${theme.colors.secondary.border[10]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(5)} ${theme.spacing(8)} ${theme.spacing(8)};
  width: 100%;
`;

const PriceRow = styled.div`
  align-items: baseline;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  font-family: ${theme.font.family.sans};
  justify-content: space-between;
  width: 100%;
`;

const PriceAmount = styled.span`
  font-size: ${theme.font.size(8)};
  line-height: ${theme.spacing(10)};
`;

const PricePeriod = styled.span`
  color: ${theme.colors.secondary.text[60]};
  font-size: ${theme.font.size(4)};
  line-height: ${theme.spacing(5.5)};
`;

type CalculatorEmbedProps = {
  calculator: Omit<PlanTableCalculatorDataType, 'visual'> & {
    visual: Omit<PlanTableCalculatorDataType['visual'], 'heading'> & {
      heading: ReactNode;
    };
  };
};

export function CalculatorEmbed({ calculator }: CalculatorEmbedProps) {
  const { i18n } = useLingui();
  const { priceLine, sections, visual } = calculator;

  return (
    <Shell>
      <VisualColumn>
        {visual.imageSrc ? (
          <VisualFrame>
            <NextImage
              alt={visual.imageAlt ?? ''}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              src={visual.imageSrc}
              style={{ objectFit: 'contain' }}
            />
          </VisualFrame>
        ) : null}
        <Heading as="h3" size="lg" weight="light">
          {visual.heading}
        </Heading>
        <BodyOnDark>
          <Body family="sans" size="md" weight="regular">
            {i18n._(visual.body)}
          </Body>
        </BodyOnDark>
      </VisualColumn>
      <ControlsColumn>
        {sections.map((section) => (
          <SectionBlock key={section.id}>
            <SectionTitleRow>
              <span>{i18n._(section.title)}</span>
              <span aria-hidden="true">☑</span>
            </SectionTitleRow>
            <FieldsRow>
              <Field>
                <FieldLabel>{i18n._(section.requestField.label)}</FieldLabel>
                <FakeInput>
                  <StepperInner>
                    <StepperBtn aria-hidden="true">‹</StepperBtn>
                    <StepperBtn aria-hidden="true">›</StepperBtn>
                  </StepperInner>
                  <span>{section.requestField.value}</span>
                </FakeInput>
              </Field>
              <Field>
                <FieldLabel>{i18n._(section.tasksField.label)}</FieldLabel>
                <FakeInput>
                  <span>{section.tasksField.value}</span>
                  <span aria-hidden="true">▾</span>
                </FakeInput>
              </Field>
            </FieldsRow>
            {section.modelField ? (
              <Field>
                <FieldLabel>{i18n._(section.modelField.label)}</FieldLabel>
                <FakeInput>
                  <span>{section.modelField.value}</span>
                  <span aria-hidden="true">▾</span>
                </FakeInput>
              </Field>
            ) : null}
          </SectionBlock>
        ))}
        <PriceFooter>
          <PriceRow>
            <span>{i18n._(priceLine.label)}</span>
            <span>
              <PriceAmount>{priceLine.amount}</PriceAmount>
              <PricePeriod> {i18n._(priceLine.periodSuffix)}</PricePeriod>
            </span>
          </PriceRow>
        </PriceFooter>
      </ControlsColumn>
    </Shell>
  );
}
