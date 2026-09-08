import { DirectionProvider } from '@base-ui/react/direction-provider';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useState } from 'react';
import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Tabs } from '../Tabs';
import styles from '../Tabs.module.scss';
import { type TabsListProps } from '../types/TabsListProps';
import { type TabsRootProps } from '../types/TabsRootProps';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <Tabs.Root defaultValue="overview">{children}</Tabs.Root>
);

const ListWrapper = ({ children }: { children: ReactNode }) => (
  <RootWrapper>
    <Tabs.List aria-label="Details">{children}</Tabs.List>
  </RootWrapper>
);

runComponentConformance({
  name: 'Tabs.Root',
  element: <Tabs.Root />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'Tabs.List',
  element: <Tabs.List aria-label="Details" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.list,
  renderPropTagName: 'div',
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Tabs.Tab',
  element: <Tabs.Tab value="overview">Overview</Tabs.Tab>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.tab,
  renderPropTagName: 'button',
  wrapper: ListWrapper,
});

runComponentConformance({
  name: 'Tabs.Panel',
  element: <Tabs.Panel value="overview">Overview content</Tabs.Panel>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.panel,
  renderPropTagName: 'div',
  wrapper: RootWrapper,
});

type ExampleProps = TabsRootProps & {
  activateOnFocus?: TabsListProps['activateOnFocus'];
  loopFocus?: TabsListProps['loopFocus'];
  keepMounted?: boolean;
};

const Example = ({
  activateOnFocus,
  loopFocus,
  keepMounted,
  ...props
}: ExampleProps) => (
  <Tabs.Root defaultValue="overview" {...props}>
    <Tabs.List
      aria-label="Details"
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
    >
      <Tabs.Tab value="overview">Overview</Tabs.Tab>
      <Tabs.Tab value="files" disabled>
        Files
      </Tabs.Tab>
      <Tabs.Tab value="activity">Activity</Tabs.Tab>
      <Tabs.Tab value="settings">Settings</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="overview" keepMounted={keepMounted}>
      <input aria-label="Draft" />
    </Tabs.Panel>
    <Tabs.Panel value="files" keepMounted={keepMounted}>
      Files content
    </Tabs.Panel>
    <Tabs.Panel value="activity" keepMounted={keepMounted}>
      Activity content
    </Tabs.Panel>
    <Tabs.Panel value="settings" keepMounted={keepMounted}>
      Settings content
    </Tabs.Panel>
  </Tabs.Root>
);

describe('Tabs', () => {
  it('selects an uncontrolled value by pointer and wires its panel', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await user.click(screen.getByRole('tab', { name: 'Activity' }));

    const tab = screen.getByRole('tab', { name: 'Activity' });
    const panel = screen.getByRole('tabpanel', { name: 'Activity' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(panel).toHaveTextContent('Activity content');
    expect(onValueChange).toHaveBeenCalledWith(
      'activity',
      expect.objectContaining({ reason: 'none' }),
    );
  });

  it('reports a controlled change and waits for the owner to update value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Example value="overview" onValueChange={onValueChange} />,
    );
    await user.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(onValueChange).toHaveBeenCalledWith('activity', expect.anything());
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    rerender(<Example value="activity" onValueChange={onValueChange} />);
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('updates when a controlled owner accepts the change', async () => {
    const user = userEvent.setup();
    const ControlledExample = () => {
      const [value, setValue] = useState('overview');
      return <Example value={value} onValueChange={setValue} />;
    };
    render(<ControlledExample />);
    await user.click(screen.getByRole('tab', { name: 'Activity' }));
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('moves focus with arrows and Home/End, skips disabled tabs, and activates with Enter/Space', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('tabpanel', { name: 'Settings' })).toBeVisible();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('selects on arrow focus only when activateOnFocus is enabled', async () => {
    const user = userEvent.setup();
    render(<Example activateOnFocus />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Activity' })).toHaveFocus();
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('does not activate a disabled tab', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    const disabledTab = screen.getByRole('tab', { name: 'Files' });
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
    await user.click(disabledTab);
    await user.keyboard('{Enter} ');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  });

  it('uses vertical navigation and can stop focus at the list boundary', async () => {
    const user = userEvent.setup();
    render(
      <Example orientation="vertical" activateOnFocus loopFocus={false} />,
    );
    expect(screen.getByRole('tablist', { name: 'Details' })).toHaveAttribute(
      'aria-orientation',
      'vertical',
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
    await user.keyboard('{End}{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
    await user.keyboard('{Home}{ArrowUp}');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
  });

  it('follows RTL arrow direction', async () => {
    const user = userEvent.setup();
    render(
      <DirectionProvider direction="rtl">
        <Example activateOnFocus dir="rtl" />
      </DirectionProvider>,
    );
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });

  it('unmounts inactive panels by default', async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.type(
      screen.getByRole('textbox', { name: 'Draft' }),
      'Draft text',
    );
    await user.click(screen.getByRole('tab', { name: 'Activity' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('textbox', { name: 'Draft', hidden: true }),
      ).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue('');
  });

  it('keeps inactive panels hidden and inert while preserving their input state', async () => {
    const user = userEvent.setup();
    render(<Example keepMounted />);
    const panel = screen.getByRole('tabpanel', { name: 'Overview' });
    await user.type(
      screen.getByRole('textbox', { name: 'Draft' }),
      'Saved draft',
    );
    await user.click(screen.getByRole('tab', { name: 'Activity' }));
    await waitFor(() => expect(panel).not.toBeVisible());
    expect(panel).toHaveAttribute('inert');
    expect(panel).toHaveAttribute('tabindex', '-1');
    expect(
      screen.queryByRole('textbox', { name: 'Draft' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByRole('textbox', { name: 'Draft' })).toHaveValue(
      'Saved draft',
    );
  });

  it('wires all kept panels to their tabs', () => {
    render(<Example keepMounted />);
    for (const tab of screen.getAllByRole('tab')) {
      const panel = screen
        .getAllByRole('tabpanel', { hidden: true })
        .find((element) => element.id === tab.getAttribute('aria-controls'));
      expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    }
  });

  it('supports no selected value', () => {
    render(<Example value={null} />);
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab', { selected: false })).toHaveLength(4);
  });

  it('renders slots, including a zero badge, and preserves function-form styling', async () => {
    const user = userEvent.setup();
    render(
      <RootWrapper>
        <Tabs.List aria-label="Details">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab
            value="activity"
            size="md"
            startIcon={<svg data-testid="icon" />}
            badge={0}
            className={({ active }) =>
              active ? 'selected-consumer' : 'consumer'
            }
            style={({ active }) => ({ marginInlineStart: active ? 7 : 3 })}
          >
            Activity
          </Tabs.Tab>
        </Tabs.List>
      </RootWrapper>,
    );
    const tab = screen.getByRole('tab', { name: /Activity\s*0/ });
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(tab).toHaveClass(styles.tab, 'consumer');
    expect(tab).toHaveStyle({ marginInlineStart: '3px' });
    expect(tab).toHaveAttribute('data-size', 'md');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'data-size',
      'sm',
    );
    await user.click(tab);
    expect(tab).toHaveClass(styles.tab, 'selected-consumer');
    expect(tab).toHaveStyle({ marginInlineStart: '7px' });
  });

  it.each([undefined, null, false, true, ''])(
    'omits empty slot wrappers for %s',
    (slot) => {
      render(
        <ListWrapper>
          <Tabs.Tab value="overview" badge={slot} startIcon={slot}>
            Overview
          </Tabs.Tab>
        </ListWrapper>,
      );
      const tab = screen.getByRole('tab', { name: 'Overview' });
      expect(tab.querySelector(`.${styles.badge}`)).toBeNull();
      expect(tab.querySelector(`.${styles.startIcon}`)).toBeNull();
    },
  );

  it('preserves non-native render and consumer click handlers', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Details">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab
            value="activity"
            nativeButton={false}
            render={<a href="#activity" aria-label="Activity" />}
            onClick={onClick}
          >
            Activity
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="activity">Activity content</Tabs.Panel>
      </Tabs.Root>,
    );
    const tab = screen.getByRole('tab', { name: 'Activity' });
    expect(tab.tagName).toBe('A');
    expect(tab).toHaveAttribute('href', '#activity');
    await user.click(tab);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('tabpanel', { name: 'Activity' })).toBeVisible();
  });
});
