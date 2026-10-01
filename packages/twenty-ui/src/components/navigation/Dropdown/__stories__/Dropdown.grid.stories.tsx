import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconCalendar } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onSelect = fn();

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Grid',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => onSelect.mockClear(),
};

export default meta;
type Story = StoryObj;

export const IconGrid: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose icon</Dropdown.Trigger>
      <Dropdown.Content width={200}>
        <Dropdown.Search aria-label="Search icons" />
        <Dropdown.Section columns={3} label="Icons">
          {Array.from({ length: 8 }, (_, index) => (
            <Dropdown.OptionItem
              key={index}
              selected={index === 0}
              disabled={index === 4}
              indicator="none"
              nativeButton
              aria-label={`Calendar ${index + 1}`}
              render={
                <LightIconButton size="md" aria-label={`Calendar ${index + 1}`}>
                  <IconCalendar />
                </LightIconButton>
              }
              onSelect={() => onSelect(index)}
            />
          ))}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Choose icon',
    });

    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Choose icon' });
    const search = within(popup).getByRole('searchbox');
    const group = within(popup).getByRole('group', { name: 'Icons' });

    await waitFor(() => expect(search).toHaveFocus());
    expect(group).toHaveStyle({ display: 'grid' });
    await waitFor(() =>
      expect(
        within(popup)
          .getByRole('button', { name: 'Calendar 1' })
          .querySelector('svg'),
      ).toBeVisible(),
    );
    expect(
      within(popup)
        .getByRole('button', { name: 'Calendar 4' })
        .getBoundingClientRect().top,
    ).toBeGreaterThan(
      within(popup)
        .getByRole('button', { name: 'Calendar 1' })
        .getBoundingClientRect().top,
    );
    await userEvent.keyboard('{ArrowDown}{ArrowRight}{ArrowDown}');
    expect(
      within(popup).getByRole('button', { name: 'Calendar 8' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(
      within(popup).getByRole('button', { name: 'Calendar 2' }),
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

export const SubmenuGrid: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Insert</Dropdown.Trigger>
      <Dropdown.Content aria-label="Insert">
        <Dropdown.Submenu type="picker">
          <Dropdown.SubmenuTrigger>Icons</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Choose icon">
            <Dropdown.Section columns={3} aria-label="Icons">
              {Array.from({ length: 3 }, (_, index) => (
                <Dropdown.OptionItem
                  key={index}
                  selected={false}
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
    const firstIcon = within(submenu).getByRole('button', {
      name: 'Calendar 1',
    });

    await waitFor(() => expect(submenu).toBeVisible());
    await waitFor(() => expect(firstIcon).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}');
    expect(
      within(submenu).getByRole('button', { name: 'Calendar 2' }),
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
            <Dropdown.Section columns={3} aria-label="Icons">
              {Array.from({ length: 3 }, (_, index) => (
                <Dropdown.OptionItem
                  key={index}
                  selected={false}
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
