import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';

import { THEME_LIGHT } from '@ui/theme';

import { Chip, ChipAccent, ChipSize, ChipVariant } from '../Chip';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={THEME_LIGHT}>{ui}</ThemeProvider>);
};

describe('Chip', () => {
  it('renders the label when provided', () => {
    renderWithTheme(
      <Chip
        label="My chip"
        size={ChipSize.Small}
        variant={ChipVariant.Regular}
        accent={ChipAccent.TextPrimary}
      />,
    );

    expect(screen.getByText('My chip')).toBeInTheDocument();
  });

  it('renders the empty label when label is empty and forceEmptyText is false', () => {
    renderWithTheme(
      <Chip
        label=""
        emptyLabel="Fallback"
        forceEmptyText={false}
        size={ChipSize.Small}
        variant={ChipVariant.Regular}
      />,
    );

    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('renders rightComponent when provided as a ReactNode', () => {
    renderWithTheme(
      <Chip
        label="With right component"
        rightComponent={<span data-testid="right-node">Right</span>}
      />,
    );

    expect(screen.getByTestId('right-node')).toBeInTheDocument();
  });

  it('renders rightComponent when provided as a function', () => {
    renderWithTheme(
      <Chip
        label="With right function"
        rightComponent={() => <span data-testid="right-fn">Right fn</span>}
      />,
    );

    expect(screen.getByTestId('right-fn')).toBeInTheDocument();
  });
});

