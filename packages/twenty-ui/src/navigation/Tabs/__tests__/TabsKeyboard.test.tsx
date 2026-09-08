import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Tabs } from '../Tabs';
import { type TabsListProps } from '../types/TabsListProps';

const KeyboardExample = (props: TabsListProps) => (
  <Tabs.Root defaultValue="overview">
    <Tabs.List aria-label="Details" {...props}>
      <Tabs.Tab value="first" disabled>
        First
      </Tabs.Tab>
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="files" disabled>
        Files
      </Tabs.Tab>
      <Tabs.Tab value="activity">Activity</Tabs.Tab>
      <Tabs.Tab value="last" disabled>
        Last
      </Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview">Overview content</Tabs.Panel>
    <Tabs.Panel value="activity">Activity content</Tabs.Panel>
  </Tabs.Root>
);

describe('Tabs keyboard navigation', () => {
  it('skips disabled endpoints for Home, End, and looping arrows', async () => {
    const user = userEvent.setup();
    render(<KeyboardExample />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('stops at enabled endpoints when looping is disabled', async () => {
    const user = userEvent.setup();
    render(<KeyboardExample loopFocus={false} />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{End}{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
  });

  it.each(['preventDefault', 'preventBaseUIHandler'] as const)(
    'lets a consumer cancel navigation with %s',
    async (method) => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn<NonNullable<TabsListProps['onKeyDown']>>(
        (event) => event[method](),
      );
      render(<KeyboardExample onKeyDown={onKeyDown} />);
      await user.tab();
      await user.keyboard('{ArrowRight}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    },
  );

  it('preserves modified and off-axis arrow keys', async () => {
    const user = userEvent.setup();
    render(<KeyboardExample activateOnFocus />);
    await user.tab();
    await user.keyboard(
      '{Control>}{ArrowRight}{/Control}{Shift>}{End}{/Shift}{ArrowDown}',
    );
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  });

  it('skips disabled polymorphic tabs', async () => {
    const user = userEvent.setup();
    render(
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Details" activateOnFocus>
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab
            value="files"
            disabled
            nativeButton={false}
            render={<a href="#files" aria-label="Files" />}
          >
            Files
          </Tabs.Tab>
          <Tabs.Tab
            value="activity"
            nativeButton={false}
            render={<a href="#activity" aria-label="Activity" />}
          >
            Activity
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="activity">Activity content</Tabs.Panel>
      </Tabs.Root>,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('handles an all-disabled list without selecting or looping forever', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs.Root value="overview" onValueChange={onValueChange}>
        <Tabs.List aria-label="Details">
          <Tabs.Tab value="overview" disabled>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="activity" disabled>
            Activity
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}{Home}{End}{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('ignores events from a nested tablist and preserves event bubbling', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(
      <Tabs.Root defaultValue="outer">
        <Tabs.List aria-label="Outer" onKeyDown={onKeyDown}>
          <Tabs.Tab value="outer">Outer</Tabs.Tab>
          <Tabs.Root defaultValue="inner">
            <Tabs.List aria-label="Inner" activateOnFocus>
              <Tabs.Tab value="inner">Inner</Tabs.Tab>
              <Tabs.Tab value="next">Next</Tabs.Tab>
            </Tabs.List>
          </Tabs.Root>
        </Tabs.List>
      </Tabs.Root>,
    );
    await user.click(screen.getByRole('tab', { name: 'Inner' }));
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Next' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Outer' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
