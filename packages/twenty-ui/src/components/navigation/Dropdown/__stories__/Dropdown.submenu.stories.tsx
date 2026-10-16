import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const ExportSubmenu = ({ direction }: { direction: 'ltr' | 'rtl' }) => (
  <DirectionProvider direction={direction}>
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
  </DirectionProvider>
);

const ExportSubmenuWithNextControl = () => (
  <>
    <ExportSubmenu direction="ltr" />
    <Button>Next control</Button>
  </>
);

const onSpreadsheetOpenChange = fn();

const NestedSubmenusWithNextControl = () => (
  <>
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions" keepMounted>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger delay={0}>Export</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Export formats" keepMounted>
            <Dropdown.Submenu onOpenChange={onSpreadsheetOpenChange}>
              <Dropdown.SubmenuTrigger delay={0}>
                Spreadsheet
              </Dropdown.SubmenuTrigger>
              <Dropdown.Content aria-label="Spreadsheet formats" keepMounted>
                <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
                <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
              </Dropdown.Content>
            </Dropdown.Submenu>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
    <Button>Next control</Button>
  </>
);

const focusExportTrigger = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.tab();
  await userEvent.keyboard('{ArrowDown}');
  const trigger = await body.findByRole('menuitem', { name: 'Export' });

  await waitFor(() => expect(trigger).toHaveFocus());

  return trigger;
};

const playHoverThenKeyboard =
  ({ forwardKey, dismissKey }: { forwardKey: string; dismissKey: string }) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await focusExportTrigger(canvasElement);

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
  id: 'ui-components-dropdown-interactions-submenu',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Submenu',
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

export const DisabledSubmenuOwners: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger disabled delay={0}>
            Export
          </Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Export formats">
            <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger
            disabled
            nativeButton
            render={<Button />}
            delay={0}
          >
            Import
          </Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Import formats">
            <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger delay={0}>Sort</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Sorting directions">
            <Dropdown.ActionItem>Ascending</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Record actions' }),
    );
    const duplicate = await body.findByRole('menuitem', {
      name: 'Duplicate',
    });
    const sort = body.getByRole('menuitem', { name: 'Sort' });

    await waitFor(() => expect(duplicate).toHaveFocus());
    for (const name of ['Export', 'Import']) {
      const trigger = body.getByRole('menuitem', { name });

      await expect(trigger).toBeDisabled();
      trigger.focus();
      await expect(duplicate).toHaveFocus();
      await userEvent.hover(trigger);
      await userEvent.click(trigger);
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    }
    await userEvent.keyboard('{ArrowDown}');
    await expect(sort).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(duplicate).toHaveFocus();
    await userEvent.hover(sort);
    const submenu = await body.findByRole('menu', {
      name: 'Sorting directions',
    });

    await waitFor(() => expect(submenu).toBeVisible());
    await expect(
      body.queryByRole('menu', { name: 'Export formats' }),
    ).not.toBeInTheDocument();
    await expect(
      body.queryByRole('menu', { name: 'Import formats' }),
    ).not.toBeInTheDocument();
    sort.focus();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Ascending' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(submenu).not.toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

const playTabClosesMenuChain =
  ({ shift }: { shift: boolean }) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Record actions' });

    await focusExportTrigger(canvasElement);
    await userEvent.keyboard('{ArrowRight}');
    const formats = await body.findByRole('menu', { name: 'Export formats' });

    await waitFor(() => expect(formats).toBeVisible());
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.tab({ shift });
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        shift ? trigger : canvas.getByRole('button', { name: 'Next control' }),
      ).toHaveFocus(),
    );
  };

export const TabClosesMenuChain: Story = {
  render: () => <ExportSubmenuWithNextControl />,
  play: playTabClosesMenuChain({ shift: false }),
};

export const ShiftTabClosesMenuChain: Story = {
  render: () => <ExportSubmenuWithNextControl />,
  play: playTabClosesMenuChain({ shift: true }),
};

export const TabClosesNestedMenuChain: Story = {
  render: () => <NestedSubmenusWithNextControl />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    onSpreadsheetOpenChange.mockClear();
    await focusExportTrigger(canvasElement);
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Spreadsheet' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.tab();

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Next control' }),
      ).toHaveFocus(),
    );
    expect(onSpreadsheetOpenChange).toHaveBeenLastCalledWith(false);
  },
};
