import { isDefined } from '@ui/utilities/utils/isDefined';

import { isTabbableElement } from '../internal/isTabbableElement';

const getElement = (markup: string) => {
  document.body.innerHTML = markup;

  const element = document.body.querySelector<HTMLElement>('#target');

  if (!isDefined(element)) {
    throw new Error('Missing #target element');
  }

  return element;
};

describe('isTabbableElement', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('accepts native controls and elements with a non-negative tabindex', () => {
    expect(isTabbableElement(getElement('<button id="target"></button>'))).toBe(
      true,
    );
    expect(
      isTabbableElement(getElement('<div id="target" tabindex="0"></div>')),
    ).toBe(true);
  });

  it('rejects disabled controls and elements removed from the tab order', () => {
    expect(
      isTabbableElement(getElement('<button id="target" disabled></button>')),
    ).toBe(false);
    expect(
      isTabbableElement(
        getElement('<button id="target" tabindex="-1"></button>'),
      ),
    ).toBe(false);
  });

  it('rejects elements inside hidden, inert or aria-hidden ancestors', () => {
    expect(
      isTabbableElement(
        getElement('<div hidden><button id="target"></button></div>'),
      ),
    ).toBe(false);
    expect(
      isTabbableElement(
        getElement('<div inert><button id="target"></button></div>'),
      ),
    ).toBe(false);
    expect(
      isTabbableElement(
        getElement(
          '<div aria-hidden="true"><span id="target" tabindex="0"></span></div>',
        ),
      ),
    ).toBe(false);
  });
});
