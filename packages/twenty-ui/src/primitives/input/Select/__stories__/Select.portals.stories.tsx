import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Select } from '../Select';
import { SelectExample, type SelectExampleProps } from './SelectExample';
import { waitForSelectPopup } from './waitForSelectPopup';

const meta: Meta<typeof SelectExample> = {
  title: 'UI/Input/Select/Portals',
  component: SelectExample,
  parameters: { container: { width: 280, height: 240 } },
};

export default meta;
type Story = StoryObj<typeof SelectExample>;

export const BodyPortalAndOutsideDismissal: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <SelectExample defaultValue="apple" modal={false} />
      <button type="button" style={{ marginTop: 160 }}>
        Outside
      </button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(canvasElement).not.toContainElement(popup);
    await expect(canvasElement.ownerDocument.body).toContainElement(popup);
    await expect(trigger).toHaveAttribute('aria-controls', popup.id);
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

const ExplicitContainerExample = (props: SelectExampleProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <SelectExample {...props} container={container} />
      <div ref={setContainer} role="region" aria-label="Select portal" />
    </>
  );
};

export const ExplicitContainer: Story = {
  decorators: [ComponentDecorator],
  args: { defaultOpen: true, defaultValue: 'apple', modal: false },
  render: (args) => <ExplicitContainerExample {...args} />,
  play: async ({ canvasElement }) => {
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(canvasElement).getByRole('region', { name: 'Select portal' }),
    ).toContainElement(popup);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
  },
};

export const ScopedTheme: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <section aria-label="Scoped dark theme">
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <div style={{ background: 'var(--t-background-primary)', height: 220 }}>
          <SelectExample defaultValue="apple" defaultOpen modal={false} />
        </div>
      </ThemeProvider>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(canvasElement).getByRole('region', { name: 'Scoped dark theme' }),
    ).toContainElement(popup);
    await expect(popup.closest('.dark')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
  },
};

const DeferredContainerExample = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(true);

  return (
    <ThemeProvider colorScheme="dark" applyToRoot={false}>
      <div style={{ background: 'var(--t-background-primary)', height: 220 }}>
        <SelectExample
          container={container}
          defaultValue="apple"
          open={open}
          onOpenChange={(nextOpen, details) => {
            if (details.reason === 'escape-key') {
              setOpen(nextOpen);
            }
          }}
          modal={false}
        />
        <button type="button" onClick={() => setMounted(true)}>
          Mount portal
        </button>
        {mounted && (
          <div ref={setContainer} role="region" aria-label="Deferred portal" />
        )}
      </div>
    </ThemeProvider>
  );
};

export const NullContainerWaits: Story = {
  decorators: [ComponentDecorator],
  render: () => <DeferredContainerExample />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement.ownerDocument.body).queryByRole('listbox'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Mount portal' }),
    );
    const popup = await waitForSelectPopup(canvasElement);
    await expect(
      within(canvasElement).getByRole('region', { name: 'Deferred portal' }),
    ).toContainElement(popup);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeVisible());
  },
};

export const RightToLeft: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <SelectExample defaultValue="apple" />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('combobox'));
    const popup = await waitForSelectPopup(canvasElement);
    const trigger = within(canvasElement).getByRole('combobox');
    await expect(popup).toHaveAttribute('data-align', 'start');
    await waitFor(() =>
      expect(
        Math.abs(
          popup.getBoundingClientRect().right -
            trigger.getBoundingClientRect().right,
        ),
      ).toBeLessThan(2),
    );
    await userEvent.keyboard('{End}{Enter}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(trigger).toHaveTextContent('Dragon fruit');
  },
};

export const Scrollable: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <Select.Root
      defaultValue={1}
      itemToStringLabel={(value) => `Option ${value}`}
    >
      <Select.Trigger aria-label="Long list">
        <Select.Value />
      </Select.Trigger>
      <Select.Popup style={{ maxHeight: 160 }}>
        {Array.from({ length: 30 }, (_, index) => (
          <Select.Item key={index} value={index + 1}>
            Option {index + 1}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popup.scrollHeight).toBeGreaterThan(popup.clientHeight);
    await userEvent.keyboard('{End}');
    const last = within(popup).getByRole('option', { name: 'Option 30' });
    await expect(last).toHaveFocus();
    await waitFor(() =>
      expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        popup.getBoundingClientRect().bottom,
      ),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeVisible());
    await expect(within(canvasElement).getByRole('combobox')).toHaveTextContent(
      'Option 30',
    );
  },
};

export const AlignedWithSelectedItem: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <div style={{ width: 240, paddingTop: 120 }}>
      <SelectExample defaultValue="cherry" alignItemWithTrigger />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('combobox');
    await userEvent.click(trigger);
    const popup = await waitForSelectPopup(canvasElement);
    await expect(popup).toHaveAttribute('data-side', 'none');
    const selected = within(popup).getByRole('option', { name: 'Cherry' });
    await waitFor(() => {
      const triggerBounds = trigger.getBoundingClientRect();
      const selectedBounds = selected.getBoundingClientRect();
      expect(
        Math.abs(
          triggerBounds.top +
            triggerBounds.height / 2 -
            selectedBounds.top -
            selectedBounds.height / 2,
        ),
      ).toBeLessThan(3);
    });
  },
};
