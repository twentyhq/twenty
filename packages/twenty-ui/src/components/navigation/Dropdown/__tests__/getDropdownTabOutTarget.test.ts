import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownTabOutTarget } from '../internal/getDropdownTabOutTarget';

const getTabOutTarget = (markup: string) => {
  document.body.innerHTML = markup;

  const content = document.body.querySelector<HTMLElement>('#closing-content');

  if (!isDefined(content)) {
    throw new Error('Missing #closing-content element');
  }

  return getDropdownTabOutTarget({ content, rootTriggerId: 'root-trigger' });
};

describe('getDropdownTabOutTarget', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('returns the first tabbable element after the root trigger', () => {
    const target = getTabOutTarget(`
      <button id="previous">Previous</button>
      <button id="root-trigger"><span tabindex="0">Badge</span></button>
      <button id="next">Next</button>
      <div data-dropdown-content id="closing-content"><button>CSV</button></div>
    `);

    expect(target?.id).toBe('next');
  });

  it('skips the closing dropdown contents and elements outside the tab order', () => {
    const target = getTabOutTarget(`
      <button id="root-trigger">Record actions</button>
      <span aria-hidden="true" tabindex="0"></span>
      <div data-dropdown-content id="closing-content"><button>CSV</button></div>
      <button disabled>Disabled</button>
      <div tabindex="-1">Not tabbable</div>
      <input type="hidden" />
      <div inert><button>Inert</button></div>
      <a id="next" href="#next">Next</a>
    `);

    expect(target?.id).toBe('next');
  });

  it('keeps focus in an outer dropdown that contains the root trigger', () => {
    const target = getTabOutTarget(`
      <div data-dropdown-content>
        <button id="root-trigger">Field actions</button>
        <input id="search" aria-label="Search fields" />
      </div>
      <div data-dropdown-content id="closing-content"><button>CSV</button></div>
    `);

    expect(target?.id).toBe('search');
  });

  it('returns undefined when the root trigger is missing or nothing follows it', () => {
    expect(
      getTabOutTarget(
        '<div data-dropdown-content id="closing-content"><button>CSV</button></div>',
      ),
    ).toBeUndefined();
    expect(
      getTabOutTarget(`
        <button id="next">Next</button>
        <button id="root-trigger">Record actions</button>
        <div data-dropdown-content id="closing-content"><button>CSV</button></div>
      `),
    ).toBeUndefined();
  });
});
