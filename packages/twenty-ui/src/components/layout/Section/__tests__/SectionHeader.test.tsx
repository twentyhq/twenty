import { Section } from '@ui/components/layout/Section/Section';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
