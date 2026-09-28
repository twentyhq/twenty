import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { DialogExample } from './DialogExample';
import { waitForDialog } from './waitForDialog';

const meta: Meta<typeof DialogExample> = {
  title: 'UI/Surfaces/Dialog',
  component: DialogExample,
};

export default meta;
type Story = StoryObj<typeof DialogExample>;

export const ScopedThemeAndDirection: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <DirectionProvider direction="rtl">
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <div
          data-testid="theme-scope"
          style={{ backgroundColor: 'var(--t-background-primary)' }}
        >
          <div
            data-testid="theme-color"
            style={{ backgroundColor: 'var(--t-background-primary)' }}
          />
          <DialogExample defaultOpen />
        </div>
      </ThemeProvider>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const colorSample = within(canvasElement).getByTestId('theme-color');
    expect(canvasElement).toContainElement(dialog);
    expect(dialog.closest('.dark')).not.toBeNull();
    expect(getComputedStyle(dialog).direction).toBe('rtl');
    expect(getComputedStyle(dialog).backgroundColor).toBe(
      getComputedStyle(colorSample).backgroundColor,
    );
    const cancel = within(dialog).getByRole('button', { name: 'Close' });
    const confirm = within(dialog).getByRole('button', {
      name: 'Save',
    });
    expect(cancel.getBoundingClientRect().left).toBeGreaterThan(
      confirm.getBoundingClientRect().left,
    );
  },
};

const ExplicitContainerDialog = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={setContainer} data-testid="portal-container" />
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <div style={{ backgroundColor: 'var(--t-background-primary)' }}>
          <DialogExample defaultOpen popupProps={{ container }} />
        </div>
      </ThemeProvider>
    </>
  );
};

export const ExplicitContainer: Story = {
  decorators: [ComponentDecorator],
  render: () => <ExplicitContainerDialog />,
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    expect(
      within(canvasElement).getByTestId('portal-container'),
    ).toContainElement(dialog);
    expect(dialog.closest('.dark')).toBeNull();
  },
};

const DeferredContainerDialog = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <ThemeProvider colorScheme="light" applyToRoot={false}>
      <div ref={containerRef} data-testid="deferred-container" />
      <Button onClick={() => setContainer(containerRef.current)}>
        Attach container
      </Button>
      <DialogExample open popupProps={{ container }} />
    </ThemeProvider>
  );
};

export const DeferredContainer: Story = {
  decorators: [ComponentDecorator],
  render: () => <DeferredContainerDialog />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Attach container' }),
    );
    const dialog = await waitForDialog(canvasElement);
    expect(canvas.getByTestId('deferred-container')).toContainElement(dialog);
  },
};

const RefContainerDialog = () => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={container} data-testid="ref-container" />
      <DialogExample defaultOpen popupProps={{ container }} />
    </>
  );
};

export const RefContainer: Story = {
  decorators: [ComponentDecorator],
  render: () => <RefContainerDialog />,
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    expect(within(canvasElement).getByTestId('ref-container')).toContainElement(
      dialog,
    );
  },
};

export const RenderComposition: Story = {
  decorators: [ComponentDecorator],
  args: {
    popupProps: {
      render: (props, state) => (
        <section {...props} data-render-open={state.open} />
      ),
      className: (state) => (state.open ? 'consumer-open' : 'consumer-closed'),
      style: (state) => ({
        borderTopWidth: state.open ? 3 : 1,
        borderTopStyle: 'solid',
      }),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit account' }));
    const dialog = await waitForDialog(canvasElement);
    expect(dialog.tagName).toBe('SECTION');
    expect(dialog).toHaveAttribute('data-render-open', 'true');
    expect(dialog).toHaveClass('consumer-open');
    expect(dialog).toHaveStyle({ borderTopWidth: '3px' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' }),
    );
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};
