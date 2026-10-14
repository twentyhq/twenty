import { createDropdownRowRegistry } from '../internal/createDropdownRowRegistry';
import { type DropdownRowRegistration } from '../internal/DropdownRowRegistration';
import { getDropdownPageType } from '../internal/getDropdownPageType';
import { getDropdownSearch } from '../internal/getDropdownSearch';
import { getEnabledDropdownRows } from '../internal/getEnabledDropdownRows';
import { hasMovedDropdownNode } from '../internal/hasMovedDropdownNode';
import { registerDropdownPage } from '../internal/registerDropdownPage';
import { registerDropdownRow } from '../internal/registerDropdownRow';
import { registerDropdownSearch } from '../internal/registerDropdownSearch';

const createRegistration = ({
  label,
  disabled = false,
}: {
  label: string;
  disabled?: boolean;
}): DropdownRowRegistration => {
  const element = document.createElement('button');
  element.textContent = label;

  return {
    id: label,
    kind: 'option',
    disabled,
    elementRef: { current: element },
  };
};

describe('Dropdown row registry', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('returns enabled connected rows in document order', () => {
    const rowRegistry = createDropdownRowRegistry();
    const first = createRegistration({ label: 'First' });
    const disabled = createRegistration({ label: 'Disabled', disabled: true });
    const last = createRegistration({ label: 'Last' });
    const detached = createRegistration({ label: 'Detached' });

    for (const registration of [first, disabled, last]) {
      if (registration.elementRef.current) {
        document.body.append(registration.elementRef.current);
      }
    }

    for (const registration of [last, detached, disabled, first]) {
      registerDropdownRow({ rowRegistry, registration });
    }

    expect(getEnabledDropdownRows(rowRegistry).map((row) => row.id)).toEqual([
      'First',
      'Last',
    ]);
  });

  it('reads the element a row currently renders', () => {
    const rowRegistry = createDropdownRowRegistry();
    const registration = createRegistration({ label: 'Row' });
    const replacement = document.createElement('a');

    document.body.append(replacement);
    registerDropdownRow({ rowRegistry, registration });
    registration.elementRef.current = replacement;

    expect(getEnabledDropdownRows(rowRegistry)[0]?.element).toBe(replacement);
  });

  it('notifies listeners when rows and searches register and unregister', () => {
    const rowRegistry = createDropdownRowRegistry();
    const listener = vi.fn();
    const search = document.createElement('input');

    rowRegistry.listeners.add(listener);
    document.body.append(search);

    const unregisterRow = registerDropdownRow({
      rowRegistry,
      registration: createRegistration({ label: 'Row' }),
    });
    const unregisterSearch = registerDropdownSearch({
      rowRegistry,
      searchRef: { current: search },
    });

    expect(getDropdownSearch(rowRegistry)).toBe(search);

    unregisterRow();
    unregisterSearch();

    expect(rowRegistry.rows.size).toBe(0);
    expect(getDropdownSearch(rowRegistry)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('reads the type of the connected page with the given id', () => {
    const rowRegistry = createDropdownRowRegistry();
    const rootPage = document.createElement('div');
    const editPage = document.createElement('div');

    document.body.append(rootPage, editPage);
    registerDropdownPage({
      rowRegistry,
      page: { id: 'root', type: 'menu', elementRef: { current: rootPage } },
    });
    registerDropdownPage({
      rowRegistry,
      page: { id: 'edit', type: 'panel', elementRef: { current: editPage } },
    });

    expect(getDropdownPageType({ rowRegistry, pageId: 'edit' })).toBe('panel');
    expect(getDropdownPageType({ rowRegistry, pageId: 'missing' })).toBe(
      undefined,
    );
  });

  it('detects moved nodes but not removed ones', () => {
    const list = document.createElement('div');
    const first = document.createElement('div');
    const second = document.createElement('div');

    list.append(first, second);
    document.body.append(list);

    const observer = new MutationObserver(() => {});

    observer.observe(list, { childList: true });
    list.append(first);
    expect(hasMovedDropdownNode(observer.takeRecords())).toBe(true);

    second.remove();
    expect(hasMovedDropdownNode(observer.takeRecords())).toBe(false);
    observer.disconnect();
  });
});
