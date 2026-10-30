import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Input } from '@ui/primitives/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onOwnerChange = fn();
const onWatchersChange = fn();
const onAction = fn();
const onOptionSelect = fn();
const onGroupRef = fn<(element: HTMLDivElement | null) => void>();
const onOptionRef = fn<(element: HTMLButtonElement | null) => void>();
const onOptionClick = fn();
const onComposedClick = fn();
const controlledOwner = createStoryState<string | null>(null);
const controlledWatchers = createStoryState<string[]>([]);
const visiblePeople = createStoryState(['ada', 'grace']);
const defaultOwner = createStoryState<string | null>('ada');
const POPUP_OPEN_TIMEOUT = 5000;

const openPicker = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Choose people' }),
  );

  const picker = await within(canvasElement.ownerDocument.body).findByRole(
    'dialog',
    {
      name: 'People',
    },
  );

  await waitFor(() => expect(picker).toBeVisible(), {
    timeout: POPUP_OPEN_TIMEOUT,
  });

  return picker;
};

const OwnerOptions = () => (
  <>
    <Dropdown.OptionItem value="ada">Ada Lovelace</Dropdown.OptionItem>
    <Dropdown.OptionItem value="grace">Grace Hopper</Dropdown.OptionItem>
  </>
);

const ControlledGroups = () => (
  <Dropdown.Root type="picker">
    <Dropdown.Trigger>Choose people</Dropdown.Trigger>
    <Dropdown.Content aria-label="People">
      <Dropdown.SelectionGroup
        id="owner"
        aria-label="Owner"
        value={controlledOwner.useValue()}
        closeOnSelect={false}
        onValueChange={onOwnerChange}
      >
        <OwnerOptions />
      </Dropdown.SelectionGroup>
      <Dropdown.SelectionGroup
        id="watchers"
        aria-label="Watchers"
        multiple
        value={controlledWatchers.useValue()}
        onValueChange={onWatchersChange}
      >
        <Dropdown.OptionItem value="ada">Watch Ada</Dropdown.OptionItem>
        <Dropdown.OptionItem value="grace">Watch Grace</Dropdown.OptionItem>
      </Dropdown.SelectionGroup>
    </Dropdown.Content>
  </Dropdown.Root>
);

const FilteredOwner = () => (
  <Dropdown.Root type="picker">
    <Dropdown.Trigger>Choose people</Dropdown.Trigger>
    <Dropdown.Content aria-label="People">
      <Dropdown.SelectionGroup
        id="owner"
        aria-label="Owner"
        closeOnSelect={false}
        onValueChange={onOwnerChange}
      >
        {visiblePeople.useValue().map((person) => (
          <Dropdown.OptionItem key={person} value={person}>
            {person === 'ada' ? 'Ada Lovelace' : 'Grace Hopper'}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.SelectionGroup>
    </Dropdown.Content>
  </Dropdown.Root>
);

const meta: Meta = {
  id: 'ui-components-dropdown-interactions-selection-group',
  title: 'UI/Components/Navigation/Dropdown/Interactions/SelectionGroup',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    for (const callback of [
      onOwnerChange,
      onWatchersChange,
      onAction,
      onOptionSelect,
      onGroupRef,
      onOptionRef,
      onOptionClick,
      onComposedClick,
    ]) {
      callback.mockClear();
    }

    controlledOwner.set(null);
    controlledWatchers.set([]);
    visiblePeople.set(['ada', 'grace']);
    defaultOwner.set('ada');
  },
};

export default meta;
type Story = StoryObj;

export const UncontrolledSingle: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          defaultValue={null}
          onValueChange={onOwnerChange}
        >
          <OwnerOptions />
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const picker = await openPicker(canvasElement);
    const owner = within(picker).getByRole('listbox', { name: 'Owner' });
    const ada = within(owner).getByRole('option', { name: 'Ada Lovelace' });
    const grace = within(owner).getByRole('option', { name: 'Grace Hopper' });

    expect(ada).toHaveAttribute('aria-selected', 'false');
    expect(grace).toHaveAttribute('aria-selected', 'false');
    expect(ada).not.toHaveAttribute('aria-checked');
    expect(owner.querySelector('input')).toBeNull();
    await userEvent.keyboard('{ArrowDown}');
    expect(grace).toHaveFocus();
    expect(onOwnerChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace', expect.anything());
    await waitFor(() => expect(picker).not.toBeInTheDocument());

    await openPicker(canvasElement);
    const selectedGrace = body.getByRole('option', { name: 'Grace Hopper' });

    await waitFor(() => expect(selectedGrace).toHaveFocus());
    expect(selectedGrace).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard(' ');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onOwnerChange).toHaveBeenCalledOnce();
  },
};

export const UncontrolledMultipleEmpty: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="watchers"
          aria-label="Watchers"
          multiple
          defaultValue={[]}
          onValueChange={onWatchersChange}
        >
          <OwnerOptions />
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const watchers = within(picker).getByRole('listbox', { name: 'Watchers' });
    const ada = within(watchers).getByRole('option', { name: 'Ada Lovelace' });
    const grace = within(watchers).getByRole('option', {
      name: 'Grace Hopper',
    });

    expect(watchers).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(ada);
    await userEvent.click(grace);
    expect(ada).toHaveAttribute('aria-selected', 'true');
    expect(grace).toHaveAttribute('aria-selected', 'true');
    expect(onWatchersChange).toHaveBeenLastCalledWith(
      ['ada', 'grace'],
      expect.anything(),
    );
    await userEvent.click(ada);
    await userEvent.click(grace);
    expect(onWatchersChange).toHaveBeenLastCalledWith([], expect.anything());
    expect(ada).toHaveAttribute('aria-selected', 'false');
    expect(grace).toHaveAttribute('aria-selected', 'false');
    expect(picker).toBeVisible();
  },
};

export const ControlledEmptyValuesAndExternalChanges: Story = {
  render: () => <ControlledGroups />,
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const ada = within(picker).getByRole('option', { name: 'Ada Lovelace' });
    const grace = within(picker).getByRole('option', { name: 'Grace Hopper' });
    const watchAda = within(picker).getByRole('option', { name: 'Watch Ada' });

    await userEvent.click(grace);
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace', expect.anything());
    expect(grace).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(watchAda);
    expect(onWatchersChange).toHaveBeenLastCalledWith(
      ['ada'],
      expect.anything(),
    );
    expect(watchAda).toHaveAttribute('aria-selected', 'false');

    controlledOwner.set('ada');
    controlledWatchers.set(['ada']);

    await waitFor(() => expect(ada).toHaveAttribute('aria-selected', 'true'));
    expect(watchAda).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(ada);
    expect(onOwnerChange).toHaveBeenCalledOnce();

    controlledOwner.set(null);
    controlledWatchers.set([]);

    await waitFor(() => expect(ada).toHaveAttribute('aria-selected', 'false'));
    expect(watchAda).toHaveAttribute('aria-selected', 'false');
    expect(picker).toBeVisible();
  },
};

export const CancelledChangesAndCloseOverrides: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          onValueChange={(value, eventDetails) => {
            onOwnerChange(value, eventDetails);
            eventDetails.cancel();
          }}
        >
          <Dropdown.OptionItem value="ada" closeOnSelect>
            Cancelled Ada
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        <Dropdown.SelectionGroup id="reviewer" aria-label="Reviewer">
          <Dropdown.OptionItem value="grace" closeOnSelect={false}>
            Keep Grace open
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        <Dropdown.SelectionGroup
          id="watchers"
          aria-label="Watchers"
          multiple
          onValueChange={onWatchersChange}
        >
          <Dropdown.OptionItem value="ada" closeOnSelect>
            Close after Ada
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const cancelled = within(picker).getByRole('option', {
      name: 'Cancelled Ada',
    });

    await userEvent.click(cancelled);
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(onOwnerChange).toHaveBeenLastCalledWith(
      'ada',
      expect.objectContaining({
        reason: 'item-press',
        trigger: cancelled,
        event: expect.objectContaining({ type: 'click' }),
        isCanceled: true,
      }),
    );
    expect(cancelled).toHaveAttribute('aria-selected', 'false');
    expect(picker).toBeVisible();
    await userEvent.click(
      within(picker).getByRole('option', { name: 'Keep Grace open' }),
    );
    expect(
      within(picker).getByRole('option', { name: 'Keep Grace open' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(picker).toBeVisible();
    await userEvent.click(
      within(picker).getByRole('option', { name: 'Close after Ada' }),
    );
    expect(onWatchersChange).toHaveBeenLastCalledWith(
      ['ada'],
      expect.anything(),
    );
    await waitFor(() => expect(picker).not.toBeInTheDocument());
  },
};

export const CancelledOptionAndPreventedClick: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          onValueChange={onOwnerChange}
        >
          <Dropdown.OptionItem
            value="ada"
            onSelect={(eventDetails) => {
              onOptionSelect(eventDetails);
              eventDetails.cancel();
            }}
          >
            Cancelled Ada
          </Dropdown.OptionItem>
          <Dropdown.OptionItem
            value="grace"
            onClick={(event) => event.preventDefault()}
            onSelect={onOptionSelect}
          >
            Prevented Grace
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const ada = within(picker).getByRole('option', { name: 'Cancelled Ada' });
    const grace = within(picker).getByRole('option', {
      name: 'Prevented Grace',
    });

    await userEvent.click(ada);
    expect(onOptionSelect).toHaveBeenCalledOnce();
    expect(onOptionSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({
        reason: 'item-press',
        trigger: ada,
        event: expect.objectContaining({ type: 'click' }),
        isCanceled: true,
      }),
    );
    await userEvent.click(grace);
    expect(onOptionSelect).toHaveBeenCalledOnce();
    expect(onOwnerChange).not.toHaveBeenCalled();
    expect(ada).toHaveAttribute('aria-selected', 'false');
    expect(grace).toHaveAttribute('aria-selected', 'false');
    expect(picker).toBeVisible();
  },
};

export const DefaultValueOnlyInitializesSelection: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          defaultValue={defaultOwner.useValue()}
          closeOnSelect={false}
          onValueChange={onOwnerChange}
        >
          <OwnerOptions />
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const ada = within(picker).getByRole('option', { name: 'Ada Lovelace' });
    const grace = within(picker).getByRole('option', { name: 'Grace Hopper' });

    expect(ada).toHaveAttribute('aria-selected', 'true');

    defaultOwner.set('grace');

    await waitFor(() => expect(ada).toHaveAttribute('aria-selected', 'true'));
    expect(grace).toHaveAttribute('aria-selected', 'false');
    expect(onOwnerChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    const reopened = await openPicker(canvasElement);

    expect(
      within(reopened).getByRole('option', { name: 'Ada Lovelace' }),
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const RenderStateRefsAndEvents: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="owner"
          ref={onGroupRef}
          aria-label="Owner"
          closeOnSelect={false}
          onValueChange={onOwnerChange}
          render={(props, state) => (
            <div
              // oxlint-disable-next-line react/jsx-props-no-spreading
              {...props}
              title={state.value === 'ada' ? 'Ada is selected' : 'No owner'}
            />
          )}
        >
          <Dropdown.OptionItem
            value="ada"
            ref={onOptionRef}
            nativeButton
            aria-label="Ada choice"
            title="Choose Ada"
            onClick={onOptionClick}
            onSelect={onOptionSelect}
            render={(props, state) => (
              <Button
                // oxlint-disable-next-line react/jsx-props-no-spreading
                {...props}
                color={state.selected ? 'accent' : 'neutral'}
              >
                {state.selected ? 'Selected Ada' : 'Choose Ada'}
              </Button>
            )}
          />
          <Dropdown.OptionItem
            value="grace"
            nativeButton
            aria-label="Grace choice"
            onSelect={onOptionSelect}
            render={
              <Button
                onClick={(event) => {
                  onComposedClick();
                  event.preventDefault();
                }}
              >
                Choose Grace
              </Button>
            }
          />
          <Dropdown.OptionItem
            value="margaret"
            disabled
            nativeButton
            aria-label="Margaret choice"
            render={(props, state) => (
              <Button
                // oxlint-disable-next-line react/jsx-props-no-spreading
                {...props}
                color="neutral"
              >
                {state.disabled ? 'Unavailable Margaret' : 'Choose Margaret'}
              </Button>
            )}
          />
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const owner = within(picker).getByRole('listbox', { name: 'Owner' });
    const ada = within(owner).getByRole('option', { name: 'Ada choice' });
    const grace = within(owner).getByRole('option', { name: 'Grace choice' });
    const margaret = within(owner).getByRole('option', {
      name: 'Margaret choice',
    });

    expect(onGroupRef).toHaveBeenCalledWith(owner);
    expect(onOptionRef).toHaveBeenCalledWith(ada);
    expect(owner).toHaveAttribute('title', 'No owner');
    expect(ada).toHaveAttribute('title', 'Choose Ada');
    expect(ada).toHaveTextContent('Choose Ada');
    expect(margaret).toBeDisabled();
    expect(margaret).toHaveTextContent('Unavailable Margaret');
    await userEvent.click(ada);
    expect(onOptionClick).toHaveBeenCalledOnce();
    expect(onOptionSelect).toHaveBeenCalledOnce();
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(ada).toHaveAttribute('aria-selected', 'true');
    expect(ada).toHaveAttribute('data-color', 'accent');
    expect(ada).toHaveTextContent('Selected Ada');
    expect(owner).toHaveAttribute('title', 'Ada is selected');
    expect(onOwnerChange).toHaveBeenLastCalledWith(
      'ada',
      expect.objectContaining({
        reason: 'item-press',
        trigger: ada,
        event: expect.objectContaining({ type: 'click' }),
        isCanceled: false,
      }),
    );
    await userEvent.click(grace);
    expect(onComposedClick).toHaveBeenCalledOnce();
    expect(onOptionSelect).toHaveBeenCalledOnce();
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(grace).toHaveAttribute('aria-selected', 'false');
    expect(picker).toBeVisible();
  },
};

export const RemovedMultipleValuesPersist: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.SelectionGroup
          id="watchers"
          aria-label="Watchers"
          multiple
          defaultValue={['grace']}
          onValueChange={onWatchersChange}
        >
          {visiblePeople.useValue().map((person) => (
            <Dropdown.OptionItem key={person} value={person}>
              {person === 'ada' ? 'Ada Lovelace' : 'Grace Hopper'}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);

    expect(
      within(picker).getByRole('option', { name: 'Grace Hopper' }),
    ).toHaveAttribute('aria-selected', 'true');

    visiblePeople.set(['ada']);

    await waitFor(() =>
      expect(
        within(picker).queryByRole('option', { name: 'Grace Hopper' }),
      ).not.toBeInTheDocument(),
    );
    expect(onWatchersChange).not.toHaveBeenCalled();

    visiblePeople.set(['grace', 'ada']);

    const grace = await within(picker).findByRole('option', {
      name: 'Grace Hopper',
    });

    expect(grace).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(grace);
    expect(onWatchersChange).toHaveBeenLastCalledWith([], expect.anything());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    const reopened = await openPicker(canvasElement);

    expect(
      within(reopened).getByRole('option', { name: 'Grace Hopper' }),
    ).toHaveAttribute('aria-selected', 'false');
  },
};

export const MixedGroupsShareNavigation: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.Search aria-label="Search people" />
        <Dropdown.ActionItem closeOnClick={false} onClick={onAction}>
          Create person
        </Dropdown.ActionItem>
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          closeOnSelect={false}
          onValueChange={onOwnerChange}
        >
          <Dropdown.OptionItem value="ada">Ada Lovelace</Dropdown.OptionItem>
          <Dropdown.OptionItem value="disabled" disabled>
            Unavailable owner
          </Dropdown.OptionItem>
          <Dropdown.OptionItem value="grace">Grace Hopper</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        <Dropdown.SelectionGroup
          id="watchers"
          aria-label="Watchers"
          multiple
          onValueChange={onWatchersChange}
        >
          <Dropdown.OptionItem value="ada">Watch Ada</Dropdown.OptionItem>
          <Dropdown.OptionItem value="grace">Watch Grace</Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
        <Dropdown.ActionItem closeOnClick={false} onClick={onAction}>
          Invite person
        </Dropdown.ActionItem>
        <Button>Manage people</Button>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const search = within(picker).getByRole('searchbox');
    const create = within(picker).getByRole('button', {
      name: 'Create person',
    });
    const grace = within(picker).getByRole('option', { name: 'Grace Hopper' });
    const watchAda = within(picker).getByRole('option', { name: 'Watch Ada' });
    const invite = within(picker).getByRole('button', {
      name: 'Invite person',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.tab();
    expect(create).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(grace).toHaveFocus();
    expect(onOwnerChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}');
    expect(watchAda).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(invite).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(create).toHaveFocus();
    await userEvent.keyboard('{ArrowDown} ');
    expect(onOwnerChange).toHaveBeenLastCalledWith('ada', expect.anything());
    expect(watchAda).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onWatchersChange).toHaveBeenLastCalledWith(
      ['ada'],
      expect.anything(),
    );
    expect(watchAda).toHaveAttribute('aria-selected', 'true');
    expect(onAction).not.toHaveBeenCalled();
    await userEvent.tab({ shift: true });
    expect(search).toHaveFocus();
    await userEvent.tab();
    expect(watchAda).toHaveFocus();
    await userEvent.tab();
    expect(
      within(picker).getByRole('button', { name: 'Manage people' }),
    ).toHaveFocus();
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(onWatchersChange).toHaveBeenCalledOnce();
  },
};

export const NearestOwnerAndMenuTab: Story = {
  render: () => (
    <>
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>People menu</Dropdown.Trigger>
        <Dropdown.Content aria-label="People menu">
          <Dropdown.SelectionGroup
            id="owner"
            aria-label="Owner"
            closeOnSelect={false}
            onValueChange={onOwnerChange}
          >
            <Dropdown.OptionItem value="ada">Owner Ada</Dropdown.OptionItem>
            <Dropdown.SelectionGroup
              id="watchers"
              aria-label="Watchers"
              multiple
              onValueChange={onWatchersChange}
            >
              <Dropdown.OptionItem value="grace">
                Watch Grace
              </Dropdown.OptionItem>
            </Dropdown.SelectionGroup>
            <Dropdown.OptionItem value="grace">Owner Grace</Dropdown.OptionItem>
          </Dropdown.SelectionGroup>
          <Dropdown.ActionItem onClick={onAction}>Invite</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
      <Button>Next control</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'People menu' }),
    );
    const menu = await body.findByRole('menu', { name: 'People menu' });
    const ownerAda = within(menu).getByRole('menuitemradio', {
      name: 'Owner Ada',
    });
    const watchGrace = within(menu).getByRole('menuitemcheckbox', {
      name: 'Watch Grace',
    });

    await waitFor(() => expect(ownerAda).toHaveFocus());
    expect(ownerAda).not.toHaveAttribute('aria-selected');
    expect(watchGrace).not.toHaveAttribute('aria-selected');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(watchGrace).toHaveAttribute('aria-checked', 'true');
    expect(ownerAda).toHaveAttribute('aria-checked', 'false');
    expect(onOwnerChange).not.toHaveBeenCalled();
    expect(onWatchersChange).toHaveBeenLastCalledWith(
      ['grace'],
      expect.anything(),
    );
    await userEvent.keyboard('{ArrowDown} ');
    expect(
      within(menu).getByRole('menuitemradio', { name: 'Owner Grace' }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace', expect.anything());
    await userEvent.tab();
    await waitFor(() => expect(menu).not.toBeInTheDocument());
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Next control' }),
      ).toHaveFocus(),
    );
    expect(onAction).not.toHaveBeenCalled();
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(onWatchersChange).toHaveBeenCalledOnce();
  },
};

export const PanelKeepsNativeNavigation: Story = {
  render: () => (
    <Dropdown.Root type="panel">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Input aria-label="View name" />
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          closeOnSelect={false}
          onValueChange={onOwnerChange}
        >
          <OwnerOptions />
        </Dropdown.SelectionGroup>
        <Button>Save view</Button>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);
    const ada = within(picker).getByRole('button', { name: 'Ada Lovelace' });
    const grace = within(picker).getByRole('button', { name: 'Grace Hopper' });

    await waitFor(() =>
      expect(within(picker).getByRole('textbox')).toHaveFocus(),
    );
    await userEvent.tab();
    expect(ada).toHaveFocus();
    await userEvent.tab();
    expect(grace).toHaveFocus();
    expect(onOwnerChange).not.toHaveBeenCalled();
    await userEvent.keyboard(' ');
    expect(grace).toHaveAttribute('aria-pressed', 'true');
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace', expect.anything());
    await userEvent.tab();
    expect(
      within(picker).getByRole('button', { name: 'Save view' }),
    ).toHaveFocus();
    expect(picker).toBeVisible();
  },
};

export const RemovedValuesPersist: Story = {
  render: () => <FilteredOwner />,
  play: async ({ canvasElement }) => {
    const picker = await openPicker(canvasElement);

    await userEvent.click(
      within(picker).getByRole('option', { name: 'Grace Hopper' }),
    );
    expect(onOwnerChange).toHaveBeenCalledOnce();

    visiblePeople.set(['ada']);

    await waitFor(() =>
      expect(
        within(picker).queryByRole('option', { name: 'Grace Hopper' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      within(picker).getByRole('option', { name: 'Ada Lovelace' }),
    ).toHaveAttribute('aria-selected', 'false');
    expect(onOwnerChange).toHaveBeenCalledOnce();

    visiblePeople.set(['grace', 'ada']);

    await waitFor(() =>
      expect(
        within(picker).getByRole('option', { name: 'Grace Hopper' }),
      ).toHaveAttribute('aria-selected', 'true'),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    const reopened = await openPicker(canvasElement);

    expect(
      within(reopened).getByRole('option', { name: 'Grace Hopper' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(onOwnerChange).toHaveBeenCalledOnce();
  },
};

export const PageHistoryKeepsSelection: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="owner">Owner</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="owner" type="picker">
          <Dropdown.Back>Back to filters</Dropdown.Back>
          <Dropdown.SelectionGroup
            id="owner"
            aria-label="Owner"
            closeOnSelect={false}
            onValueChange={onOwnerChange}
          >
            <OwnerOptions />
          </Dropdown.SelectionGroup>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Filters',
    });

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Owner' }));
    await userEvent.click(
      await body.findByRole('option', { name: 'Grace Hopper' }),
    );
    await userEvent.click(
      body.getByRole('button', { name: 'Back to filters' }),
    );
    await userEvent.click(await body.findByRole('menuitem', { name: 'Owner' }));
    expect(
      await body.findByRole('option', { name: 'Grace Hopper' }),
    ).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Owner' }));
    expect(
      await body.findByRole('option', { name: 'Grace Hopper' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(onOwnerChange).toHaveBeenCalledOnce();
  },
};

export const SubmenuDismissalKeepsOwner: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>People menu</Dropdown.Trigger>
      <Dropdown.Content aria-label="People menu">
        <Dropdown.Submenu type="picker">
          <Dropdown.SubmenuTrigger>Owner</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Owner picker">
            <Dropdown.SelectionGroup
              id="owner"
              aria-label="Owner"
              onValueChange={onOwnerChange}
            >
              <OwnerOptions />
            </Dropdown.SelectionGroup>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'People menu',
    });

    await userEvent.click(trigger);
    const owner = await body.findByRole('menuitem', { name: 'Owner' });

    await waitFor(() => expect(owner).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    const picker = await body.findByRole('dialog', { name: 'Owner picker' });

    await waitFor(() =>
      expect(
        within(picker).getByRole('option', { name: 'Ada Lovelace' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(picker).not.toBeInTheDocument());
    await waitFor(() => expect(owner).toHaveFocus());
    expect(body.getByRole('menu', { name: 'People menu' })).toBeVisible();
    expect(onOwnerChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(
      await body.findByRole('option', { name: 'Grace Hopper' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace', expect.anything());

    await userEvent.click(trigger);
    const reopenedOwner = await body.findByRole('menuitem', { name: 'Owner' });

    await waitFor(() => expect(reopenedOwner).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    const reopened = await body.findByRole('dialog', { name: 'Owner picker' });
    const grace = within(reopened).getByRole('option', {
      name: 'Grace Hopper',
    });

    expect(grace).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(grace).toHaveFocus());
    expect(onOwnerChange).toHaveBeenCalledOnce();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopened).not.toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};
