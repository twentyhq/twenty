import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@ui/theme';

import { JsonTree } from '../JsonTree';

const LABELS = {
  emptyArrayLabel: 'Empty array',
  emptyObjectLabel: 'Empty object',
  emptyStringLabel: 'Empty string',
  arrowButtonCollapsedLabel: 'Expand',
  arrowButtonExpandedLabel: 'Collapse',
};

it('uses entry IDs for highlighting even when display labels are identical', () => {
  const getNodeHighlighting = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <JsonTree
        {...LABELS}
        entries={[
          { id: 'first-step', label: 'Find record', value: { id: 'first' } },
          { id: 'second-step', label: 'Find record', value: { id: 'second' } },
        ]}
        getNodeHighlighting={getNodeHighlighting}
      />
    </ThemeProvider>,
  );

  expect(screen.getAllByText('Find record')).toHaveLength(2);
  expect(getNodeHighlighting).toHaveBeenCalledWith('first-step.id');
  expect(getNodeHighlighting).toHaveBeenCalledWith('second-step.id');
});

it('expands grouped roots and copies values through the public interface', async () => {
  const user = userEvent.setup();
  const onNodeValueClick = vi.fn();

  render(
    <ThemeProvider colorScheme="light">
      <JsonTree
        {...LABELS}
        entries={[{ id: 'step', label: 'Result', value: { name: 'Ada' } }]}
        shouldExpandNodeInitially={() => false}
        onNodeValueClick={onNodeValueClick}
      />
    </ThemeProvider>,
  );

  expect(screen.queryByText('Ada')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Expand' }));
  await user.click(await screen.findByRole('button', { name: 'Ada' }));
  expect(onNodeValueClick).toHaveBeenCalledWith('Ada');
});

it('renders localized empty values in a single JSON root', () => {
  render(
    <ThemeProvider colorScheme="light">
      <JsonTree {...LABELS} value={{ text: '', list: [], object: {} }} />
    </ThemeProvider>,
  );

  expect(screen.getByText('Empty string')).toBeInTheDocument();
  expect(screen.getByText('Empty array')).toBeInTheDocument();
  expect(screen.getByText('Empty object')).toBeInTheDocument();
});
