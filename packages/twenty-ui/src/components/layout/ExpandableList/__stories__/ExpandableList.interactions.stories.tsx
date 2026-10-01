import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Tag } from '@ui/primitives/data-display/Tag/Tag';
import { Button } from '@ui/primitives/input/Button/Button';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { ThemeProvider } from '@ui/theme/ThemeProvider';

import { ExpandableList } from '../ExpandableList';
import { EXPANDABLE_LIST_STORY_ITEMS } from './EXPANDABLE_LIST_STORY_ITEMS';
import { ExpandableListMutableTag } from './ExpandableListMutableTag';
import { ExpandableListResizeExample } from './ExpandableListResizeExample';
import { expectExpandableListPopupGeometry } from './expectExpandableListPopupGeometry';

const onHostClick = fn();
const onHostMouseDown = fn();
const onHostKeyDown = fn();
const onItemClick = fn();

const meta: Meta<typeof ExpandableList> = {
  title: 'UI/Components/ExpandableList/Interactions',
  component: ExpandableList,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 400, height: 280 },
    a11y: A11Y_DEFER_COLOR_CONTRAST,
  },
  args: {
    children: EXPANDABLE_LIST_STORY_ITEMS,
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
type Story = StoryObj<typeof ExpandableList>;

export const Keyboard: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Show all items',
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
        await expectExpandableListPopupGeometry({ trigger, dialog });
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
      <ExpandableList {...args} />
      <Button>Outside the list</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Show all items',
    });

    expect(trigger).toHaveTextContent('+3');
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
  render: () => <ExpandableListResizeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      canvas.queryByRole('button', { name: 'Show all items' }),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Narrow list' }));
    expect(
      await canvas.findByRole('button', { name: 'Show all items' }),
    ).toHaveTextContent('+3');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show all items' }),
    );
    await body.findByRole('dialog', { name: 'Show all items' });
    const list = canvas.getByLabelText('Resizable tags');
    list.style.width = '360px';
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Show all items' }),
      ).not.toBeInTheDocument(),
    );

    list.style.width = '100px';
    await canvas.findByRole('button', { name: 'Show all items' });
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Widen list' }));

    await userEvent.click(
      canvas.getByRole('button', { name: 'Lengthen labels' }),
    );
    expect(
      await canvas.findByRole('button', { name: 'Show all items' }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Shorten labels' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Show all items' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const CountVisibility: Story = {
  args: { showOverflowCount: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole('button', {
      name: 'Show all items',
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
  args: { showOverflowCount: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.hover(canvas.getByText('Customer'));
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
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
      name: 'Show all items',
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
      <ExpandableList {...args}>
        {['First item', 'Second item', 'Third item'].map((label) => (
          <Button key={label} onClick={onItemClick} style={{ width: 100 }}>
            {label}
          </Button>
        ))}
      </ExpandableList>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', {
      name: 'Show all items',
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
      <ExpandableList {...args} overflowLabel="Show company tags" />
      <ExpandableList {...args} overflowLabel="Show person tags" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const companyTrigger = await canvas.findByRole('button', {
      name: 'Show company tags',
    });
    const personTrigger = await canvas.findByRole('button', {
      name: 'Show person tags',
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
            <ExpandableList {...args} dir="rtl" />
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
      await within(scope).findByRole('button', { name: 'Show all items' }),
    );
    const dialog = await within(scope).findByRole('dialog', {
      name: 'Show all items',
    });

    await waitFor(() => expect(dialog).toBeVisible());
    await expectExpandableListPopupGeometry({
      trigger: within(scope).getByRole('button', { name: 'Show all items' }),
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
      canvas.queryByRole('button', { name: 'Show all items' }),
    ).not.toBeInTheDocument();
  },
};

export const ZoomedInstances: Story = {
  render: (args) => (
    <>
      {[0.75, 1.25].map((zoom) => (
        <div key={zoom} style={{ zoom }}>
          <ExpandableList
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
          canvas.getByRole('button', { name: `Show tags at ${zoom} scale` }),
        ).toHaveTextContent('+3'),
      );
      const trigger = canvas.getByRole('button', {
        name: `Show tags at ${zoom} scale`,
      });
      await userEvent.click(trigger);
      const dialog = await body.findByRole('dialog', {
        name: `Show tags at ${zoom} scale`,
      });
      await waitFor(() => expect(dialog).toBeVisible());
      await expectExpandableListPopupGeometry({ trigger, dialog });
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
      <ExpandableListMutableTag key="customer" />,
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
      canvas.queryByRole('button', { name: 'Show all items' }),
    ).not.toBeInTheDocument();

    await userEvent.click(tag);
    expect(
      await canvas.findByRole('button', { name: 'Show all items' }),
    ).toHaveTextContent('+1');
    await userEvent.click(tag);
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Show all items' }),
      ).not.toBeInTheDocument(),
    );
  },
};
