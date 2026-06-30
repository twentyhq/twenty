import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { AddTaskButton } from './AddTaskButton';

i18n.load('en', {});
i18n.activate('en');

describe('AddTaskButton', () => {
  it('renders the add-task label', () => {
    render(
      <I18nProvider i18n={i18n}>
        <AddTaskButton />
      </I18nProvider>,
    );

    expect(screen.getByText('Add task')).toBeInTheDocument();
  });
});
