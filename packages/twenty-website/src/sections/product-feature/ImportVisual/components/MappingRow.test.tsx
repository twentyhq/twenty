import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { IconUser } from '@tabler/icons-react';
import { render, screen } from '@testing-library/react';

import { type ColumnMapping } from '../types/column-mapping';
import { MappingRow } from './MappingRow';

i18n.load('en', {});
i18n.activate('en');

const MAPPING: ColumnMapping = {
  Icon: IconUser,
  example: 'Dario',
  field: { id: 'Name' },
  header: 'First Name',
};

describe('MappingRow', () => {
  it('renders the imported column, its example and the mapped field', () => {
    render(
      <I18nProvider i18n={i18n}>
        <MappingRow mapping={MAPPING} />
      </I18nProvider>,
    );

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('ex: Dario')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
