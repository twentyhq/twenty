import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { MetricRow } from '@ui/components';
import { IconFiles } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof MetricRow> = {
  title: 'UI/Data Display/MetricRow',
  component: MetricRow,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 320 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    children: 'Imported files',
    value: '75 of 100',
    progress: 75,
    startIcon: IconFiles,
  },
  argTypes: {
    startIcon: { control: false },
    className: { control: false },
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof MetricRow>;

export const Default: Story = {};

export const WithoutProgress: Story = {
  args: {
    children: 'Data transferred',
    value: '12.5 MB',
    progress: undefined,
    startIcon: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Data transferred')).toBeVisible();
    await expect(canvas.getByText('12.5 MB')).toBeVisible();
    await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument();
  },
};

export const InCard: Story = {
  render: () => (
    <Card.Root>
      <Card.Content>
        <MetricRow startIcon={IconFiles} value="75 of 100" progress={75}>
          Imported files
        </MetricRow>
        <MetricRow value="24 of 80" progress={30}>
          Reviewed files
        </MetricRow>
        <MetricRow value="12.5 MB">Data transferred</MetricRow>
      </Card.Content>
    </Card.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const imported = canvas.getByRole('progressbar', {
      name: 'Imported files',
    });
    const reviewed = canvas.getByRole('progressbar', {
      name: 'Reviewed files',
    });

    await expect(imported).toHaveAttribute('aria-valuenow', '75');
    await expect(imported).toHaveTextContent('75 of 100');
    await expect(imported).toHaveAttribute('aria-valuetext', '75 of 100');
    await expect(reviewed).toHaveAttribute('aria-valuenow', '30');
    await expect(reviewed).toHaveTextContent('24 of 80');
    await expect(canvas.getAllByRole('progressbar')).toHaveLength(2);
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

export const FormattedValue: Story = {
  args: {
    value: <Text render={<bdi />}>75 of 100</Text>,
  },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Imported files',
    });

    await expect(progress).toHaveTextContent('75 of 100');
    await expect(progress).toHaveAttribute('aria-valuetext', '75%');
  },
};

export const EmptyValueText: Story = {
  args: {
    progressValueText: '',
  },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Imported files',
    });

    await expect(progress).toHaveAttribute('aria-valuetext', '75%');
  },
};

const ControlledMetricRow = () => {
  const [completed, setCompleted] = useState(false);

  return (
    <>
      <MetricRow
        startIcon={IconFiles}
        value={completed ? '100 of 100' : '25 of 100'}
        progress={completed ? 100 : 25}
      >
        Imported files
      </MetricRow>
      <Button onClick={() => setCompleted(true)}>Complete import</Button>
    </>
  );
};

export const Controlled: Story = {
  render: () => <ControlledMetricRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Imported files',
    });

    await expect(progress).toHaveAttribute('aria-valuenow', '25');
    await expect(progress).toHaveTextContent('25 of 100');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete import' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(progress).toHaveTextContent('100 of 100');
    await expect(progress).toHaveAccessibleName('Imported files');
    await expect(progress).toHaveAttribute('aria-valuetext', '100 of 100');
  },
};

export const CatalogDark: Story = {
  globals: { colorScheme: 'dark' },
  tags: ['!autodocs'],
};

export const RightToLeft: Story = {
  args: {
    dir: 'rtl',
    progressValueText: '75 of 100 files imported',
    value: (
      <Text render={<bdi />} dir="ltr">
        75 of 100
      </Text>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Imported files');
    const progress = canvas.getByRole('progressbar', {
      name: 'Imported files',
    });

    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '75 of 100 files imported',
    );
    await expect(progress.getBoundingClientRect().right).toBeLessThan(
      label.getBoundingClientRect().left,
    );
  },
};
