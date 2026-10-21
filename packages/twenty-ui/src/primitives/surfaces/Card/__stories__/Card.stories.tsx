import { type ComponentProps, useId } from 'react';
import { Heading, Text } from '@ui/primitives/typography';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';

const meta: Meta<typeof Card.Root> = {
  title: 'UI/Surfaces/Card',
  component: Card.Root,
  decorators: [ComponentDecorator],
  render: (args) => (
    <Card.Root {...args}>
      <Card.Header>Customer import</Card.Header>
      <Card.Content>
        Review the imported customers before adding them to your workspace.
      </Card.Content>
      <Card.Footer>24 customers are ready to import.</Card.Footer>
    </Card.Root>
  ),
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Card.Root>;

export const Display: Story = {
  parameters: { container: { width: 320 } },
  render: (args) => <CardDisplayExample {...args} />,
};

const CardDisplayExample = (props: ComponentProps<typeof Card.Root>) => {
  const titleId = useId();

  return (
    <Card.Root fullWidth role="region" aria-labelledby={titleId} {...props}>
      <Card.Header>
        <Heading id={titleId} level={2}>
          Import summary
        </Heading>
      </Card.Header>
      <Card.Content>
        <Text>24 records are ready to import.</Text>
      </Card.Content>
      <Card.Footer>
        <Button>Review records</Button>
      </Card.Footer>
    </Card.Root>
  );
};

export const NativeParts: Story = {
  render: (args) => (
    <Card.Root {...args} render={<article aria-label="Customer import" />}>
      <Card.Header render={<header />}>Customer import</Card.Header>
      <Card.Content render={<section aria-label="Ready customers" />} divider>
        24 customers are ready to import.
      </Card.Content>
      <Card.Content render={<section aria-label="Customers to review" />}>
        Review 3 customers with missing email addresses.
      </Card.Content>
      <Card.Footer render={<footer />} divider={false}>
        Last checked just now.
      </Card.Footer>
    </Card.Root>
  ),
};

export const InteractiveContent: Story = {
  render: (args) => (
    <Card.Root {...args}>
      <Card.Header>Customer import</Card.Header>
      <Card.Content render={<button type="button" />} divider>
        Review 24 customers
      </Card.Content>
      <Card.Footer>Opens the customer review.</Card.Footer>
    </Card.Root>
  ),
};

export const WholeCardLink: Story = {
  render: (args) => (
    <Card.Root
      {...args}
      render={<a href="#customer-report" aria-label="Customer import report" />}
    >
      <Card.Header>Customer import</Card.Header>
      <Card.Content>Open the customer import report.</Card.Content>
      <Card.Footer>24 customers are ready.</Card.Footer>
    </Card.Root>
  ),
};

export const SeparateActions: Story = {
  render: (args) => (
    <Card.Root {...args} render={<article aria-label="Customer import" />}>
      <Card.Header>Customer import</Card.Header>
      <Card.Content
        render={
          <a
            href="#customer-report"
            aria-label="Open the customer import report"
          />
        }
      >
        Open the customer import report.
      </Card.Content>
      <Card.Footer style={{ display: 'flex', gap: 8 }}>
        <Button type="button">Import customers</Button>
        <Button type="button" variant="ghost">
          Cancel
        </Button>
      </Card.Footer>
    </Card.Root>
  ),
};
