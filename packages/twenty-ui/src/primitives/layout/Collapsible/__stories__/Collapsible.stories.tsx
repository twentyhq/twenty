import { type Meta, type StoryObj } from '@storybook/react-vite';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { clsx } from 'clsx';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Collapsible } from '@ui/primitives/layout/Collapsible/Collapsible';
import { type CollapsiblePanelProps } from '@ui/primitives/layout/Collapsible/types/CollapsiblePanelProps';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './Collapsible.stories.module.scss';

type CollapsibleExampleProps = Pick<
  CollapsiblePanelProps,
  'dimension' | 'duration' | 'style'
> & {
  defaultOpen?: boolean;
  hasFixedHeight?: boolean;
};

const CollapsibleExample = ({
  defaultOpen = false,
  dimension = 'height',
  hasFixedHeight = true,
  ...panelProps
}: CollapsibleExampleProps) => (
  <Collapsible.Root
    defaultOpen={defaultOpen}
    className={clsx(
      styles.buttonWrapper,
      dimension === 'width'
        ? styles.buttonWrapperWidth
        : styles.buttonWrapperHeight,
    )}
  >
    <Collapsible.Trigger render={<Button className={styles.button} />}>
      Import details
    </Collapsible.Trigger>
    <Collapsible.Panel dimension={dimension} {...panelProps}>
      <Text render={<div />} className={styles.expandableWrapper}>
        <Text
          render={<div />}
          className={clsx(
            styles.content,
            dimension === 'height' &&
              hasFixedHeight &&
              styles.contentFixedHeight,
            dimension === 'width' && styles.contentFixedWidth,
          )}
        >
          <Text render={<p />}>
            Match each CSV column to a record field before importing.
          </Text>
          <Text render={<p />}>
            The panel animates its content size when opening and closing.
          </Text>
        </Text>
      </Text>
    </Collapsible.Panel>
  </Collapsible.Root>
);

const meta = {
  title: 'UI/Layout/Collapsible',
  component: CollapsibleExample,
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { defaultOpen: false, dimension: 'height', hasFixedHeight: true },
} satisfies Meta<typeof CollapsibleExample>;

export default meta;
type Story = StoryObj<typeof meta>;

const verifyExpansion: NonNullable<Story['play']> = async ({
  canvasElement,
  args,
}) => {
  const canvas = within(canvasElement);
  const trigger = canvas.getByRole('button', { name: 'Import details' });
  const content = 'Match each CSV column to a record field before importing.';
  if (args.defaultOpen) {
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(canvas.getByText(content)).toBeVisible();
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(canvas.queryByText(content)).not.toBeInTheDocument(),
    );
  }
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await waitFor(() => expect(canvas.getByText(content)).toBeVisible());
  const panel = document.getElementById(
    trigger.getAttribute('aria-controls') ?? '',
  );
  if (!isDefined(panel)) {
    throw new Error('The trigger must be linked to its panel');
  }
  expect(panel).toContainElement(canvas.getByText(content));
  expect(getComputedStyle(panel).transitionProperty).toBe(
    `${panel.dataset.dimension}, opacity`,
  );
  await waitFor(() => {
    expect(panel?.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(panel?.getBoundingClientRect().width).toBeGreaterThan(0);
  });
  trigger.focus();
  await userEvent.keyboard(' ');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await waitFor(() =>
    expect(canvas.queryByText(content)).not.toBeInTheDocument(),
  );
  await userEvent.keyboard('{Enter}');
  await waitFor(() => expect(canvas.getByText(content)).toBeVisible());
};

export const Default: Story = { play: verifyExpansion };
export const Documentation: Story = {};
export const FitContent: Story = {
  args: { hasFixedHeight: false, defaultOpen: true },
  play: verifyExpansion,
};
export const WidthAnimation: Story = {
  args: { dimension: 'width' },
  play: verifyExpansion,
};
export const CustomDurations: Story = {
  args: { style: { transitionDuration: '1.2s, 0.8s' } },
  play: async (context) => {
    await verifyExpansion(context);
    const trigger = within(context.canvasElement).getByRole('button', {
      name: 'Import details',
    });
    const panel = document.getElementById(
      trigger.getAttribute('aria-controls') ?? '',
    );
    if (!isDefined(panel)) {
      throw new Error('The trigger must be linked to its panel');
    }
    expect(getComputedStyle(panel).transitionDuration).toBe('1.2s, 0.8s');
  },
};

const ControlledExample = () => {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(!open)}>Toggle externally</Button>
      <Collapsible.Trigger render={<Button />}>
        Linked trigger
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <Text>Controlled content</Text>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

export const Controlled: Story = {
  render: () => <ControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle externally' }),
    );
    expect(
      canvas.getByRole('button', { name: 'Linked trigger' }),
    ).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Linked trigger' }),
    );
    await waitFor(() =>
      expect(canvas.queryByText('Controlled content')).not.toBeInTheDocument(),
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Collapsible.Root disabled>
      <Collapsible.Trigger render={<Button />}>
        Disabled details
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <Text>Unavailable content</Text>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Disabled details' });
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(trigger);
    expect(canvas.queryByText('Unavailable content')).not.toBeInTheDocument();
  },
};

const PersistentExample = () => {
  const [count, setCount] = useState(0);
  return (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger render={<Button />}>
        Persistent details
      </Collapsible.Trigger>
      <Collapsible.Panel keepMounted id="persistent-panel">
        <Button onClick={() => setCount(count + 1)}>Count {count}</Button>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

export const KeepMounted: Story = {
  render: () => <PersistentExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Persistent details' });
    const panel = canvasElement.querySelector<HTMLElement>('#persistent-panel');
    if (!isDefined(panel)) {
      throw new Error('The persistent panel must be mounted');
    }
    await userEvent.click(canvas.getByRole('button', { name: 'Count 0' }));
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(panel).not.toBeVisible();
      expect(panel.getBoundingClientRect().height).toBe(0);
      expect(
        canvas.queryByRole('button', { name: 'Count 1' }),
      ).not.toBeInTheDocument();
      expect(canvas.getByText('Count 1')).toBeInTheDocument();
    });
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Count 1' })).toBeVisible(),
    );
  },
};
