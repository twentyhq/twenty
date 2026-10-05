import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Input } from '@ui/primitives/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const detailsPanelOpen = createStoryState(true);

const onOpenChange = fn();

const OwnerControlledPanel = () => (
  <Dropdown.Root
    type="panel"
    open={detailsPanelOpen.useValue()}
    onOpenChange={onOpenChange}
  >
    <Dropdown.Trigger>Details</Dropdown.Trigger>
    <Dropdown.Content aria-label="Details">
      <Input aria-label="Name" />
    </Dropdown.Content>
  </Dropdown.Root>
);

const ToolbarControlledPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit from toolbar</Button>
      <Dropdown.Root type="panel" open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger>Details</Dropdown.Trigger>
        <Dropdown.Content aria-label="Details">
          <Input aria-label="Name" />
          <Dropdown.ActionItem>Save</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
    </>
  );
};

const InsertLinkPanel = () => {
  const editorRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Input aria-label="Editor" ref={editorRef} />
      <Dropdown.Root type="panel">
        <Dropdown.Trigger>Insert link</Dropdown.Trigger>
        <Dropdown.Content aria-label="Insert link" finalFocus={editorRef}>
          <Input aria-label="Link address" />
          <Dropdown.ActionItem>Insert</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
    </>
  );
};

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Panel',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    detailsPanelOpen.set(true);
    onOpenChange.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const FormEditing: Story = {
  render: () => (
    <Dropdown.Root type="panel">
      <Dropdown.Trigger render={<Button>Edit details</Button>} />
      <Dropdown.Content aria-label="Edit details">
        <Input aria-label="Name" defaultValue="Acme" />
        <Input aria-label="Website" defaultValue="https://acme.example" />
        <Dropdown.ActionItem>Save</Dropdown.ActionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit details',
    });

    await userEvent.click(trigger);
    const name = await body.findByRole('textbox', { name: 'Name' });

    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.type(name, ' company');
    expect(name).toHaveValue('Acme company');
    await userEvent.tab();
    expect(body.getByRole('textbox', { name: 'Website' })).toHaveFocus();
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const OwnerControlledVisibility: Story = {
  render: () => <OwnerControlledPanel />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Details' });

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(dialog).toBeVisible());

    detailsPanelOpen.set(false);

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ExternalOpening: Story = {
  render: () => <ToolbarControlledPanel />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit from toolbar' }),
    );
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Details' })).toBeVisible(),
    );
    await userEvent.click(body.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const ExplicitFinalFocus: Story = {
  render: () => <InsertLinkPanel />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Insert link' }));
    await userEvent.click(await body.findByRole('button', { name: 'Insert' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: 'Editor' })).toHaveFocus(),
    );
  },
};
