'use client';

import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

import { ArrowRight, PlusMark } from '@/icons';
import { SCHEMES, spacing, type Scheme } from '@/tokens';
import {
  Body,
  Button,
  ButtonShape,
  CategoryCardSelect,
  ChipMultiSelect,
  ConnectingFrame,
  Container,
  CornerMarkers,
  EngagementBand,
  ExternalArrow,
  ExternalLink,
  Eyebrow,
  Field,
  GuideCrosshair,
  Heading,
  HeadingPair,
  IconButton,
  MarkedDivider,
  Modal,
  NotchedCardShape,
  NumberField,
  SectionIntro,
  SectionShell,
  SectionStack,
  Select,
  Signoff,
  StepIndicator,
  StepperProgressRail,
  StepperSwipeDeck,
  TagInput,
  TextareaField,
  TextField,
  VerticalDivider,
} from '@/ui';

import { Block } from './Block';
import { Code } from './Code';
import { SchemeSwitch } from './SchemeSwitch';
import { DocSection } from './DocSection';
import { Frame } from './Frame';
import { Grid } from './Grid';
import { Label } from './Label';
import { Row } from './Row';
import { SubHead } from './SubHead';

const Stage = styled.div`
  padding: ${spacing(6)};
  position: relative;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Card = styled.article`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const CardHead = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  justify-content: space-between;
`;

function ComponentCard({
  name,
  file,
  scheme,
  wide = false,
  children,
}: {
  name: string;
  file: string;
  scheme: Scheme;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <Card style={wide ? { gridColumn: '1 / -1' } : undefined}>
      <CardHead>
        <Label>{name}</Label>
        <Code>src/ui/{file}</Code>
      </CardHead>
      <Frame>
        <SectionShell flushInline rhythm="flush" scheme={scheme}>
          <Stage>{children}</Stage>
        </SectionShell>
      </Frame>
    </Card>
  );
}

const SELECT_OPTIONS = [
  { label: 'Sales', value: 'sales' },
  { label: 'Support', value: 'support' },
  { label: 'Recruiting', value: 'recruiting' },
] as const;

const CATEGORY_OPTIONS = [
  {
    label: 'Integrator',
    value: 'integrator',
    description: 'Implements Twenty for clients.',
    examples: 'Agencies, consultants',
  },
  {
    label: 'Creator',
    value: 'creator',
    description: 'Builds apps on Twenty.',
    examples: 'Developers, studios',
  },
] as const;

type GroupProps = { scheme: Scheme };

const toggle = (list: string[], value: string) =>
  list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];

function Text({ scheme }: GroupProps) {
  return (
    <Block>
      <SubHead>Text</SubHead>
      <Grid min={320}>
        <ComponentCard file="Heading.tsx" name="Heading" scheme={scheme} wide>
          {(['xl', 'lg', 'md', 'sm', 'xs'] as const).map((size) => (
            <Heading key={size} as="h3" size={size}>
              {`Heading ${size}`}
            </Heading>
          ))}
          <Heading as="h3" family="sans" size="md">
            Heading md, sans
          </Heading>
        </ComponentCard>
        <ComponentCard file="Body.tsx" name="Body" scheme={scheme}>
          {(['md', 'sm', 'xs'] as const).map((size) => (
            <Body
              key={size}
              size={size}
            >{`Body ${size}: the CRM your team builds on.`}</Body>
          ))}
          <Body muted>Body muted</Body>
        </ComponentCard>
        <ComponentCard file="Eyebrow.tsx" name="Eyebrow" scheme={scheme}>
          <Eyebrow>Partners</Eyebrow>
        </ComponentCard>
        <ComponentCard
          file="HeadingPair.tsx"
          name="HeadingPair, SectionIntro"
          scheme={scheme}
        >
          <SectionIntro>
            <Eyebrow>Section intro</Eyebrow>
            <HeadingPair>
              <Heading as="h3" size="md">
                A heading
              </Heading>
              <Body muted>With its supporting line.</Body>
            </HeadingPair>
          </SectionIntro>
        </ComponentCard>
      </Grid>
    </Block>
  );
}

function Actions({ scheme }: GroupProps) {
  return (
    <Block>
      <SubHead>Actions</SubHead>
      <Grid min={320}>
        <ComponentCard file="Button.tsx" name="Button" scheme={scheme} wide>
          <Row>
            <Button label="Get started" />
            <Button label="Talk to us" variant="outlined" />
            <Button label="Small" size="small" />
            <Button label="Small outlined" size="small" variant="outlined" />
            <Button label="Disabled" disabled />
            <Button label="With icon" leadingIcon={<ArrowRight />} />
          </Row>
        </ComponentCard>
        <ComponentCard
          file="ButtonShape.tsx"
          name="ButtonShape"
          scheme={scheme}
        >
          <Row>
            <div
              style={{
                height: spacing(10),
                position: 'relative',
                width: spacing(40),
              }}
            >
              <ButtonShape heightPx={40} />
            </div>
            <div
              style={{
                height: spacing(10),
                position: 'relative',
                width: spacing(40),
              }}
            >
              <ButtonShape heightPx={40} outlined />
            </div>
          </Row>
        </ComponentCard>
        <ComponentCard file="IconButton.tsx" name="IconButton" scheme={scheme}>
          <Row>
            <IconButton ariaLabel="Add">
              <PlusMark />
            </IconButton>
            <IconButton ariaLabel="Add" disabled>
              <PlusMark />
            </IconButton>
          </Row>
        </ComponentCard>
        <ComponentCard
          file="ExternalLink.tsx"
          name="ExternalLink, ExternalArrow"
          scheme={scheme}
        >
          <ExternalLink href="https://twenty.com">
            twenty.com <ExternalArrow />
          </ExternalLink>
        </ComponentCard>
      </Grid>
    </Block>
  );
}

function Forms({ scheme }: GroupProps) {
  const [text, setText] = useState('');
  const [longText, setLongText] = useState('');
  const [amount, setAmount] = useState('');
  const [team, setTeam] = useState<
    (typeof SELECT_OPTIONS)[number]['value'] | ''
  >('');
  const [tags, setTags] = useState<string[]>(['Sales']);
  const [chips, setChips] = useState<string[]>(['sales']);
  const [categories, setCategories] = useState<string[]>([]);

  return (
    <Block>
      <SubHead>Forms</SubHead>
      <Grid min={320}>
        <ComponentCard file="Field.tsx" name="Field, TextField" scheme={scheme}>
          <Field hint="We reply within a day." label="Work email">
            <TextField
              ariaLabel="Work email"
              inputMode="email"
              name="email"
              placeholder="you@company.com"
              value={text}
              onValueChange={setText}
            />
          </Field>
          <TextField
            ariaLabel="Invalid"
            invalid
            name="invalid"
            placeholder="Invalid"
            value=""
            onValueChange={() => undefined}
          />
        </ComponentCard>
        <ComponentCard
          file="TextareaField.tsx"
          name="TextareaField"
          scheme={scheme}
        >
          <TextareaField
            ariaLabel="Message"
            name="message"
            placeholder="Tell us about your project"
            value={longText}
            onValueChange={setLongText}
          />
        </ComponentCard>
        <ComponentCard
          file="NumberField.tsx"
          name="NumberField"
          scheme={scheme}
        >
          <NumberField
            ariaLabel="Budget"
            name="budget"
            placeholder="10000"
            prefix="$"
            value={amount}
            onValueChange={setAmount}
          />
        </ComponentCard>
        <ComponentCard file="Select.tsx" name="Select" scheme={scheme}>
          <Select
            ariaLabel="Team"
            options={SELECT_OPTIONS}
            placeholder="Choose a team"
            scheme={scheme}
            value={team}
            onValueChange={setTeam}
          />
        </ComponentCard>
        <ComponentCard file="TagInput.tsx" name="TagInput" scheme={scheme}>
          <TagInput
            ariaLabel="Teams"
            placeholder="Add a team"
            removeLabel={(tag) => `Remove ${tag}`}
            suggestions={['Sales', 'Support', 'Recruiting']}
            values={tags}
            onValuesChange={setTags}
          />
        </ComponentCard>
        <ComponentCard
          file="ChipMultiSelect.tsx"
          name="ChipMultiSelect"
          scheme={scheme}
        >
          <ChipMultiSelect
            ariaLabel="Teams"
            options={SELECT_OPTIONS}
            values={chips}
            onToggle={(value) => setChips(toggle(chips, value))}
          />
        </ComponentCard>
        <ComponentCard
          file="CategoryCardSelect.tsx"
          name="CategoryCardSelect"
          scheme={scheme}
        >
          <CategoryCardSelect
            ariaLabel="Program"
            options={CATEGORY_OPTIONS}
            values={categories}
            onToggle={(value) => setCategories(toggle(categories, value))}
          />
        </ComponentCard>
        <ComponentCard
          file="StepIndicator.tsx"
          name="StepIndicator"
          scheme={scheme}
        >
          <StepIndicator activeStepIndex={1} stepCount={4} />
        </ComponentCard>
      </Grid>
    </Block>
  );
}

function LayoutPieces({ scheme }: GroupProps) {
  return (
    <Block>
      <SubHead>Layout and marks</SubHead>
      <Grid min={320}>
        <ComponentCard
          file="SectionShell.tsx"
          name="SectionShell"
          scheme={scheme}
          wide
        >
          <Body muted size="sm">
            Every preview on this page sits in a SectionShell with the scheme
            chosen above.
          </Body>
          <Row>
            {(Object.keys(SCHEMES) as Scheme[]).map((each) => (
              <Frame key={each} style={{ flex: 1 }}>
                <SectionShell flushInline rhythm="flush" scheme={each}>
                  <Stage>
                    <Body size="sm">{`scheme="${each}"`}</Body>
                  </Stage>
                </SectionShell>
              </Frame>
            ))}
          </Row>
        </ComponentCard>
        <ComponentCard
          file="Container.tsx"
          name="Container, SectionStack"
          scheme={scheme}
        >
          <Container>
            <SectionStack>
              <Body size="sm">Container owns the gutter.</Body>
              <Body size="sm">
                SectionStack owns the rhythm between blocks.
              </Body>
            </SectionStack>
          </Container>
        </ComponentCard>
        <ComponentCard
          file="VerticalDivider.tsx"
          name="VerticalDivider, MarkedDivider"
          scheme={scheme}
        >
          <Row>
            <Body size="sm">Left</Body>
            <VerticalDivider />
            <Body size="sm">Right</Body>
          </Row>
          <MarkedDivider />
        </ComponentCard>
        <ComponentCard
          file="CornerMarkers.tsx"
          name="CornerMarkers"
          scheme={scheme}
        >
          <div style={{ height: spacing(24), position: 'relative' }}>
            <CornerMarkers />
          </div>
        </ComponentCard>
        <ComponentCard
          file="GuideCrosshair.tsx"
          name="GuideCrosshair"
          scheme={scheme}
        >
          <div style={{ height: spacing(32), position: 'relative' }}>
            <GuideCrosshair contained crossX="50%" crossY="50%" verticalLines />
          </div>
        </ComponentCard>
        <ComponentCard
          file="ConnectingFrame.tsx"
          name="ConnectingFrame"
          scheme={scheme}
        >
          <div style={{ height: spacing(32), position: 'relative' }}>
            <ConnectingFrame />
          </div>
        </ComponentCard>
        <ComponentCard
          file="NotchedCardShape.tsx"
          name="NotchedCardShape"
          scheme={scheme}
        >
          <div style={{ height: spacing(32), position: 'relative' }}>
            <NotchedCardShape
              cardScheme={scheme === 'dark' ? 'dark' : 'light'}
            />
          </div>
        </ComponentCard>
      </Grid>
    </Block>
  );
}

function Composites({ scheme }: GroupProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deckIndex, setDeckIndex] = useState(0);

  return (
    <Block>
      <SubHead>Composites</SubHead>
      <Grid min={320}>
        <ComponentCard
          file="EngagementBand.tsx"
          name="EngagementBand"
          scheme={scheme}
          wide
        >
          <EngagementBand
            actions={<Button label="Get started" />}
            body="Start free, self-host or use the cloud."
            heading="Ready to build?"
            rhythm="flush"
          />
        </ComponentCard>
        <ComponentCard file="Signoff.tsx" name="Signoff" scheme={scheme} wide>
          <Signoff
            body="Join the teams building on Twenty."
            heading="Your CRM, your way"
            scheme={scheme}
          >
            <Button label="Get started" />
          </Signoff>
        </ComponentCard>
        <ComponentCard file="Modal.tsx" name="Modal" scheme={scheme}>
          <Button
            label="Open modal"
            variant="outlined"
            onClick={() => setModalOpen(true)}
          />
          <Modal
            ariaLabel="Example"
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <Stage>
              <Heading as="h3" family="sans" size="sm">
                Modal
              </Heading>
              <Button label="Close" onClick={() => setModalOpen(false)} />
            </Stage>
          </Modal>
        </ComponentCard>
        <ComponentCard
          file="StepperProgressRail.tsx"
          name="StepperProgressRail"
          scheme={scheme}
        >
          <StepperProgressRail
            activeStepIndex={1}
            localProgress={0.5}
            stepCount={4}
          />
        </ComponentCard>
        <ComponentCard
          file="StepperSwipeDeck.tsx"
          name="StepperSwipeDeck"
          scheme={scheme}
        >
          <StepperSwipeDeck
            activeIndex={deckIndex}
            stepCount={3}
            onActiveIndexChange={setDeckIndex}
          >
            {(stepIndex) => (
              <Body size="sm">{`Step ${stepIndex + 1} of 3, swipe or drag`}</Body>
            )}
          </StepperSwipeDeck>
        </ComponentCard>
      </Grid>
    </Block>
  );
}

export function ComponentGallery() {
  const [scheme, setScheme] = useState<Scheme>('dark');

  return (
    <DocSection
      id="components"
      eyebrow="Building blocks"
      title="Components"
      intro="The exports of src/ui, rendered by the site itself. Switch the scheme to see each one on every section background."
    >
      <SchemeSwitch scheme={scheme} onSchemeChange={setScheme} />
      <Text scheme={scheme} />
      <Actions scheme={scheme} />
      <Forms scheme={scheme} />
      <LayoutPieces scheme={scheme} />
      <Composites scheme={scheme} />
    </DocSection>
  );
}
