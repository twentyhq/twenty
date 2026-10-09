import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';

import { type TabsTabProps } from '../types/TabsTabProps';
import { describe, expect, it, vi } from 'vitest';

import styles from '../../internal/tab/Tab.module.scss';
import { Tabs } from '../Tabs';
import { type TabsListProps } from '../types/TabsListProps';
import { type TabsRootProps } from '../types/TabsRootProps';

const TabsExample = ({
  rootProps,
  listProps,
  disabledActivity = false,
  indicator = true,
}: {
  rootProps?: TabsRootProps;
  listProps?: TabsListProps;
  disabledActivity?: boolean;
  indicator?: boolean;
}) => (
  <Tabs.Root defaultValue="overview" {...rootProps}>
    <Tabs.List aria-label="Details" {...listProps}>
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="activity" disabled={disabledActivity}>
        Activity
      </Tabs.Tab>
      <Tabs.Tab value="settings">Settings</Tabs.Tab>
      {indicator && <Tabs.Indicator data-testid="indicator" />}
    </Tabs.List>
    <Tabs.Panel value="overview">Overview content</Tabs.Panel>
    <Tabs.Panel value="activity">Activity content</Tabs.Panel>
    <Tabs.Panel value="settings">Settings content</Tabs.Panel>
  </Tabs.Root>
);

describe('Tabs behavior', () => {
  it('keeps manual arrow focus separate from selection and labels the selected panel', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TabsExample rootProps={{ onValueChange }} disabledActivity />);

    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{ArrowRight}');

    const settings = screen.getByRole('tab', { name: 'Settings' });
    expect(settings).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();

    await user.keyboard('{Enter}');

    const panel = screen.getByRole('tabpanel', { name: 'Settings' });
    expect(settings).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', settings.id);
    expect(panel).toHaveTextContent('Settings content');
    expect(onValueChange).toHaveBeenCalledWith(
      'settings',
      expect.objectContaining({
        reason: 'none',
        event: expect.objectContaining({ type: 'click' }),
      }),
    );
  });

  it('allows automatic arrow activation to be canceled while focus skips disabled tabs', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<NonNullable<TabsRootProps['onValueChange']>>(
      (_value, details) => details.cancel(),
    );
    render(
      <TabsExample
        rootProps={{ onValueChange }}
        listProps={{ activateOnFocus: true }}
        disabledActivity
      />,
    );

    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith(
      'settings',
      expect.objectContaining({ reason: 'none', isCanceled: true }),
    );
  });

  it('retains the controlled value until the parent commits a requested change', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <TabsExample rootProps={{ value: 'overview', onValueChange }} />,
    );

    await user.click(screen.getByRole('tab', { name: 'Activity' }));

    expect(onValueChange).toHaveBeenCalledWith('activity', expect.anything());
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();

    rerender(<TabsExample rootProps={{ value: 'activity', onValueChange }} />);

    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('preserves arbitrary value identity and canceled click changes', async () => {
    const user = userEvent.setup();
    const overview = { id: 'overview' };
    const activity = { id: 'activity' };
    const onValueChange = vi.fn<NonNullable<TabsRootProps['onValueChange']>>(
      (_value, details) => details.cancel(),
    );
    render(
      <Tabs.Root defaultValue={overview} onValueChange={onValueChange}>
        <Tabs.List aria-label="Details">
          <Tabs.Tab value={overview}>Overview</Tabs.Tab>
          <Tabs.Tab value={activity}>Activity</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value={overview}>Overview content</Tabs.Panel>
        <Tabs.Panel value={activity}>Activity content</Tabs.Panel>
      </Tabs.Root>,
    );

    await user.click(screen.getByRole('tab', { name: 'Activity' }));

    expect(onValueChange.mock.calls[0]?.[0]).toBe(activity);
    expect(onValueChange.mock.calls[0]?.[1].event).toBeInstanceOf(MouseEvent);
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  });

  it('reports an uncancelable disabled fallback for an uncontrolled selected tab', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn<NonNullable<TabsRootProps['onValueChange']>>(
      (_value, details) => {
        if (details.reason === 'disabled') {
          details.cancel();
        }
      },
    );
    const { rerender } = render(<TabsExample rootProps={{ onValueChange }} />);
    await user.click(screen.getByRole('tab', { name: 'Activity' }));

    rerender(<TabsExample rootProps={{ onValueChange }} disabledActivity />);

    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    expect(onValueChange).toHaveBeenLastCalledWith(
      'overview',
      expect.objectContaining({
        reason: 'disabled',
        activationDirection: 'none',
      }),
    );
  });

  it('renders only an explicitly composed indicator', () => {
    const { rerender } = render(<TabsExample indicator={false} />);
    expect(
      screen.getByRole('tablist').querySelector(`.${styles.indicator}`),
    ).toBeNull();

    rerender(<TabsExample />);

    const indicator = screen.getByTestId('indicator');
    expect(indicator).toHaveClass(styles.indicator);
    expect(
      screen.getByRole('tablist').querySelectorAll(`.${styles.indicator}`),
    ).toHaveLength(1);
  });

  it('keeps anchor composition and its ref on the actual tab element', async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLAnchorElement>();
    const onClick = vi.fn<NonNullable<TabsTabProps['onClick']>>((event) =>
      event.preventDefault(),
    );
    render(
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Details">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab
            value="activity"
            ref={ref}
            nativeButton={false}
            render={<a href="#activity" aria-label="Activity" />}
            onClick={onClick}
          >
            Activity
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="overview">Overview content</Tabs.Panel>
        <Tabs.Panel value="activity">Activity content</Tabs.Panel>
      </Tabs.Root>,
    );

    const activity = screen.getByRole('tab', { name: 'Activity' });
    expect(ref.current).toBe(activity);
    expect(activity).toBeInstanceOf(HTMLAnchorElement);
    expect(activity).toHaveAttribute('href', '#activity');
    await user.click(activity);
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });
});
