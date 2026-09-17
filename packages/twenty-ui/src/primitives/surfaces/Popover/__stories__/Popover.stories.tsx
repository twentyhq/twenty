import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { IconButton } from '@ui/primitives/input/IconButton/IconButton';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Popover } from '../Popover';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';
import { type PopoverRootProps } from '../types/PopoverRootProps';
import { type PopoverSide } from '../types/PopoverSide';

type PopoverStoryProps = PopoverRootProps &
  Pick<
    PopoverPopupProps,
    'side' | 'align' | 'arrow' | 'keepMounted' | 'container'
  >;

const PopoverStory = ({
  side,
  align,
  arrow,
  keepMounted,
  container,
  ...props
}: PopoverStoryProps) => (
  <>
    <Popover.Root {...props}>
      <Popover.Trigger
        aria-label="Open"
        style={{ alignSelf: 'flex-start', marginInline: 'auto' }}
        render={<Button>Open</Button>}
      />
      <Popover.Popup
        side={side}
        align={align}
        arrow={arrow}
        keepMounted={keepMounted}
        container={container}
      >
        <Popover.Title>Details</Popover.Title>
        <Popover.Description>More information</Popover.Description>
        <Button type="button" aria-label="First action">
          First action
        </Button>
        <Popover.Close
          style={{ alignSelf: 'flex-start' }}
          render={<IconButton Icon={IconX} ariaLabel="Close" size="small" />}
        />
      </Popover.Popup>
    </Popover.Root>
    <Button type="button" aria-label="Outside">
      Outside
    </Button>
  </>
);

const meta: Meta<typeof PopoverStory> = {
  title: 'UI/Surfaces/Popover',
  component: PopoverStory,
};

export default meta;
type Story = StoryObj<typeof PopoverStory>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 200 } },
  args: { defaultOpen: true },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open' });

    await step('Render an initially open dialog in the body', async () => {
      const dialog = await body.findByRole('dialog', {
        name: 'Details',
        description: 'More information',
      });
      expect(canvasElement.ownerDocument.body).toContainElement(dialog);
      expect(canvasElement).not.toContainElement(dialog);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        body.getByRole('heading', { name: 'Details' }).id,
      );
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        body.getByText('More information').id,
      );
      expect(dialog.querySelectorAll(':scope > [data-side]')).toHaveLength(0);
    });

    await step('Close with the close button', async () => {
      await userEvent.click(body.getByRole('button', { name: 'Close' }));
      await waitFor(() =>
        expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    });
    await step(
      'Open a named and described dialog from the trigger',
      async () => {
        await userEvent.click(trigger);
        const dialog = await body.findByRole('dialog', {
          name: 'Details',
          description: 'More information',
        });
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('aria-controls', dialog.id);
      },
    );
    await step('Dismiss by clicking outside', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
      await waitFor(() =>
        expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    });
    await userEvent.click(trigger);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
  },
};

export const Documentation: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 200 } },
  render: () => (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Show details"
        style={{ alignSelf: 'flex-start' }}
        render={<Button>Show details</Button>}
      />
      <Popover.Popup>
        <Popover.Title>Contact details</Popover.Title>
        <Popover.Description>
          Add notes and contact information here.
        </Popover.Description>
        <Popover.Close aria-label="Close" render={<Button>Close</Button>} />
      </Popover.Popup>
    </Popover.Root>
  ),
};

export const DocumentationInteractions: Story = {
  ...Documentation,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Show details' });

    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Contact details',
    });

    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.click(await body.findByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

const ArrowPopoverStory = (props: PopoverStoryProps) => {
  const [arrow, setArrow] = useState(true);

  return (
    <div style={{ paddingTop: 160, paddingInlineStart: 160 }}>
      <PopoverStory {...props} open arrow={arrow} />
      <Button
        type="button"
        aria-label="Toggle arrow"
        onClick={() => setArrow(!arrow)}
      >
        Toggle arrow
      </Button>
    </div>
  );
};

export const WithArrow: Story = {
  ...Default,
  args: { side: 'top', align: 'end' },
  parameters: { container: { width: 480, height: 400 } },
  render: (args) => <ArrowPopoverStory {...args} />,
  play: async ({ canvasElement }) => {
    const dialog = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
    );
    await waitFor(() => expect(dialog).toHaveAttribute('data-side', 'top'));
    expect(dialog).toHaveAttribute('data-align', 'end');
    expect(dialog.querySelectorAll(':scope > [data-side]')).toHaveLength(1);
    const toggle = within(canvasElement).getByRole('button', {
      name: 'Toggle arrow',
    });
    await userEvent.click(toggle);
    expect(dialog.querySelectorAll(':scope > [data-side]')).toHaveLength(0);
    await userEvent.click(toggle);
    expect(dialog.querySelectorAll(':scope > [data-side]')).toHaveLength(1);
  },
};

const ExplicitContainerPopoverStory = (props: PopoverStoryProps) => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <PopoverStory {...props} container={container} />
      <div ref={setContainer} role="region" aria-label="Popover portal" />
    </>
  );
};

export const ExplicitContainer: Story = {
  ...Default,
  args: { open: true },
  render: (args) => <ExplicitContainerPopoverStory {...args} />,
  play: async ({ canvasElement }) => {
    const container = within(canvasElement).getByRole('region', {
      name: 'Popover portal',
    });
    expect(
      await within(container).findByRole('dialog', { name: 'Details' }),
    ).toBeVisible();
  },
};

export const ScopedTheme: Story = {
  ...Default,
  args: { open: true },
  render: (args) => (
    <section aria-label="Scoped dark theme">
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <div
          style={{
            background: 'var(--t-background-primary)',
            width: 240,
            height: 200,
          }}
        >
          <PopoverStory {...args} />
        </div>
      </ThemeProvider>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const scope = within(canvasElement).getByRole('region', {
      name: 'Scoped dark theme',
    });
    expect(
      await within(scope).findByRole('dialog', { name: 'Details' }),
    ).toBeVisible();
  },
};

export const TrapFocus: Story = {
  ...Default,
  args: { modal: 'trap-focus' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const first = await body.findByRole('button', { name: 'First action' });
    const last = body.getByRole('button', { name: 'Close' });
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.tab();
    expect(last).toHaveFocus();
    await userEvent.tab();
    await waitFor(() => expect(first).toHaveFocus());
    await userEvent.tab({ shift: true });
    await waitFor(() => expect(last).toHaveFocus());
  },
};

export const Keyboard: Story = {
  ...Default,
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Open' });
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    for (const key of ['{Enter}', ' ']) {
      await step(
        `Open with ${key === ' ' ? 'Space' : 'Enter'} and dismiss with Escape`,
        async () => {
          await userEvent.keyboard(key);
          await waitFor(() =>
            expect(
              body.getByRole('button', { name: 'First action' }),
            ).toHaveFocus(),
          );
          await userEvent.keyboard('{Escape}');
          await waitFor(() =>
            expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
          );
          await waitFor(() => expect(trigger).toHaveFocus());
        },
      );
    }
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
  },
};

export const WithoutTabbableContent: Story = {
  ...Default,
  args: {},
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger aria-label="Open" render={<Button>Open</Button>} />
      <Popover.Popup>
        <Popover.Title>Details</Popover.Title>
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    expect(
      within(canvasElement).getByRole('button', { name: 'Open' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog')).toHaveFocus());
  },
};

export const NonModalTabbing: Story = {
  ...Default,
  args: { onOpenChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Open' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'First action' })).toHaveFocus(),
    );
    await userEvent.tab();
    expect(body.getByRole('button', { name: 'Close' })).toHaveFocus();
    await userEvent.tab();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(args.onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'focus-out' }),
    );
    expect(canvas.getByRole('button', { name: 'Outside' })).toHaveFocus();
  },
};

const ControlledPopoverStory = (props: PopoverStoryProps) => {
  const [open, setOpen] = useState(true);

  return (
    <>
      <PopoverStory {...props} open={open} />
      <Button
        type="button"
        aria-label="Apply closed state"
        onClick={() => setOpen(false)}
      >
        Apply closed state
      </Button>
    </>
  );
};

export const Controlled: Story = {
  ...Default,
  args: { onOpenChange: fn() },
  render: (args) => <ControlledPopoverStory {...args} />,
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    expect(body.getByRole('dialog')).toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Apply closed state' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const KeepMounted: Story = {
  ...Default,
  args: { defaultOpen: true, keepMounted: true },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(body.getByRole('button', { name: 'Close' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(body.getByRole('dialog', { hidden: true })).not.toBeVisible();
  },
};

const POPOVER_CATALOG_ALIGNMENT: Record<PopoverSide, CSSProperties> = {
  bottom: { alignItems: 'flex-start', justifyContent: 'center' },
  top: { alignItems: 'flex-end', justifyContent: 'center' },
  left: { alignItems: 'center', justifyContent: 'flex-end' },
  right: { alignItems: 'center', justifyContent: 'flex-start' },
  'inline-end': { alignItems: 'center', justifyContent: 'flex-start' },
  'inline-start': { alignItems: 'center', justifyContent: 'flex-end' },
};

const PopoverCatalogCell = ({ side = 'bottom', arrow }: PopoverStoryProps) => {
  const [cellElement, setCellElement] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setCellElement}
      style={{
        position: 'relative',
        display: 'flex',
        width: 180,
        height: 100,
        ...POPOVER_CATALOG_ALIGNMENT[side],
      }}
    >
      <Popover.Root open modal={false}>
        <Popover.Trigger
          aria-label={`Open ${side} popover ${arrow ? 'with' : 'without'} arrow`}
        >
          Open
        </Popover.Trigger>
        <Popover.Popup container={cellElement} side={side} arrow={arrow}>
          <Popover.Title>Details</Popover.Title>
          <Popover.Description>More information</Popover.Description>
        </Popover.Popup>
      </Popover.Root>
    </div>
  );
};

export const Catalog: CatalogStory<Story, typeof PopoverStory> = {
  render: (args) => <PopoverCatalogCell {...args} />,
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'arrow',
          values: ['none', 'arrow'],
          props: (arrow: string) => ({ arrow: arrow === 'arrow' }),
        },
        {
          name: 'side',
          values: [
            'bottom',
            'top',
            'inline-end',
            'inline-start',
          ] satisfies PopoverSide[],
          props: (side: PopoverSide) => ({ side }),
        },
      ],
      options: { elementContainer: { style: { width: 180, height: 100 } } },
    },
  },
};
export const CatalogDark: CatalogStory<Story, typeof PopoverStory> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
