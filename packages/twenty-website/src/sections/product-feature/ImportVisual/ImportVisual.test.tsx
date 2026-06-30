import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { ImportVisual } from './ImportVisual';

i18n.load('en', {});
i18n.activate('en');

function renderVisual() {
  return render(
    <I18nProvider i18n={i18n}>
      <ImportVisual active />
    </I18nProvider>,
  );
}

describe('ImportVisual', () => {
  it('renders the imported-data and twenty-fields columns', () => {
    renderVisual();

    expect(screen.getByText('Imported data')).toBeInTheDocument();
    expect(screen.getByText('Twenty fields')).toBeInTheDocument();
  });

  it('renders each imported column with its example value', () => {
    renderVisual();

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('ex: Dario')).toBeInTheDocument();
    expect(screen.getByText('ex: dario@anthropic.com')).toBeInTheDocument();
  });

  it('maps the imported columns onto Twenty fields', () => {
    renderVisual();

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Emails')).toBeInTheDocument();
    expect(screen.getAllByText('Company')).toHaveLength(2);
  });
});
