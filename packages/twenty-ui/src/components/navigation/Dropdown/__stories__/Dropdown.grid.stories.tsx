import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconCalendar } from '@ui/icon';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DropdownIconGridExample } from './DropdownIconGridExample';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onSelect = fn();

const meta: Meta = {
  id: 'ui-components-dropdown-interactions-grid',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Grid',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => onSelect.mockClear(),
};

export default meta;
type Story = StoryObj;

export const IconGrid: Story = {
  tags: ['!dev'],
  render: () => <DropdownIconGridExample onSelect={onSelect} />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Choose icon',
    });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Choose icon' });
    const search = within(popup).getByRole('searchbox');
    const group = within(popup).getByRole('group', { name: 'Icons' });
    const first = within(popup).getByRole('option', { name: 'Calendar 1' });
    const second = within(popup).getByRole('option', { name: 'Calendar 2' });
    const getBackgroundColor = (element: HTMLElement) =>
      element.ownerDocument.defaultView?.getComputedStyle(element)
        .backgroundColor;

    await waitFor(() => expect(search).toHaveFocus());
    expect(group).toHaveStyle({ display: 'grid' });
    const selectedBackgroundColor = getBackgroundColor(first);
    const idleBackgroundColor = getBackgroundColor(second);

    expect(selectedBackgroundColor).toBeDefined();
    expect(selectedBackgroundColor).not.toBe(idleBackgroundColor);
    await trustedUserEvent.hover(second);
    await waitFor(() =>
      expect(getBackgroundColor(second)).not.toBe(idleBackgroundColor),
    );
    expect(getBackgroundColor(second)).not.toBe(selectedBackgroundColor);
    expect(getBackgroundColor(first)).toBe(selectedBackgroundColor);
    expect(onSelect).not.toHaveBeenCalled();
    await trustedUserEvent.unhover(second);
    expect(
      within(popup).getByRole('option', { name: 'Calendar 1' }),
    ).toHaveAttribute('data-color', 'accent');
    expect(
      within(popup).getByRole('option', { name: 'Calendar 2' }),
    ).toHaveAttribute('data-color', 'neutral');
    await expect(
      within(popup).getByRole('option', { name: 'Calendar 5' }),
    ).toBeDisabled();
    await waitFor(() =>
      expect(
        within(popup)
          .getByRole('option', { name: 'Calendar 1' })
          .querySelector('svg'),
      ).toBeVisible(),
    );
    expect(
      within(popup)
        .getByRole('option', { name: 'Calendar 4' })
        .getBoundingClientRect().top,
    ).toBeGreaterThan(
      within(popup)
        .getByRole('option', { name: 'Calendar 1' })
        .getBoundingClientRect().top,
    );
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    expect(second).toHaveFocus();
    expect(getBackgroundColor(second)).not.toBe(selectedBackgroundColor);
    expect(getBackgroundColor(first)).toBe(selectedBackgroundColor);
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('aria-selected', 'false');
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}');
    expect(
      within(popup).getByRole('option', { name: 'Calendar 8' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(
      within(popup).getByRole('option', { name: 'Calendar 2' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(search).toHaveFocus();
    await userEvent.type(search, 'Calendar');
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(0);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const IconGridRtl: Story = {
  render: () => (
    <DirectionProvider direction="rtl">
      <DropdownIconGridExample onSelect={onSelect} />
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose icon' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Choose icon' });
    const search = within(popup).getByRole('searchbox');
    const first = within(popup).getByRole('option', { name: 'Calendar 1' });
    const second = within(popup).getByRole('option', { name: 'Calendar 2' });
    const eighth = within(popup).getByRole('option', { name: 'Calendar 8' });

    await waitFor(() => expect(search).toHaveFocus());
    expect(
      popup.ownerDocument.defaultView?.getComputedStyle(popup).direction,
    ).toBe('rtl');
    await userEvent.keyboard('{ArrowDown}{ArrowLeft}');
    expect(second).toHaveFocus();
    expect(first).toHaveAttribute('aria-selected', 'true');
    expect(second).toHaveAttribute('data-color', 'neutral');
    await userEvent.keyboard('{ArrowDown}');
    expect(eighth).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowUp}');
    expect(second).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(1);
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose icon' }),
    );
    const reopened = await body.findByRole('dialog', { name: 'Choose icon' });

    expect(
      within(reopened).getByRole('option', { name: 'Calendar 2' }),
    ).toHaveAttribute('data-color', 'accent');
    expect(
      within(reopened).getByRole('option', { name: 'Calendar 1' }),
    ).toHaveAttribute('data-color', 'neutral');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
  },
};

export const SubmenuGrid: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Insert</Dropdown.Trigger>
      <Dropdown.Content aria-label="Insert">
        <Dropdown.Submenu type="picker">
          <Dropdown.SubmenuTrigger>Icons</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Choose icon">
            <Dropdown.SelectionGroup id="icons" aria-label="Icon choices">
              <Dropdown.Section columns={3} aria-label="Icons">
                {Array.from({ length: 3 }, (_, index) => (
                  <Dropdown.OptionItem
                    key={index}
                    value={`calendar-${index + 1}`}
                    indicator="none"
                    nativeButton
                    aria-label={`Calendar ${index + 1}`}
                    render={
                      <LightIconButton
                        size="md"
                        aria-label={`Calendar ${index + 1}`}
                      >
                        <IconCalendar />
                      </LightIconButton>
                    }
                    onSelect={() => onSelect(index)}
                  />
                ))}
              </Dropdown.Section>
            </Dropdown.SelectionGroup>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const submenuTrigger = await body.findByRole('menuitem', {
      name: 'Icons',
    });

    await waitFor(() => expect(submenuTrigger).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    const submenu = await body.findByRole('dialog', { name: 'Choose icon' });
    const firstIcon = within(submenu).getByRole('option', {
      name: 'Calendar 1',
    });

    await waitFor(() => expect(submenu).toBeVisible());
    await waitFor(() => expect(firstIcon).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}');
    expect(
      within(submenu).getByRole('option', { name: 'Calendar 2' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(firstIcon).toHaveFocus();
    expect(submenu).toBeVisible();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(submenuTrigger).toHaveFocus());
    expect(onSelect).not.toHaveBeenCalled();
  },
};

export const PanelSubmenuGrid: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Insert</Dropdown.Trigger>
      <Dropdown.Content aria-label="Insert">
        <Dropdown.Submenu type="panel">
          <Dropdown.SubmenuTrigger>Icons</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Icon shortcuts">
            <Dropdown.SelectionGroup id="icons" aria-label="Icon choices">
              <Dropdown.Section columns={3} aria-label="Icons">
                {Array.from({ length: 3 }, (_, index) => (
                  <Dropdown.OptionItem
                    key={index}
                    value={`calendar-${index + 1}`}
                    indicator="none"
                    nativeButton
                    aria-label={`Calendar ${index + 1}`}
                    render={
                      <LightIconButton
                        size="md"
                        aria-label={`Calendar ${index + 1}`}
                      >
                        <IconCalendar />
                      </LightIconButton>
                    }
                    onSelect={() => onSelect(index)}
                  />
                ))}
              </Dropdown.Section>
            </Dropdown.SelectionGroup>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const submenuTrigger = await body.findByRole('menuitem', {
      name: 'Icons',
    });

    await waitFor(() => expect(submenuTrigger).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    const submenu = await body.findByRole('dialog', {
      name: 'Icon shortcuts',
    });

    await waitFor(() => expect(submenu).toBeVisible());
    await waitFor(() =>
      expect(
        within(submenu).getByRole('button', { name: 'Calendar 1' }),
      ).toHaveFocus(),
    );
    await userEvent.tab();
    expect(
      within(submenu).getByRole('button', { name: 'Calendar 2' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(submenuTrigger).toHaveFocus());
    expect(onSelect).not.toHaveBeenCalled();
  },
};
