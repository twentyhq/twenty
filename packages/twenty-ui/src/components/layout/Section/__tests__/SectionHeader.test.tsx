import { Section } from '@ui/components/layout/Section/Section';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import styles from '../SectionHeader.module.scss';

runComponentConformance({
  name: 'Section.Header',
  element: <Section.Header title="Workspace" description="Manage your team" />,
  ownClassName: styles.header,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'header',
});

describe('Section.Header', () => {
  it('associates ordinary description text with the requested heading level', () => {
    render(
      <Section.Header
        title="Workspace"
        description="Manage your team"
        level={3}
        size="lg"
      />,
    );

    const heading = screen.getByRole('heading', {
      name: 'Workspace',
      level: 3,
    });

    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(heading).toHaveAccessibleDescription('Manage your team');
    expect(heading).toHaveAttribute('data-size', 'lg');
  });

  it('accepts rich descriptions and omits their association when cleared', () => {
    const { rerender } = render(
      <Section.Header
        title="Workspace"
        description={
          <span>
            Manage <strong>your team</strong>
          </span>
        }
      />,
    );

    expect(screen.getByRole('heading')).toHaveAccessibleDescription(
      'Manage your team',
    );

    rerender(<Section.Header title="Workspace" description="" />);

    expect(screen.getByRole('heading')).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText('your team')).not.toBeInTheDocument();
  });
});

describe('Section description composition', () => {
  it('keeps string descriptions out of the tab order unless focus is requested', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Section.Header
        title={<span>Workspace</span>}
        description="Details"
        actions={<button>Edit</button>}
      />,
    );
    expect(screen.getByText('Details')).not.toHaveAttribute('tabindex');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus();
    rerender(
      <Section.Header
        title="Workspace"
        description="Details"
        isDescriptionFocusable
      />,
    );
    await user.tab();
    expect(screen.getByText('Details')).toHaveFocus();
  });

  it('renders full string descriptions without a tooltip or a tab stop when truncation is disabled', () => {
    render(
      <Section.Header
        title="Workspace"
        description={'First line\nSecond line'}
        descriptionLineClamp={false}
        isDescriptionFocusable
      />,
    );
    const description = screen.getByText(/First line/);
    expect(description).toHaveStyle({ whiteSpace: 'pre-wrap' });
    expect(description).not.toHaveAttribute('tabindex');
    expect(description).not.toHaveAttribute('data-content-overflowing');
    expect(screen.getByRole('heading')).toHaveAccessibleDescription(
      'First line\nSecond line',
    );
  });
});
