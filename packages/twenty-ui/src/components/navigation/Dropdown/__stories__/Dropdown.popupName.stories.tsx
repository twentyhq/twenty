import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconDotsVertical } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { type DropdownType } from '../types/DropdownType';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const triggerlessMenuLabel = createStoryState<string | undefined>(undefined);
const sortPickerTitleVisibility = createStoryState(true);

const ChoosePersonDropdown = ({ type }: { type: DropdownType }) => (
  <Dropdown.Root type={type}>
    <Dropdown.Trigger render={<Button>Choose person</Button>} />
    <Dropdown.Content>
      <Dropdown.ActionItem>Invite person</Dropdown.ActionItem>
    </Dropdown.Content>
  </Dropdown.Root>
);

const playChoosePersonDropdown = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Choose person' }),
  );

  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog', {
        name: 'Choose person',
      }),
    ).toBeVisible(),
  );
};

const TriggerlessMenu = () => (
  <Dropdown.Root type="menu" open>
    <Dropdown.Content aria-label={triggerlessMenuLabel.useValue()}>
      <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
    </Dropdown.Content>
  </Dropdown.Root>
);

const SortPicker = () => (
  <Dropdown.Root type="picker">
    <Dropdown.Trigger>Sort</Dropdown.Trigger>
    <Dropdown.Content>
      {sortPickerTitleVisibility.useValue() && (
        <Dropdown.Header>
          <Dropdown.Title>Sort records by</Dropdown.Title>
        </Dropdown.Header>
      )}
      <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
    </Dropdown.Content>
  </Dropdown.Root>
);

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Popup Name',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    triggerlessMenuLabel.set(undefined);
    sortPickerTitleVisibility.set(true);
  },
};

export default meta;
type Story = StoryObj;

export const IconTrigger: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger
        render={
          <LightIconButton aria-label="More options">
            <IconDotsVertical />
          </LightIconButton>
        }
      />
      <Dropdown.Content>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'More options' }),
    );

    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'More options' })).toBeVisible(),
    );
    expect(body.getAllByLabelText('More options')).toHaveLength(1);
  },
};

export const PickerTrigger: Story = {
  render: () => <ChoosePersonDropdown type="picker" />,
  play: playChoosePersonDropdown,
};

export const PanelTrigger: Story = {
  render: () => <ChoosePersonDropdown type="panel" />,
  play: playChoosePersonDropdown,
};

export const SubmenuTrigger: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
          <Dropdown.Content>
            <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}');

    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Export' })).toBeVisible(),
    );
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('menu', { name: 'Export' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const WithoutTrigger: Story = {
  render: () => <TriggerlessMenu />,
  play: async ({ canvasElement }) => {
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    );

    expect(menu).not.toHaveAttribute('aria-labelledby');
    expect(menu).toHaveAccessibleName('');

    triggerlessMenuLabel.set('Record actions');

    await waitFor(() => expect(menu).toHaveAccessibleName('Record actions'));
  },
};

export const ExplicitLabel: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Currency</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose a currency">
        <Dropdown.OptionItem selected>Euro</Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Currency' }),
    );

    await waitFor(() =>
      expect(
        within(canvasElement.ownerDocument.body).getByRole('dialog', {
          name: 'Choose a currency',
        }),
      ).toBeVisible(),
    );
  },
};

export const TitleThenTrigger: Story = {
  render: () => <SortPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Sort' }),
    );

    await waitFor(() =>
      expect(
        body.getByRole('dialog', { name: 'Sort records by' }),
      ).toBeVisible(),
    );

    sortPickerTitleVisibility.set(false);

    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Sort' })).toBeVisible(),
    );
  },
};
