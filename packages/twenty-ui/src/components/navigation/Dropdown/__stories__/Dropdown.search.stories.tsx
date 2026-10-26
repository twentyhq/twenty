import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  expect,
  fireEvent,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';
import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';
import { type DropdownRootProps } from '../types/DropdownRootProps';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const PEOPLE = ['Ada Lovelace', 'Grace Hopper'];
const POPUP_OPEN_TIMEOUT = 5000;
const query = createStoryState('');
const people = createStoryState(PEOPLE);
const isAdaDisabled = createStoryState(false);
const isFirstGroupDisabled = createStoryState(false);
const onSelect = fn();
const onInvite = fn();
const onSearchBlur = fn();

const SearchActivationExample = ({
  filterResults = false,
  searchPlacement = 'top',
  onInteractOutside,
}: {
  filterResults?: boolean;
  searchPlacement?: 'top' | 'bottom';
} & Pick<DropdownRootProps, 'onInteractOutside'>) => {
  const search = query.useValue();
  const orderedPeople = people.useValue();
  const isAdaDisabledValue = isAdaDisabled.useValue();
  const isFirstGroupDisabledValue = isFirstGroupDisabled.useValue();
  const results = filterResults
    ? orderedPeople.filter((person) =>
        person.toLowerCase().includes(search.toLowerCase()),
      )
    : orderedPeople;

  const searchInput = (
    <Dropdown.Search
      aria-label="Search reviewers"
      value={search}
      onValueChange={query.set}
      onBlur={onSearchBlur}
    />
  );

  return (
    <Dropdown.Root type="picker" onInteractOutside={onInteractOutside}>
      <Dropdown.Trigger>Reviewers</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose reviewers">
        {searchPlacement === 'top' && searchInput}
        <Dropdown.ActionItem onClick={onInvite}>
          Invite reviewer
        </Dropdown.ActionItem>
        <Dropdown.SelectionGroup
          id="people"
          aria-label="People"
          defaultValue="Grace Hopper"
          closeOnSelect={false}
          onValueChange={onSelect}
        >
          {results.map((person) => (
            <Dropdown.OptionItem
              key={person}
              value={person}
              disabled={
                isFirstGroupDisabledValue ||
                (isAdaDisabledValue && person === 'Ada Lovelace')
              }
            >
              {person}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
        <Dropdown.SelectionGroup
          id="other-reviewers"
          aria-label="Other reviewers"
          closeOnSelect={false}
          onValueChange={onSelect}
        >
          <Dropdown.OptionItem value="Margaret Hamilton">
            Margaret Hamilton
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        {searchPlacement === 'bottom' && searchInput}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const openPicker = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Reviewers' }),
  );
  const popup = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    { name: 'Choose reviewers' },
  );

  await waitFor(() => expect(popup).toBeVisible(), {
    timeout: POPUP_OPEN_TIMEOUT,
  });
  const search = within(popup).getByRole('searchbox', {
    name: 'Search reviewers',
  });

  await waitFor(() => expect(search).toHaveFocus());

  return { popup, search };
};

const meta: Meta = {
  id: 'ui-components-dropdown-interactions-search',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Search',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    query.set('');
    people.set(PEOPLE);
    isAdaDisabled.set(false);
    isFirstGroupDisabled.set(false);
    onSelect.mockClear();
    onInvite.mockClear();
    onSearchBlur.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const PreviewFollowsSearchFocus: Story = {
  render: () => <SearchActivationExample />,
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);
    const picker = within(popup);
    const ada = picker.getByRole('option', { name: 'Ada Lovelace' });
    const grace = picker.getByRole('option', { name: 'Grace Hopper' });
    const invite = picker.getByRole('button', { name: 'Invite reviewer' });

    await userEvent.type(search, 'a');
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', ada.id),
    );
    await userEvent.keyboard('{ArrowDown}');

    expect(invite).toHaveFocus();
    expect(search).not.toHaveAttribute('aria-activedescendant');
    expect(ada).not.toHaveAttribute('data-highlighted');
    expect(onSelect).not.toHaveBeenCalled();

    people.set(['Grace Hopper', 'Ada Lovelace']);
    isAdaDisabled.set(true);
    await waitFor(() => expect(ada).toBeDisabled());
    expect(invite).toHaveFocus();
    expect(search).not.toHaveAttribute('aria-activedescendant');
    expect(grace).not.toHaveAttribute('data-highlighted');

    await userEvent.keyboard('{ArrowDown}');
    expect(grace).toHaveFocus();
    expect(search).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');

    expect(search).toHaveFocus();
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', grace.id),
    );
    expect(grace).toHaveAttribute('data-highlighted');
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};

export const PreviewClearsWhenFocusLeavesOpenPopup: Story = {
  render: () => (
    <>
      <SearchActivationExample
        onInteractOutside={(event) => event.preventDefault()}
      />
      <Button>Outside</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);
    const picker = within(popup);
    const ada = picker.getByRole('option', { name: 'Ada Lovelace' });
    const grace = picker.getByRole('option', { name: 'Grace Hopper' });
    const outside = within(canvasElement).getByRole('button', {
      name: 'Outside',
    });

    await userEvent.type(search, 'a');
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', ada.id),
    );
    await userEvent.click(outside);

    expect(outside).toHaveFocus();
    expect(popup).toBeVisible();
    expect(onSearchBlur).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(ada).not.toHaveAttribute('data-highlighted');

    people.set(['Grace Hopper', 'Ada Lovelace']);
    await waitFor(() => expect(picker.getAllByRole('option')[0]).toBe(grace));
    expect(search).not.toHaveAttribute('aria-activedescendant');
    expect(grace).not.toHaveAttribute('data-highlighted');

    await userEvent.click(search);
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', grace.id),
    );
    await userEvent.keyboard('{Escape}');
  },
};

export const EnterFindsEligibleResultAcrossGroups: Story = {
  render: () => <SearchActivationExample filterResults />,
  play: async ({ canvasElement }) => {
    isFirstGroupDisabled.set(true);
    const { popup, search } = await openPicker(canvasElement);
    const picker = within(popup);
    const ada = picker.getByRole('option', { name: 'Ada Lovelace' });
    const margaret = picker.getByRole('option', { name: 'Margaret Hamilton' });

    await userEvent.type(search, 'a');
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', margaret.id),
    );
    expect(ada).toBeDisabled();
    expect(picker.getByRole('option', { name: 'Grace Hopper' })).toBeDisabled();
    await userEvent.clear(search);
    await userEvent.type(search, 'margaret');
    expect(
      picker.queryByRole('option', { name: 'Grace Hopper' }),
    ).not.toBeInTheDocument();
    expect(
      picker.queryByRole('option', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    expect(search).toHaveAttribute('aria-activedescendant', margaret.id);
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0]?.[0]).toBe('Margaret Hamilton');
    expect(margaret).toHaveAttribute('aria-selected', 'true');
    expect(onInvite).not.toHaveBeenCalled();
    expect(search).toHaveFocus();
    await userEvent.keyboard('{Escape}');
  },
};

export const WhitespaceDoesNotActivate: Story = {
  render: () => <SearchActivationExample />,
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);

    await userEvent.type(search, '   ');
    expect(search).not.toHaveAttribute('aria-activedescendant');
    await userEvent.keyboard('{Enter}');

    expect(onSelect).not.toHaveBeenCalled();
    expect(onInvite).not.toHaveBeenCalled();
    expect(search).toHaveFocus();
    expect(popup).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};

export const CompositionKeepsSearchFocus: Story = {
  render: () => <SearchActivationExample />,
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);

    await userEvent.type(search, 'ada');
    await fireEvent.compositionStart(search);
    await fireEvent.keyDown(search, { key: 'Enter', isComposing: true });
    await fireEvent.keyDown(search, { key: 'ArrowDown', isComposing: true });

    expect(search).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onInvite).not.toHaveBeenCalled();

    await fireEvent.compositionEnd(search);
    await fireEvent.keyDown(search, { key: 'Enter', keyCode: 229 });
    await fireEvent.keyDown(search, { key: 'ArrowDown', keyCode: 229 });

    expect(search).toHaveFocus();
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0]?.[0]).toBe('Ada Lovelace');
    expect(
      within(popup).getByRole('option', { name: 'Ada Lovelace' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
  },
};

export const ControlledQueryUpdatesPreview: Story = {
  render: () => <SearchActivationExample />,
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);
    const ada = within(popup).getByRole('option', { name: 'Ada Lovelace' });

    query.set('reviewer');
    await waitFor(() => expect(search).toHaveValue('reviewer'));
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', ada.id),
    );
    expect(within(popup).getByRole('option', { name: 'Ada Lovelace' })).toBe(
      ada,
    );

    query.set('');
    await waitFor(() => expect(search).toHaveValue(''));
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(ada).not.toHaveAttribute('data-highlighted');
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
  },
};

export const SearchAfterResultsMirrorsArrowNavigation: Story = {
  render: () => <SearchActivationExample searchPlacement="bottom" />,
  play: async ({ canvasElement }) => {
    const { popup, search } = await openPicker(canvasElement);
    const picker = within(popup);
    const invite = picker.getByRole('button', { name: 'Invite reviewer' });
    const ada = picker.getByRole('option', { name: 'Ada Lovelace' });
    const margaret = picker.getByRole('option', { name: 'Margaret Hamilton' });

    await userEvent.keyboard('{ArrowUp}');
    expect(margaret).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(search).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(invite).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(margaret).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(search).toHaveFocus();

    await userEvent.type(search, 'ada');
    await waitFor(() =>
      expect(search).toHaveAttribute('aria-activedescendant', ada.id),
    );
    await userEvent.keyboard('{Enter}');
    expect(ada).toHaveAttribute('aria-selected', 'true');
    expect(onSelect).toHaveBeenCalledOnce();
    expect(popup).toBeVisible();
    await userEvent.keyboard('{Escape}');
  },
};
