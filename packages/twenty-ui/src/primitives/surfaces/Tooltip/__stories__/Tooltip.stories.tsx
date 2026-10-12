import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconInfoCircle } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { Tooltip } from '../Tooltip';

const findTooltip = async (canvasElement: HTMLElement) => {
  const tooltip = await within(canvasElement.ownerDocument.body).findByRole(
    'tooltip',
  );

  await waitFor(() => expect(tooltip).toBeVisible());

  return tooltip;
};

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Surfaces/Tooltip',
  component: Tooltip,
  decorators: [ComponentDecorator],
  args: {
    content: 'Amount',
    side: 'bottom',
    delay: 300,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Show details</Button>
    </Tooltip>
  ),
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(await findTooltip(canvasElement)).toHaveTextContent('Amount');
  },
};

export const Documentation: Story = {};

export const WithArrow: Story = {
  ...Default,
  args: { arrow: true },
};

export const WithExitAnimation: Story = {
  ...Default,
  args: { withExitAnimation: true },
};

export const WithDescription: Story = {
  ...Default,
  args: {
    description: 'The amount of this opportunity',
  },
};

export const WithIcon: Story = {
  ...Default,
  args: {
    startIcon: <IconInfoCircle />,
    description: 'The amount of this opportunity',
  },
};

export const KeyboardFocus: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();

    expect(within(canvasElement).getByRole('button')).toHaveFocus();
    expect(await findTooltip(canvasElement)).toHaveTextContent('Amount');

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
    expect(within(canvasElement).getByRole('button')).toHaveFocus();
  },
};

const ControlledExample = () => {
  const [open, setOpen] = useState(false);

  return (
    <Tooltip content="Amount" open={open} onOpenChange={setOpen}>
      <span>
        <Button>Show details</Button>
      </span>
    </Tooltip>
  );
};

export const Controlled: Story = {
  ...Default,
  render: () => <ControlledExample />,
};

export const DisabledButton: Story = {
  ...Default,
  render: (args) => (
    <Tooltip {...args}>
      <span>
        <Button disabled>Show details</Button>
      </span>
    </Tooltip>
  ),
};

export const Hoverable: Story = {
  args: { closeDelay: 100 },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
    const tooltip = await findTooltip(canvasElement);

    await userEvent.hover(tooltip);
    expect(tooltip).toBeVisible();

    await userEvent.unhover(tooltip);

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const WithMaxWidth: Story = {
  ...Default,
  args: {
    maxWidth: '200px',
    description:
      'A longer description that wraps naturally within the maximum tooltip width.',
  },
};

export const CustomContent: Story = {
  ...Default,
  args: { content: <strong>Amount in workspace currency</strong> },
};

export const SharedPopup: Story = {
  render: () => (
    <Tooltip.Root<string>>
      {({ payload }) => (
        <>
          <Tooltip.Trigger payload="First amount" render={<span />}>
            <Button>First field</Button>
          </Tooltip.Trigger>
          <Tooltip.Trigger payload="Second amount" render={<span />}>
            <Button>Second field</Button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={10} style={{ maxWidth: '300px' }}>
              <Tooltip.Popup>{payload}</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </>
      )}
    </Tooltip.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'First field' }));
    expect(await findTooltip(canvasElement)).toHaveTextContent('First amount');

    await userEvent.hover(canvas.getByRole('button', { name: 'Second field' }));

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('tooltip'),
      ).toHaveTextContent('Second amount'),
    );
  },
};

export const Hidden: Story = {
  args: { disabled: true, open: true },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));

    expect(
      within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};

const PartContractExample = () => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [reason, setReason] = useState('closed');

  return (
    <Tooltip.Provider delay={80} closeDelay={80} timeout={200}>
      <Tooltip.Root
        onOpenChange={(...changeArguments) => {
          const [open, details] = changeArguments;
          setReason(open ? details.reason : 'closed');
        }}
      >
        <Tooltip.Trigger render={<Button>Compound details</Button>} />
        <Tooltip.Portal data-tooltip-portal="compound">
          <Tooltip.Positioner
            side="inline-end"
            sideOffset={12}
            arrowPadding={8}
          >
            <Tooltip.Popup ref={popupRef} aria-label="Compound help">
              <Tooltip.Arrow />
              <Tooltip.Viewport>Compound amount</Tooltip.Viewport>
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip
        content="Shorthand amount"
        side="inline-end"
        arrow
        arrowPadding={8}
        triggerProps={{ 'aria-label': 'Shorthand details' }}
        positionerProps={{ 'aria-label': 'Shorthand positioner' }}
        portalProps={{ 'aria-label': 'Shorthand portal' }}
      >
        <Button>Shorthand details</Button>
      </Tooltip>
      <Text role="status">{reason}</Text>
    </Tooltip.Provider>
  );
};

export const PartsAndProvider: Story = {
  render: () => <PartContractExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const compound = canvas.getByRole('button', { name: 'Compound details' });
    await userEvent.hover(compound);
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Compound amount',
    );
    expect(canvas.getByRole('status')).toHaveTextContent('trigger-hover');
    await userEvent.hover(page.getByRole('tooltip'));
    expect(page.getByRole('tooltip')).toBeVisible();
    await userEvent.unhover(page.getByRole('tooltip'));
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await userEvent.hover(
      canvas.getByRole('button', { name: 'Shorthand details' }),
    );
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Shorthand amount',
    );
    expect(page.getByLabelText('Shorthand positioner')).toBeVisible();
    expect(page.getByLabelText('Shorthand portal')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await userEvent.tab();
    expect(compound).toHaveFocus();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Compound amount',
    );
    expect(canvas.getByRole('status')).toHaveTextContent('trigger-focus');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    expect(compound).toHaveFocus();
  },
};

const ShorthandHandleExample = () => {
  const [handle] = useState(() => Tooltip.createHandle<string>());
  return (
    <>
      <Tooltip.Trigger
        handle={handle}
        payload="Detached amount"
        render={<Button>Detached details</Button>}
      />
      <Tooltip<string>
        handle={handle}
        content={({ payload }) => payload}
        triggerProps={{ payload: 'Local amount' }}
      >
        <Button>Local details</Button>
      </Tooltip>
    </>
  );
};

export const ShorthandHandle: Story = {
  render: () => <ShorthandHandleExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    expect(
      canvas.getByRole('button', { name: 'Detached details' }),
    ).toHaveFocus();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Detached amount',
    );
    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'Local details' })).toHaveFocus();
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('tooltip'),
      ).toHaveTextContent('Local amount'),
    );
  },
};

const PositionedExample = () => {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={anchorRef}>Positioning anchor</Button>
      <Tooltip.Root defaultOpen>
        <Tooltip.Portal>
          <Tooltip.Positioner
            anchor={anchorRef}
            positionMethod="fixed"
            side="bottom"
            sideOffset={({ anchor }) => anchor.height / 2}
            alignOffset={({ anchor }) => anchor.width / 4}
            collisionAvoidance={{ side: 'none', align: 'none' }}
            sticky
            disableAnchorTracking
            arrowPadding={12}
            aria-label="Compound positioner"
          >
            <Tooltip.Popup>
              Positioned compound hint
              <Tooltip.Arrow />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
      <Tooltip
        content="Positioned shorthand hint"
        defaultOpen
        anchor={anchorRef}
        positionMethod="fixed"
        side="top"
        sideOffset={({ anchor }) => anchor.height / 2}
        collisionAvoidance={{ side: 'none', align: 'none' }}
        arrowPadding={12}
        arrow
        positionerProps={{ 'aria-label': 'Shorthand positioner' }}
      >
        <Button>Shorthand anchor</Button>
      </Tooltip>
    </>
  );
};

export const AdvancedPositioning: Story = {
  render: () => <PositionedExample />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const anchor = within(canvasElement).getByRole('button', {
      name: 'Positioning anchor',
    });
    await waitFor(() => {
      const anchorBounds = anchor.getBoundingClientRect();
      const compound = page.getByLabelText('Compound positioner');
      const shorthand = page.getByLabelText('Shorthand positioner');
      expect(page.getByText('Positioned compound hint')).toBeVisible();
      expect(page.getByText('Positioned shorthand hint')).toBeVisible();
      expect(compound).toHaveAttribute('data-side', 'bottom');
      expect(shorthand).toHaveAttribute('data-side', 'top');
      expect(compound.style.position).toBe('fixed');
      expect(compound.getBoundingClientRect().top).toBeCloseTo(
        anchorBounds.bottom + anchorBounds.height / 2,
        0,
      );
      expect(shorthand.getBoundingClientRect().bottom).toBeCloseTo(
        anchorBounds.top - anchorBounds.height / 2,
        0,
      );
    });
  },
};

export const CompoundDisabledControl: Story = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<span tabIndex={0} aria-label="Unavailable export" />}
      >
        <Button disabled>Export records</Button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>Select a record first</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    expect(
      within(canvasElement).getByLabelText('Unavailable export'),
    ).toHaveFocus();
    expect(within(canvasElement).getByRole('button')).toBeDisabled();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Select a record first',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).queryByRole('tooltip'),
      ).not.toBeInTheDocument(),
    );
  },
};

export const ProviderDelays: Story = {
  render: () => (
    <Tooltip.Provider delay={200} closeDelay={200} timeout={400}>
      <Tooltip content="Delayed shorthand" disableHoverablePopup>
        <Button>Delayed shorthand trigger</Button>
      </Tooltip>
      <Tooltip.Root disableHoverablePopup>
        <Tooltip.Trigger render={<Button>Delayed compound trigger</Button>} />
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Delayed compound</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const shorthand = canvas.getByRole('button', {
      name: 'Delayed shorthand trigger',
    });
    await userEvent.hover(shorthand);
    expect(page.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Delayed shorthand',
    );
    await userEvent.unhover(shorthand);
    expect(page.getByRole('tooltip')).toBeVisible();
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    const compound = canvas.getByRole('button', {
      name: 'Delayed compound trigger',
    });
    await userEvent.hover(compound);
    expect(await findTooltip(canvasElement)).toHaveTextContent(
      'Delayed compound',
    );
    await userEvent.unhover(compound);
    expect(page.getByRole('tooltip')).toBeVisible();
    await waitFor(() =>
      expect(page.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  },
};
