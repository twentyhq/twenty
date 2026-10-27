import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { DropdownPlacementExample } from './DropdownPlacementExample';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onContentRef = fn<(element: HTMLDivElement | null) => void>();

const meta: Meta<typeof DropdownPlacementExample> = {
  id: 'ui-components-dropdown-interactions-placement',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Placement',
  component: DropdownPlacementExample,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { onContentRef },
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    onContentRef.mockClear();
  },
};

export default meta;
type Story = StoryObj<typeof DropdownPlacementExample>;

export const ResolvedCollisionPlacementPreservesCustomization: Story = {
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Placement picker',
    });

    await userEvent.click(trigger);

    const popup = await within(canvasElement.ownerDocument.body).findByRole(
      'dialog',
      { name: 'Placement picker' },
    );
    const placement = within(popup).getByTestId('resolved-placement');

    await waitFor(() => {
      expect(popup).toHaveAttribute('data-side', 'top');
      expect(placement).toHaveAttribute('data-resolved-side', 'top');
      expect(placement).toHaveAttribute('data-resolved-align', 'start');
      expect(popup.getBoundingClientRect().bottom).toBeLessThan(
        trigger.getBoundingClientRect().top,
      );
    });
    expect(popup).toHaveAttribute('data-caller-render', 'preserved');
    expect(onContentRef).toHaveBeenCalledWith(popup);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(onContentRef).toHaveBeenLastCalledWith(null);
  },
};
