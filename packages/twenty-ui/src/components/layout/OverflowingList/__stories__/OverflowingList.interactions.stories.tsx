import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createRef, StrictMode } from 'react';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { OverflowingList } from '../OverflowingList';
import { type OverflowingListProps } from '../types/OverflowingListProps';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';
import { OverflowingListEventBlockingExample } from './OverflowingListEventBlockingExample';
import { OverflowingListActionsExample } from './OverflowingListActionsExample';
import { OverflowingListCanceledCloseExample } from './OverflowingListCanceledCloseExample';
import { OverflowingListControlledExample } from './OverflowingListControlledExample';
import { OverflowingListControlledStateExample } from './OverflowingListControlledStateExample';
import { OverflowingListDisabledTriggerFocusExample } from './OverflowingListDisabledTriggerFocusExample';
import { OverflowingListInstanceCleanupExample } from './OverflowingListInstanceCleanupExample';
import { OverflowingListTriggerRefExample } from './OverflowingListTriggerRefExample';
import { OverflowingListControlledFocusExample } from './OverflowingListControlledFocusExample';
import { OverflowingListMutableTag } from './OverflowingListMutableTag';
import { OverflowingListFocusExample } from './OverflowingListFocusExample';
import { OverflowingListStateExample } from './OverflowingListStateExample';
import { OverflowingListResizeExample } from './OverflowingListResizeExample';
import { expectOverflowingListPopupGeometry } from './expectOverflowingListPopupGeometry';

const onEventHost = fn();
const onEventOverride = fn();
const onHostClick = fn();
const onHostMouseDown = fn();
const onHostKeyDown = fn();
const onItemClick = fn();
const onRootClick = fn();
const onTriggerClick = fn();
const onPopupClick = fn();
const onPopupRenderClick = fn();
const onPopupRenderKeyDown = fn();
const onOpenChange = fn<NonNullable<OverflowingListProps['onOpenChange']>>();
const onCanceledOpenChange = fn<
  NonNullable<OverflowingListProps['onOpenChange']>
>((_open, details) => details.cancel());
const onCancelableOpenChange = fn<
  NonNullable<OverflowingListProps['onOpenChange']>
>((_open, details) => {
  if (details.reason === 'escape-key') {
    details.cancel();
  }
});
const rootRef = createRef<HTMLDivElement>();
const triggerRef = createRef<HTMLElement>();
const popupRef = createRef<HTMLDivElement>();
const popupRenderRef = createRef<HTMLElement>();

const meta: Meta<typeof OverflowingList> = {
  id: 'ui-components-overflowinglist-interactions',
  title: 'UI/Components/Layout/OverflowingList/Interactions',
  component: OverflowingList,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 400, height: 280 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    children: OVERFLOWING_LIST_STORY_ITEMS,
    showOverflowCount: true,
    style: { width: 180, alignSelf: 'center' },
  },
  beforeEach: () => {
    onEventHost.mockClear();
    onEventOverride.mockClear();
    onHostClick.mockClear();
    onHostMouseDown.mockClear();
    onHostKeyDown.mockClear();
    onItemClick.mockClear();
    onRootClick.mockClear();
    onTriggerClick.mockClear();
    onPopupClick.mockClear();
    onPopupRenderClick.mockClear();
    onPopupRenderKeyDown.mockClear();
    onOpenChange.mockClear();
    onCanceledOpenChange.mockClear();
    onCancelableOpenChange.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof OverflowingList>;

export const Keyboard: Story = {
  args: { onOpenChange },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    for (const key of ['{Enter}', ' ']) {
      await step(`Open with ${key === ' ' ? 'Space' : 'Enter'}`, async () => {
        await userEvent.keyboard(key);
        const dialog = await body.findByRole('dialog', {
          name: 'Show all items',
        });
        await waitFor(() => expect(dialog).toHaveFocus());
        await expectOverflowingListPopupGeometry({ trigger, dialog });
        expect(onOpenChange).toHaveBeenLastCalledWith(
          true,
          expect.objectContaining({
            reason: 'trigger-press',
            trigger,
            event: expect.objectContaining({ type: 'click' }),
            cancel: expect.anything(),
          }),
        );
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('aria-controls', dialog.id);
        expect(canvasElement).not.toContainElement(dialog);

        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
          expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
        );
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(onOpenChange).toHaveBeenLastCalledWith(
          false,
          expect.objectContaining({
            reason: 'escape-key',
            event: expect.objectContaining({ type: 'keydown' }),
          }),
        );
      });
    }
  },
};

export const CompleteListWithInlineCap: Story = {
  args: { maxInlineCount: 1 },
  render: (args) => (
    <>
      <OverflowingList {...args} />
      <Button>Outside the list</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    const inlineCustomer = canvas.getByText('Customer');

    expect(trigger).toHaveTextContent('+3');
    expect(trigger).toHaveAccessibleName('+3 Show all items');
    expect(canvas.queryByText('Renewal')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });

    expect(canvas.getByText('Customer')).toBe(inlineCustomer);
    expect(inlineCustomer).toBeVisible();
    expect(canvas.queryByText('Renewal')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('+3');
    for (const label of ['Customer', 'Partner', 'Priority', 'Renewal']) {
      await waitFor(() =>
        expect(within(dialog).getByText(label)).toBeVisible(),
      );
    }

    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside the list' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ResizeAndContentUpdates: Story = {
  render: () => <OverflowingListResizeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Narrow list' }));
    const narrowTrigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(narrowTrigger).toHaveTextContent('+3'));
    await userEvent.click(
      canvas.getByRole('button', { name: /Show all items$/ }),
    );
    await body.findByRole('dialog', { name: 'Show all items' });
    const list = canvas.getByLabelText('Resizable tags');
    list.style.width = '360px';
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: /Show all items$/ }),
      ).not.toBeInTheDocument(),
    );

    list.style.width = '100px';
    await canvas.findByRole('button', { name: /Show all items$/ });
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Widen list' }));

    await userEvent.click(
      canvas.getByRole('button', { name: 'Lengthen labels' }),
    );
    expect(
      await canvas.findByRole('button', { name: /Show all items$/ }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Shorten labels' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: /Show all items$/ }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const CountVisibility: Story = {
  args: { showOverflowCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstItem = canvas.getByText('Customer');

    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();

    await userEvent.hover(firstItem);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '1' }));
    await userEvent.unhover(firstItem);
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '0' }));
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '1' }));
  },
};

export const CountDisabled: Story = {
  args: {
    showOverflowCount: false,
    children: ['First item', 'Second item', 'Third item'].map((label) => (
      <Button key={label} style={{ width: 100 }}>
        {label}
      </Button>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByRole('button', { name: 'First item' }));
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();

    for (const label of ['First item', 'Second item', 'Third item']) {
      await userEvent.tab();
      const item = canvas.getByRole('button', { name: label });
      expect(item).toHaveFocus();
      expect(item.parentElement?.getBoundingClientRect().width).toBeGreaterThan(
        0,
      );
    }
    expect(canvas.getByText('Third item').closest('[inert]')).toBeNull();
  },
};

export const InlineItemFocus: Story = {
  args: {
    showOverflowCount: undefined,
    style: { width: 168 },
    children: ['First item', 'Second item', 'Third item'].map((label) => (
      <Button key={label} style={{ width: 80 }}>
        {label}
      </Button>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstItem = canvas.getByRole('button', { name: 'First item' });
    const secondItem = canvas.getByRole('button', { name: 'Second item' });

    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();

    await userEvent.tab();
    expect(firstItem).toHaveFocus();
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '0' }));
    await userEvent.tab();
    expect(secondItem).toHaveFocus();
    expect(secondItem.closest('[inert]')).toBeNull();
    expect(secondItem.closest('[aria-hidden="true"]')).toBeNull();
    await userEvent.hover(secondItem);
    expect(secondItem).toHaveFocus();
    expect(trigger).toHaveStyle({ opacity: '0' });
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '1' }));
  },
};

export const ControlledCountWhileFocused: Story = {
  render: () => <OverflowingListControlledFocusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Toggle count' });

    await userEvent.tab();
    expect(toggle).toHaveFocus();
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '1' }));
    expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
  },
};

export const CountDisabledWhilePopupOpen: Story = {
  render: () => <OverflowingListControlledFocusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const toggle = canvas.getByRole('button', { name: 'Toggle count' });

    await userEvent.click(toggle);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Toggle count' }),
    );
    await waitFor(() => expect(dialog).toBeVisible());
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    for (const label of ['Toggle count', 'Second item', 'Third item']) {
      expect(within(dialog).getByText(label)).toBeVisible();
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
  },
};

export const FocusedTriggerRemoval: Story = {
  args: { showOverflowCount: undefined },
  parameters: { container: { width: 460, height: 280 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByText('Customer'));
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    const list = trigger.parentElement;

    if (!isDefined(list)) {
      throw new Error('The overflow trigger must be inside its list');
    }

    await userEvent.unhover(list);
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '1' }));

    list.style.width = '800px';
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: /Show all items$/ }),
      ).not.toBeInTheDocument(),
    );

    list.style.width = '180px';
    await userEvent.hover(list);
    const restoredTrigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(list).toHaveFocus());
    await waitFor(() => expect(restoredTrigger).toHaveStyle({ opacity: '1' }));
  },
};

export const NativeCompositionAndPropagation: Story = {
  args: { maxInlineCount: 1 },
  render: (args) => (
    <div
      role="group"
      aria-label="Clickable field"
      onClick={onHostClick}
      onMouseDown={onHostMouseDown}
      onKeyDown={onHostKeyDown}
    >
      <OverflowingList
        {...args}
        ref={rootRef}
        title="Native list root"
        onClick={onRootClick}
        triggerProps={{
          ref: triggerRef,
          render: <Button title="Composed trigger" />,
          children: 'More items',
          onClick: onTriggerClick,
        }}
        popupProps={{
          ref: popupRef,
          render: (
            <section
              ref={popupRenderRef}
              role="dialog"
              title="Composed popup"
              onClick={onPopupRenderClick}
              onKeyDown={onPopupRenderKeyDown}
            >
              <Button>Caller popup content</Button>
            </section>
          ),
          onClick: onPopupClick,
        }}
      >
        {['First item', 'Second item', 'Third item'].map((label) => (
          <Button key={label} onClick={onItemClick} style={{ width: 100 }}>
            {label}
          </Button>
        ))}
      </OverflowingList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    expect(rootRef.current).toHaveAttribute('title', 'Native list root');
    expect(triggerRef.current).toBe(trigger);
    expect(trigger).toHaveAttribute('title', 'Composed trigger');
    expect(trigger).toHaveTextContent('More items');
    await userEvent.click(canvas.getByRole('button', { name: 'First item' }));
    await userEvent.keyboard('a');
    expect(onPopupRenderKeyDown).not.toHaveBeenCalled();
    expect(onPopupClick).not.toHaveBeenCalled();
    expect(onPopupRenderClick).not.toHaveBeenCalled();
    onItemClick.mockClear();
    onHostMouseDown.mockClear();
    onHostKeyDown.mockClear();
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });
    expect(popupRef.current).toBe(dialog);
    expect(popupRenderRef.current).toBe(dialog);
    expect(dialog.tagName).toBe('SECTION');
    expect(dialog).toHaveAttribute('title', 'Composed popup');
    expect(
      within(dialog).queryByRole('button', { name: 'Caller popup content' }),
    ).not.toBeInTheDocument();
    const thirdItem = within(dialog).getByRole('button', {
      name: 'Third item',
    });
    await userEvent.click(thirdItem);
    expect(onItemClick).toHaveBeenCalledOnce();
    expect(onTriggerClick).toHaveBeenCalledWith(
      expect.objectContaining({ target: trigger }),
    );
    expect(onPopupClick).toHaveBeenCalledWith(
      expect.objectContaining({ target: thirdItem }),
    );
    expect(onPopupRenderClick).toHaveBeenCalledWith(
      expect.objectContaining({ target: thirdItem }),
    );
    expect(onRootClick).toHaveBeenCalledWith(
      expect.objectContaining({ target: thirdItem }),
    );
    expect(onHostClick).toHaveBeenCalledWith(
      expect.objectContaining({ target: thirdItem }),
    );
    await userEvent.keyboard('{Escape}');
    expect(onPopupRenderKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'Escape', target: thirdItem }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await body.findByRole('dialog', { name: 'Show all items' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    expect(onHostClick).toHaveBeenCalled();
    expect(onHostMouseDown).not.toHaveBeenCalled();
    expect(onHostKeyDown).not.toHaveBeenCalled();
  },
};

export const DefaultEventBlockingAndOverrides: Story = {
  render: () => (
    <OverflowingListEventBlockingExample
      onHostEvent={onEventHost}
      onOverrideEvent={onEventOverride}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const document = canvasElement.ownerDocument;
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    const dialog = await within(document.body).findByRole('dialog', {
      name: 'Show all items',
    });
    const onDocumentMouseDown = fn();
    const eventNames = [
      'click',
      'mouseDown',
      'pointerDown',
      'keyDown',
      'keyUp',
    ] as const;

    await waitFor(() => expect(dialog).toBeVisible());
    document.addEventListener('mousedown', onDocumentMouseDown);

    try {
      for (const overrideEvent of [undefined, ...eventNames]) {
        await userEvent.click(
          canvas.getByRole('button', {
            name: isDefined(overrideEvent)
              ? `Allow ${overrideEvent}`
              : 'Default blocking',
          }),
        );

        for (const target of [trigger, dialog]) {
          for (const eventName of eventNames) {
            await step(
              `${target === trigger ? 'Trigger' : 'Popup'} ${eventName} with ${overrideEvent ?? 'default'} blocking`,
              async () => {
                onEventHost.mockClear();
                onEventOverride.mockClear();
                onDocumentMouseDown.mockClear();
                await fireEvent[eventName](target, { key: 'a' });

                if (eventName === overrideEvent) {
                  expect(onEventOverride).toHaveBeenCalledWith(
                    expect.objectContaining({ target }),
                  );
                  expect(onEventHost).toHaveBeenCalledWith(
                    expect.objectContaining({ target }),
                  );

                  if (eventName === 'mouseDown') {
                    expect(onDocumentMouseDown).toHaveBeenCalledWith(
                      expect.objectContaining({ target }),
                    );
                  }

                  return;
                }

                expect(onEventOverride).not.toHaveBeenCalled();
                expect(onEventHost).not.toHaveBeenCalled();
                expect(onDocumentMouseDown).not.toHaveBeenCalled();
              },
            );
          }
        }
      }
    } finally {
      document.removeEventListener('mousedown', onDocumentMouseDown);
    }
  },
};

export const IndependentInstances: Story = {
  render: (args) => (
    <>
      <OverflowingList {...args} overflowLabel="Show company tags" />
      <OverflowingList {...args} overflowLabel="Show person tags" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const companyTrigger = await canvas.findByRole('button', {
      name: /Show company tags$/,
    });
    const personTrigger = await canvas.findByRole('button', {
      name: /Show person tags$/,
    });

    await userEvent.click(companyTrigger);
    const companyDialog = await body.findByRole('dialog', {
      name: 'Show company tags',
    });
    await waitFor(() => expect(companyDialog).toHaveFocus());
    expect(personTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(personTrigger);
    const personDialog = await body.findByRole('dialog', {
      name: 'Show person tags',
    });
    await waitFor(() => expect(personDialog).toHaveFocus());
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Show company tags' }),
      ).not.toBeInTheDocument(),
    );
    expect(personTrigger).toHaveAttribute('aria-controls', personDialog.id);
    expect(companyTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(personTrigger).toHaveFocus());
  },
};

export const ScopedThemeAndDirection: Story = {
  parameters: { argos: { fitToContent: { zoom: 1 } } },
  render: (args) => (
    <section aria-label="Scoped company tags">
      <ThemeProvider
        colorScheme="dark"
        applyToRoot={false}
        overrides={{ '--t-background-primary': 'rgb(20, 30, 40)' }}
      >
        <Card.Root
          backgroundColor="var(--t-background-primary)"
          style={{ width: 360, height: 220, padding: 16 }}
        >
          <DirectionProvider direction="rtl">
            <OverflowingList {...args} dir="rtl" />
          </DirectionProvider>
        </Card.Root>
      </ThemeProvider>
    </section>
  ),
  play: async ({ canvasElement }) => {
    const scope = within(canvasElement).getByRole('region', {
      name: 'Scoped company tags',
    });
    await userEvent.click(
      await within(scope).findByRole('button', { name: /Show all items$/ }),
    );
    const dialog = await within(scope).findByRole('dialog', {
      name: 'Show all items',
    });

    await waitFor(() => expect(dialog).toBeVisible());
    await expectOverflowingListPopupGeometry({
      trigger: within(scope).getByRole('button', {
        name: /Show all items$/,
      }),
      dialog,
    });
    expect(getComputedStyle(dialog).direction).toBe('rtl');
    expect(
      getComputedStyle(dialog)
        .getPropertyValue('--t-background-primary')
        .trim(),
    ).toBe('rgb(20, 30, 40)');
  },
};

export const OversizedSingleItem: Story = {
  args: {
    children: [
      <Tag key="long-label" color="blue" style={{ width: 400 }}>
        A single tag with a label that is wider than its field
      </Tag>,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.getByText(
        'A single tag with a label that is wider than its field',
      ),
    ).toBeVisible();
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
  },
};

export const ZoomedInstances: Story = {
  render: (args) => (
    <>
      {[0.75, 1.25].map((zoom) => (
        <div key={zoom} style={{ zoom }}>
          <OverflowingList
            {...args}
            overflowLabel={`Show tags at ${zoom} scale`}
          />
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    for (const zoom of [0.75, 1.25]) {
      await waitFor(() =>
        expect(
          canvas.getByRole('button', { name: `+2 Show tags at ${zoom} scale` }),
        ).toHaveTextContent('+2'),
      );
      const trigger = canvas.getByRole('button', {
        name: `+2 Show tags at ${zoom} scale`,
      });
      await userEvent.click(trigger);
      const dialog = await body.findByRole('dialog', {
        name: `Show tags at ${zoom} scale`,
      });
      await waitFor(() => expect(dialog).toBeVisible());
      await expectOverflowingListPopupGeometry({ trigger, dialog });
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
      );
    }
  },
};

export const DescendantContentUpdates: Story = {
  args: {
    style: { width: 200 },
    children: [
      <OverflowingListMutableTag key="customer" />,
      <Tag key="partner" color="green" truncate={false}>
        Partner
      </Tag>,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tag = canvas.getByRole('button', { name: 'Toggle tag label' });

    await userEvent.hover(tag);
    await userEvent.tab();
    expect(tag).toHaveFocus();
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(tag);
    expect(
      await canvas.findByRole('button', { name: /Show all items$/ }),
    ).toHaveTextContent('+1');
    await userEvent.click(tag);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: /Show all items$/ }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const StatefulRowAndPopupAcrossResize: Story = {
  render: () => <OverflowingListStateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const list = canvas.getByLabelText('Stateful values');
    const firstInlineValue = canvas.getByRole('textbox', {
      name: 'First value',
    });

    await userEvent.type(firstInlineValue, 'Inline value');
    await userEvent.click(
      await canvas.findByRole('button', { name: '+1 Show all items' }),
    );
    const dialog = await body.findByRole('dialog');
    const firstPopupValue = within(dialog).getByRole('textbox', {
      name: 'First value',
    });
    const secondPopupValue = within(dialog).getByRole('textbox', {
      name: 'Second value',
    });

    expect(canvas.getByRole('textbox', { name: 'First value' })).toBe(
      firstInlineValue,
    );
    expect(firstInlineValue).toHaveValue('Inline value');
    expect(firstInlineValue).toBeVisible();
    expect(firstPopupValue).not.toBe(firstInlineValue);
    expect(firstPopupValue).toHaveValue('');
    await userEvent.type(secondPopupValue, 'Popup value');
    const identifiers = [
      ...list.querySelectorAll('[id]'),
      ...dialog.querySelectorAll('[id]'),
    ].map((element) => element.id);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    list.style.width = '280px';
    const secondInlineValue = await canvas.findByRole('textbox', {
      name: 'Second value',
    });

    expect(secondInlineValue).not.toBe(secondPopupValue);
    expect(secondInlineValue).toHaveValue('');
    expect(secondPopupValue).toHaveValue('Popup value');
    expect(secondPopupValue).toHaveFocus();
    expect(firstInlineValue).toHaveValue('Inline value');
    list.style.width = '100px';
    await waitFor(() =>
      expect(
        canvas.queryByRole('textbox', { name: 'Second value' }),
      ).not.toBeInTheDocument(),
    );
    expect(secondPopupValue).toHaveFocus();
    expect(secondPopupValue).toHaveValue('Popup value');
    list.style.width = '800px';
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(firstInlineValue).toHaveValue('Inline value');
    expect(canvas.getByRole('textbox', { name: 'Second value' })).toBe(
      secondInlineValue,
    );
    expect(secondInlineValue).toHaveValue('');
    expect(
      canvas.queryByRole('button', { name: /Show all items/ }),
    ).not.toBeInTheDocument();
  },
};

export const FocusedItemRemoval: Story = {
  render: () => <OverflowingListFocusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      await canvas.findByRole('button', { name: '+2 Show all items' }),
    );
    const dialog = await body.findByRole('dialog');
    const secondItem = within(dialog).getByRole('button', {
      name: 'Second item',
    });

    await userEvent.click(secondItem);
    expect(
      body.queryByRole('button', { name: 'Second item', hidden: true }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'Third item' }),
      ).toHaveFocus(),
    );
    expect(
      canvas.getByRole('button', { name: '+1 Show all items' }),
    ).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(canvas.getByRole('button', { name: 'First item' })).toHaveFocus();
  },
};

export const ControlledKeyboardAndComposedTrigger: Story = {
  render: () => <OverflowingListControlledExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all company tags$/,
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog', {
      name: 'Show all company tags',
    });
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const FocusedInlineItemBecomesOverflow: Story = {
  args: {
    'aria-label': 'Responsive focused items',
    style: { width: 250 },
    children: ['First item', 'Second item', 'Third item'].map((label) => (
      <Button key={label} style={{ width: 100 }}>
        {label}
      </Button>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByLabelText('Responsive focused items');
    const firstItem = canvas.getByRole('button', { name: 'First item' });
    const secondItem = canvas.getByRole('button', { name: 'Second item' });

    await userEvent.tab();
    expect(firstItem).toHaveFocus();
    await userEvent.tab();
    expect(secondItem).toHaveFocus();
    list.style.width = '100px';
    await waitFor(() => expect(firstItem).toHaveFocus());
    expect(secondItem.closest('[inert]')).not.toBeNull();
    expect(
      canvas.getByRole('button', { name: '+2 Show all items' }),
    ).toBeVisible();
  },
};

export const ControlledRequests: Story = {
  render: () => <OverflowingListControlledStateExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: '+2 Show all items',
    });
    const apply = canvas.getByRole('button', { name: 'Apply requested state' });

    await userEvent.click(trigger);
    expect(canvas.getByRole('status')).toHaveTextContent('Open requested');
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(apply);
    const dialog = await body.findByRole('dialog');
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.keyboard('{Escape}');
    expect(canvas.getByRole('status')).toHaveTextContent('Close requested');
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(apply);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(apply).toHaveFocus());
  },
};

export const CancelableDefaultOpen: Story = {
  args: {
    defaultOpen: true,
    maxInlineCount: 1,
    onOpenChange: onCancelableOpenChange,
  },
  render: (args) => (
    <>
      <OverflowingList {...args} />
      <Button>Outside the list</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog');
    const trigger = canvas.getByRole('button', {
      name: '+3 Show all items',
    });

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls', dialog.id);
    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    expect(onCancelableOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key', isCanceled: true }),
    );
    await waitFor(() => expect(dialog).toBeVisible());
    await userEvent.click(
      canvas.getByRole('button', { name: 'Outside the list' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    const reopenedDialog = await body.findByRole('dialog');
    await waitFor(() => expect(reopenedDialog).toBeVisible());
  },
};

export const CanceledOpening: Story = {
  args: { onOpenChange: onCanceledOpenChange },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    await userEvent.click(trigger);
    expect(onCanceledOpenChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        reason: 'trigger-press',
        trigger,
        event: expect.objectContaining({ type: 'click' }),
        isCanceled: true,
      }),
    );
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const DisabledTrigger: Story = {
  args: { triggerProps: { disabled: true }, onOpenChange },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const CallerPreventsOpening: Story = {
  args: {
    triggerProps: { onClick: (event) => event.preventBaseUIHandler() },
    onOpenChange,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: /Show all items$/ }),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).not.toBeInTheDocument();
  },
};

export const PopupTabNavigation: Story = {
  args: {
    maxInlineCount: 1,
    children: ['First item', 'Second item', 'Third item'].map((label) => (
      <Button key={label}>{label}</Button>
    )),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: '+2 Show all items',
    });

    await userEvent.tab();
    expect(canvas.getByRole('button', { name: 'First item' })).toHaveFocus();
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const dialog = await body.findByRole('dialog');
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'First item' }),
      ).toHaveFocus(),
    );
    await userEvent.tab();
    expect(
      within(dialog).getByRole('button', { name: 'Second item' }),
    ).toHaveFocus();
    await userEvent.tab();
    expect(
      within(dialog).getByRole('button', { name: 'Third item' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const TriggerRefRerenderPreservesFocus: Story = {
  render: () => <OverflowingListTriggerRefExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('r');
    expect(canvas.getByRole('status')).toHaveTextContent('Renders: 1');
    expect(trigger).toHaveFocus();
    expect(canvas.getByRole('button', { name: /Show all items$/ })).toBe(
      trigger,
    );
  },
};

export const IndependentInstanceCleanup: Story = {
  render: () => <OverflowingListInstanceCleanupExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: '+2 Company items' }),
    );
    const companyDialog = await body.findByRole('dialog', {
      name: 'Company items',
    });
    await userEvent.click(
      within(companyDialog).getByRole('button', {
        name: 'Remove company list',
      }),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Company items' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      canvas.queryByRole('button', { name: /Company items$/ }),
    ).not.toBeInTheDocument();
    const personTrigger = canvas.getByRole('button', {
      name: '+3 Person items',
    });
    await userEvent.click(personTrigger);
    const personDialog = await body.findByRole('dialog', {
      name: 'Person items',
    });
    await waitFor(() => expect(personDialog).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(personTrigger).toHaveFocus());
  },
};

export const DisabledTriggerFocusFallback: Story = {
  render: () => <OverflowingListDisabledTriggerFocusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByLabelText('Items with disabled trigger');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove focused item' }),
    );
    await waitFor(() => expect(list).toHaveFocus());
    expect(
      canvas.getByRole('button', { name: '+1 Show all items' }),
    ).toBeDisabled();
    expect(canvas.getByText('Customer')).toBeVisible();
  },
};

export const DisabledTriggerDismissal: Story = {
  args: {
    'aria-label': 'List with disabled trigger',
    defaultOpen: true,
    onOpenChange,
    triggerProps: { disabled: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const list = canvas.getByLabelText('List with disabled trigger');
    const dialog = await body.findByRole('dialog');

    await waitFor(() => expect(dialog).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(list).toHaveFocus());
    expect(
      canvas.getByRole('button', { name: /Show all items$/ }),
    ).toBeDisabled();
  },
};

export const DefaultOpenMeasuredOverflow: Story = {
  args: { defaultOpen: true, onOpenChange },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: '+2 Show all items',
    });
    const dialog = await body.findByRole('dialog');

    await waitFor(() => expect(dialog).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() =>
      expect(within(dialog).getByText('Partner')).toBeVisible(),
    );
    expect(within(dialog).getByText('Customer')).toBeVisible();
    expect(canvas.getByText('Customer')).toBeVisible();
  },
};

export const CanceledUnavailableClose: Story = {
  parameters: { container: { width: 600, height: 360 } },
  render: () => (
    <StrictMode>
      <OverflowingListCanceledCloseExample />
    </StrictMode>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const list = canvas.getByLabelText('Cancelable responsive tags');
    const status = canvas.getByRole('status');
    const resizeList = async (width: string) => {
      list.style.width = width;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    };

    await waitFor(() =>
      expect(status).toHaveTextContent('Open: true. Close requests: 1.'),
    );
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    for (const width of ['420px', '500px']) {
      await resizeList(width);
      expect(status).toHaveTextContent('Open: true. Close requests: 1.');
      expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    }

    await userEvent.click(
      canvas.getByRole('button', { name: 'Close requested state' }),
    );
    expect(status).toHaveTextContent('Open: false. Close requests: 1.');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open requested state' }),
    );
    await waitFor(() =>
      expect(status).toHaveTextContent('Open: true. Close requests: 2.'),
    );
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();

    await resizeList('180px');
    const dialog = await body.findByRole('dialog', { name: 'Show all items' });
    for (const label of ['Customer', 'Partner', 'Priority', 'Renewal']) {
      await waitFor(() =>
        expect(within(dialog).getByText(label)).toBeVisible(),
      );
    }
    expect(canvas.getByText('Customer')).toBeVisible();
    expect(status).toHaveTextContent('Open: true. Close requests: 2.');

    await resizeList('500px');
    await waitFor(() =>
      expect(status).toHaveTextContent('Open: true. Close requests: 3.'),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const DeferredCloseActions: Story = {
  parameters: { container: { width: 600, height: 360 } },
  args: { onOpenChange },
  render: (args) => (
    <OverflowingListActionsExample
      deferClose
      onOpenChange={args.onOpenChange}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    const finishExit = canvas.getByRole('button', { name: 'Finish exit' });

    for (const closeAction of ['escape-key', 'imperative-action']) {
      await userEvent.click(trigger);
      const dialog = await body.findByRole('dialog', {
        name: 'Show all items',
      });
      await waitFor(() =>
        expect(
          within(dialog).getByRole('button', { name: 'First item' }),
        ).toHaveFocus(),
      );

      if (closeAction === 'escape-key') {
        await userEvent.keyboard('{Escape}');
      }

      if (closeAction === 'imperative-action') {
        await userEvent.click(
          within(dialog).getByRole('button', { name: 'Close with actions' }),
        );
      }

      await waitFor(() => expect(dialog).not.toBeVisible());
      expect(dialog).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(onOpenChange).toHaveBeenLastCalledWith(
        false,
        expect.objectContaining({ reason: closeAction }),
      );
      await userEvent.click(finishExit);
      await waitFor(() => expect(dialog).not.toBeInTheDocument());
      await waitFor(() => expect(trigger).toHaveFocus());
    }
  },
};

export const PublicActionsResponsiveClose: Story = {
  parameters: { container: { width: 600, height: 360 } },
  args: { onOpenChange },
  render: (args) => (
    <OverflowingListActionsExample onOpenChange={args.onOpenChange} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const list = canvas.getByRole('group', {
      name: 'Items with public actions',
    });
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', { name: 'Show all items' });
    await waitFor(() =>
      expect(
        within(dialog).getByRole('button', { name: 'First item' }),
      ).toHaveFocus(),
    );
    list.style.width = '500px';
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'imperative-action' }),
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Third item' })).toHaveFocus(),
    );
    expect(
      canvas.queryByRole('button', { name: /Show all items$/ }),
    ).not.toBeInTheDocument();
  },
};
