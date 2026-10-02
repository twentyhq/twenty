import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { OverflowingList } from '../OverflowingList';
import { OVERFLOWING_LIST_STORY_ITEMS } from './OVERFLOWING_LIST_STORY_ITEMS';
import { OverflowingListControlledFocusExample } from './OverflowingListControlledFocusExample';
import { OverflowingListMutableTag } from './OverflowingListMutableTag';
import { OverflowingListResizeExample } from './OverflowingListResizeExample';
import { expectOverflowingListPopupGeometry } from './expectOverflowingListPopupGeometry';

const onHostClick = fn();
const onHostMouseDown = fn();
const onHostKeyDown = fn();
const onItemClick = fn();

const meta: Meta<typeof OverflowingList> = {
  title: 'UI/Components/OverflowingList/Interactions',
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
    onHostClick.mockClear();
    onHostMouseDown.mockClear();
    onHostKeyDown.mockClear();
    onItemClick.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof OverflowingList>;

export const Keyboard: Story = {
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
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(trigger).toHaveAttribute('aria-controls', dialog.id);
        expect(canvasElement).not.toContainElement(dialog);

        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
          expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
        );
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
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

    expect(trigger).toHaveTextContent('+3');
    expect(trigger).toHaveAccessibleName('+3 Show all items');
    expect(canvas.queryByText('Renewal')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });

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
    expect(
      await canvas.findByRole('button', { name: /Show all items$/ }),
    ).toHaveTextContent('+3');
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
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    const firstItem = canvas.getByText('Customer');

    await userEvent.unhover(firstItem);
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '0' }));
    await userEvent.hover(firstItem);
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
    const trigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });

    await userEvent.unhover(firstItem);
    await waitFor(() => expect(trigger).toHaveStyle({ opacity: '0' }));
    await userEvent.tab();
    expect(firstItem).toHaveFocus();
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

export const OpenPopupOutlivesHiddenCount: Story = {
  render: () => <OverflowingListControlledFocusExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Toggle count' }));
    await userEvent.click(
      await canvas.findByRole('button', { name: /Show all items$/ }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });
    const popupToggle = within(dialog).getByRole('button', {
      name: 'Toggle count',
    });

    await userEvent.click(popupToggle);
    await waitFor(() =>
      expect(popupToggle).toHaveAttribute('aria-pressed', 'false'),
    );
    expect(dialog).toBeVisible();

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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
    const restoredTrigger = await canvas.findByRole('button', {
      name: /Show all items$/,
    });
    await waitFor(() => expect(restoredTrigger).toHaveStyle({ opacity: '0' }));
  },
};

export const ClickableFieldHost: Story = {
  args: { maxInlineCount: 1 },
  render: (args) => (
    <div
      role="group"
      aria-label="Clickable field"
      onClick={onHostClick}
      onMouseDown={onHostMouseDown}
      onKeyDown={onHostKeyDown}
    >
      <OverflowingList {...args}>
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

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Show all items',
    });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Third item' }),
    );
    expect(onItemClick).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await body.findByRole('dialog', { name: 'Show all items' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    expect(onHostClick).not.toHaveBeenCalled();
    expect(onHostMouseDown).not.toHaveBeenCalled();
    expect(onHostKeyDown).not.toHaveBeenCalled();
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
    await body.findByRole('dialog', { name: 'Show company tags' });
    expect(personTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(personTrigger);
    const personDialog = await body.findByRole('dialog', {
      name: 'Show person tags',
    });
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
          <TextDirectionProvider direction="rtl">
            <OverflowingList {...args} dir="rtl" />
          </TextDirectionProvider>
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
      trigger: within(scope).getByRole('button', { name: /Show all items$/ }),
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
          canvas.getByRole('button', { name: `+3 Show tags at ${zoom} scale` }),
        ).toHaveTextContent('+3'),
      );
      const trigger = canvas.getByRole('button', {
        name: `+3 Show tags at ${zoom} scale`,
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
      <Tag key="partner" color="green" preventShrink>
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
