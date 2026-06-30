import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TasksVisual } from './TasksVisual';

i18n.load('en', {});
i18n.activate('en');

function renderVisual() {
  return render(
    <I18nProvider i18n={i18n}>
      <TasksVisual active />
    </I18nProvider>,
  );
}

describe('TasksVisual', () => {
  it('renders each task with its body and due date', () => {
    renderVisual();

    expect(screen.getByText('Send NDA')).toBeInTheDocument();
    expect(
      screen.getByText('Loop in legal before sending.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Jul 22, 2026')).toBeInTheDocument();
  });

  it('renders the completed task alongside the open ones', () => {
    renderVisual();

    expect(screen.getByText('Prepare onboarding deck')).toBeInTheDocument();
    expect(screen.getByText('Schedule security review')).toBeInTheDocument();
  });

  it('assigns every task to Félix Malfait', () => {
    renderVisual();

    expect(screen.getAllByText('Félix Malfait')).toHaveLength(4);
  });

  it('offers an add-task action', () => {
    renderVisual();

    expect(screen.getByText('Add task')).toBeInTheDocument();
  });

  it('completes a task when its checkbox is clicked', async () => {
    const user = userEvent.setup();
    renderVisual();

    const checkbox = screen.getByRole('checkbox', { name: 'Send NDA' });
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    await user.click(checkbox);

    expect(screen.getByRole('checkbox', { name: 'Send NDA' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('completes a task with the keyboard', async () => {
    const user = userEvent.setup();
    renderVisual();

    const checkbox = screen.getByRole('checkbox', {
      name: 'Follow up on pricing',
    });
    checkbox.focus();
    await user.keyboard(' ');

    expect(
      screen.getByRole('checkbox', { name: 'Follow up on pricing' }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('removes the add-task button instead of moving it to Done when every task is done', async () => {
    const user = userEvent.setup();
    renderVisual();

    await user.click(screen.getByRole('checkbox', { name: 'Send NDA' }));
    await user.click(
      screen.getByRole('checkbox', { name: 'Follow up on pricing' }),
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Prepare onboarding deck' }),
    );

    expect(screen.queryByText('Add task')).not.toBeInTheDocument();
  });
});
