import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const ExportSubmenu = ({ direction }: { direction: 'ltr' | 'rtl' }) => (
  <TextDirectionProvider direction={direction}>
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger delay={0}>Export</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Export formats">
            <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
            <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  </TextDirectionProvider>
);

const playHoverThenKeyboard =
  ({ forwardKey, dismissKey }: { forwardKey: string; dismissKey: string }) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const trigger = await body.findByRole('menuitem', { name: 'Export' });

    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.hover(trigger);
    await body.findByRole('menu', { name: 'Export formats' });
    expect(trigger).toHaveFocus();
    await userEvent.keyboard(forwardKey);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.keyboard(dismissKey);
    await waitFor(() =>
      expect(
        body.queryByRole('menu', { name: 'Export formats' }),
      ).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  };

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Submenu',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
};

export default meta;
type Story = StoryObj;

export const HoverThenArrowBackLeftToRight: Story = {
  render: () => <ExportSubmenu direction="ltr" />,
  play: playHoverThenKeyboard({
    forwardKey: '{ArrowRight}',
    dismissKey: '{ArrowLeft}',
  }),
};

export const HoverThenArrowBackRightToLeft: Story = {
  render: () => <ExportSubmenu direction="rtl" />,
  play: playHoverThenKeyboard({
    forwardKey: '{ArrowLeft}',
    dismissKey: '{ArrowRight}',
  }),
};

export const HoverThenEscape: Story = {
  render: () => <ExportSubmenu direction="ltr" />,
  play: playHoverThenKeyboard({
    forwardKey: '{ArrowRight}',
    dismissKey: '{Escape}',
  }),
};
