import { render, screen } from '@testing-library/react';
import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '../Button';
import styles from '../Button.module.scss';

runComponentConformance({
  name: 'Button',
  element: <Button>Save</Button>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

describe('Button progress', () => {
  it('appends the progress to the label when children stay visible while loading', () => {
    render(
      <Button loading displayChildrenWhenLoading progress={42}>
        Installing
      </Button>,
    );

    expect(
      screen.getByRole('button', { name: 'Installing (42%)' }),
    ).toBeInTheDocument();
  });

  it('ignores the progress when loading hides the children', () => {
    render(
      <Button loading progress={42}>
        Save
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});
