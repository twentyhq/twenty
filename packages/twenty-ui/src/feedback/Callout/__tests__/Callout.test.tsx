import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Callout } from '../Callout';

describe('Callout', () => {
  it.each([true, false])(
    'respects the action disabled state (%s)',
    async (disabled) => {
      const user = userEvent.setup();
      const onClick = jest.fn();

      render(
        <Callout
          variant="warning"
          title="AI usage limit reached"
          description="Upgrade your plan for more usage."
          action={{ label: 'Upgrade', onClick, disabled }}
        />,
      );

      const action = screen.getByRole('button', { name: 'Upgrade' });

      if (disabled) {
        expect(action).toBeDisabled();
      } else {
        expect(action).toBeEnabled();
      }

      await user.click(action);

      expect(onClick).toHaveBeenCalledTimes(disabled ? 0 : 1);
    },
  );
});
