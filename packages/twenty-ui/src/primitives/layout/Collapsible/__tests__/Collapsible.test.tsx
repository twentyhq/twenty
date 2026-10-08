import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { type PropsWithChildren, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Collapsible } from '../Collapsible';
import styles from '../Collapsible.module.scss';
import { type CollapsibleTriggerProps } from '../types/CollapsibleTriggerProps';
import { type CollapsibleRootChangeEventDetails } from '../types/CollapsibleRootChangeEventDetails';

const OpenRoot = ({ children }: PropsWithChildren) => (
  <Collapsible.Root defaultOpen>{children}</Collapsible.Root>
);

runComponentConformance({
  name: 'Collapsible.Root',
  element: <Collapsible.Root />,
  refInstanceOf: HTMLDivElement,
});

runComponentConformance({
  name: 'Collapsible.Trigger',
  renderPropTagName: 'button',
  element: <Collapsible.Trigger>Toggle</Collapsible.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: OpenRoot,
});

runComponentConformance({
  name: 'Collapsible.Panel',
  element: <Collapsible.Panel>Content</Collapsible.Panel>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.panel,
  wrapper: OpenRoot,
});

describe('Collapsible', () => {
  it('opens an uncontrolled panel with a linked keyboard trigger', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Collapsible.Root onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel id="details-panel">Import details</Collapsible.Panel>
      </Collapsible.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Import details')).not.toBeInTheDocument();

    await user.tab();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', 'details-panel');
    expect(screen.getByText('Import details')).toHaveAttribute(
      'id',
      'details-panel',
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-press',
        event: expect.any(Event),
        cancel: expect.any(Function),
      }),
    );

    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(screen.queryByText('Import details')).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it('leaves controlled visibility with the caller', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const Controlled = ({ open }: { open: boolean }) => (
      <Collapsible.Root open={open} onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel>Import details</Collapsible.Panel>
      </Collapsible.Root>
    );
    const { rerender } = render(<Controlled open={false} />);
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(onOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    );
    expect(screen.queryByText('Import details')).not.toBeInTheDocument();
    rerender(<Controlled open />);
    expect(screen.getByText('Import details')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('honors cancellation through the upstream change details', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn(
      (open: boolean, details: CollapsibleRootChangeEventDetails) => {
        expect(open).toBe(true);
        details.cancel();
      },
    );
    render(
      <Collapsible.Root onOpenChange={onOpenChange}>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel>Import details</Collapsible.Panel>
      </Collapsible.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Details' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('suppresses disabled root and trigger activation', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <Collapsible.Root disabled onOpenChange={onOpenChange}>
          <Collapsible.Trigger>Disabled root</Collapsible.Trigger>
          <Collapsible.Panel>Root content</Collapsible.Panel>
        </Collapsible.Root>
        <Collapsible.Root onOpenChange={onOpenChange}>
          <Collapsible.Trigger disabled>Disabled trigger</Collapsible.Trigger>
          <Collapsible.Panel>Trigger content</Collapsible.Panel>
        </Collapsible.Root>
      </>,
    );
    for (const trigger of screen.getAllByRole('button')) {
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      await user.click(trigger);
    }
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('preserves native handlers and Base UI event cancellation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn<NonNullable<CollapsibleTriggerProps['onClick']>>(
      (event) => event.preventBaseUIHandler(),
    );
    render(
      <Collapsible.Root>
        <Collapsible.Trigger onClick={onClick}>Details</Collapsible.Trigger>
        <Collapsible.Panel>Import details</Collapsible.Panel>
      </Collapsible.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Import details')).not.toBeInTheDocument();
  });

  it('keeps hidden content state when keepMounted is requested', async () => {
    const user = userEvent.setup();
    const Counter = () => {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    };
    render(
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger>Details</Collapsible.Trigger>
        <Collapsible.Panel keepMounted>
          <Counter />
        </Collapsible.Panel>
      </Collapsible.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Count 0' }));
    await user.click(screen.getByRole('button', { name: 'Details' }));
    await waitFor(() => expect(screen.getByText('Count 1')).not.toBeVisible());
    await user.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByRole('button', { name: 'Count 1' })).toBeVisible();
  });

  it('activates a composed non-native trigger through the keyboard', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible.Root>
        <Collapsible.Trigger nativeButton={false} render={<span />}>
          Details
        </Collapsible.Trigger>
        <Collapsible.Panel>Import details</Collapsible.Panel>
      </Collapsible.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger.tagName).toBe('SPAN');
    await user.tab();
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Import details')).toBeVisible();
  });

  it('passes state to native style and className callbacks', () => {
    render(
      <Collapsible.Root defaultOpen>
        <Collapsible.Panel
          dimension="width"
          containAnimation={false}
          duration="fast"
          className={(state) => (state.open ? 'open-panel' : 'closed-panel')}
          style={(state) => ({
            padding: state.open ? 7 : 0,
            transitionDuration: '0.4s, 0.2s',
          })}
        >
          Import details
        </Collapsible.Panel>
      </Collapsible.Root>,
    );
    const panel = screen.getByText('Import details');
    expect(panel).toHaveClass(styles.panel, 'open-panel');
    expect(panel).not.toHaveClass(styles.contained);
    expect(panel).toHaveStyle({
      padding: '7px',
      transitionDuration: '0.4s, 0.2s',
    });
  });
});
