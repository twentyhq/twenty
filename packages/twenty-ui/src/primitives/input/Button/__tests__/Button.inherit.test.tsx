import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

describe('Button inherited color contract', () => {
  it.each([
    {
      appearance: 'explicit props',
      element: (
        <Button variant="solid" color="inherit">
          Save
        </Button>
      ),
    },
    {
      appearance: 'group defaults',
      element: (
        <ButtonGroup variant="solid" color="inherit">
          <Button>Save</Button>
        </ButtonGroup>
      ),
    },
    {
      appearance: 'explicit color and group variant',
      element: (
        <ButtonGroup variant="solid">
          <Button color="inherit">Save</Button>
        </ButtonGroup>
      ),
    },
  ])('rejects solid inherited color from $appearance', ({ element }) => {
    expect(() => renderToStaticMarkup(element)).toThrow(
      'Button color="inherit" does not support variant="solid". Use outline, ghost, soft, or link.',
    );
  });

  it.each(['outline', 'ghost', 'soft', 'link'] as const)(
    'allows inherited color with the %s variant',
    (variant) => {
      expect(() =>
        renderToStaticMarkup(
          <Button color="inherit" variant={variant}>
            Save
          </Button>,
        ),
      ).not.toThrow();
    },
  );

  it('validates each child after explicit group overrides', () => {
    expect(() =>
      renderToStaticMarkup(
        <ButtonGroup variant="solid" color="inherit">
          <Button variant="ghost">Cancel</Button>
          <Button color="accent">Save</Button>
        </ButtonGroup>,
      ),
    ).not.toThrow();
  });
});
