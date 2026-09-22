import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';
import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';

describe('Dropdown panel', () => {
  it('keeps form editing open and allows native tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root kind="panel">
        <Dropdown.Trigger render={<Button>Edit details</Button>} />
        <Dropdown.Content aria-label="Edit details">
          <Input aria-label="Name" defaultValue="Acme" />
          <Input aria-label="Website" defaultValue="https://acme.example" />
          <Dropdown.ActionItem>Save</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Edit details' });

    await user.click(trigger);
    const name = screen.getByRole('textbox', { name: 'Name' });

    await waitFor(() => expect(name).toHaveFocus());
    await user.type(name, ' company');
    expect(name).toHaveValue('Acme company');
    await user.tab();
    expect(screen.getByRole('textbox', { name: 'Website' })).toHaveFocus();
    expect(screen.getByRole('dialog')).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it('reports visibility requests while the owner retains control', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Dropdown.Root kind="panel" open onOpenChange={onOpenChange}>
        <Dropdown.Trigger>Details</Dropdown.Trigger>
        <Dropdown.Content aria-label="Details">
          <Input aria-label="Name" />
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await screen.findByRole('dialog', { name: 'Details' });
    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole('dialog')).toBeVisible();
    rerender(
      <Dropdown.Root kind="panel" open={false} onOpenChange={onOpenChange}>
        <Dropdown.Trigger>Details</Dropdown.Trigger>
        <Dropdown.Content aria-label="Details">
          <Input aria-label="Name" />
        </Dropdown.Content>
      </Dropdown.Root>,
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('supports external opening through feature-owned state', async () => {
    const user = userEvent.setup();
    const ControlledPanel = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <Button onClick={() => setOpen(true)}>Edit from toolbar</Button>
          <Dropdown.Root kind="panel" open={open} onOpenChange={setOpen}>
            <Dropdown.Trigger>Details</Dropdown.Trigger>
            <Dropdown.Content aria-label="Details">
              <Input aria-label="Name" />
              <Dropdown.ActionItem>Save</Dropdown.ActionItem>
            </Dropdown.Content>
          </Dropdown.Root>
        </>
      );
    };

    render(<ControlledPanel />);

    await user.click(screen.getByRole('button', { name: 'Edit from toolbar' }));
    expect(
      await screen.findByRole('dialog', { name: 'Details' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('restores focus to an explicit editor target after an action', async () => {
    const user = userEvent.setup();
    const editorRef = createRef<HTMLInputElement>();

    render(
      <>
        <Input aria-label="Editor" ref={editorRef} />
        <Dropdown.Root kind="panel">
          <Dropdown.Trigger>Insert link</Dropdown.Trigger>
          <Dropdown.Content aria-label="Insert link" finalFocus={editorRef}>
            <Input aria-label="Link address" />
            <Dropdown.ActionItem>Insert</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Insert link' }));
    await user.click(screen.getByRole('button', { name: 'Insert' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Editor' })).toHaveFocus(),
    );
  });
});
