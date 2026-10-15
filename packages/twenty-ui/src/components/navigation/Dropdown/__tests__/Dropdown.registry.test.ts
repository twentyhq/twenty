import { isDefined } from '@ui/utilities/utils/isDefined';

import { createDropdownRegistry } from '../internal/createDropdownRegistry';
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

describe('Dropdown registry', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('returns enabled connected rows in document order', () => {
    const registry = createDropdownRegistry();
    const first = createRegistration({ label: 'First' });
    const disabled = createRegistration({ label: 'Disabled', disabled: true });
    const last = createRegistration({ label: 'Last' });
    const detached = createRegistration({ label: 'Detached' });

    for (const registration of [first, disabled, last]) {
      if (isDefined(registration.elementRef.current)) {
        document.body.append(registration.elementRef.current);
      }
    }

    for (const registration of [last, detached, disabled, first]) {
      registerDropdownRow({ registry, registration });
    }

    expect(getEnabledDropdownRows(registry).map((row) => row.id)).toEqual([
      'First',
      'Last',
    ]);
  });

  it('reads the element a row currently renders', () => {
    const registry = createDropdownRegistry();
    const registration = createRegistration({ label: 'Row' });
    const replacement = document.createElement('a');

    document.body.append(replacement);
    registerDropdownRow({ registry, registration });
    registration.elementRef.current = replacement;

    expect(getEnabledDropdownRows(registry)[0]?.element).toBe(replacement);
  });

  it('notifies listeners when rows and searches register and unregister', () => {
    const registry = createDropdownRegistry();
    const listener = vi.fn();
    const search = document.createElement('input');

    registry.listeners.add(listener);
    document.body.append(search);

    const unregisterRow = registerDropdownRow({
      registry,
      registration: createRegistration({ label: 'Row' }),
    });
    const unregisterSearch = registerDropdownSearch({
      registry,
      searchRef: { current: search },
    });

    expect(getDropdownSearch(registry)).toBe(search);

    unregisterRow();
    unregisterSearch();

    expect(registry.rows.size).toBe(0);
    expect(getDropdownSearch(registry)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it('reads the type of the connected page with the given id', () => {
    const registry = createDropdownRegistry();
    const rootPage = document.createElement('div');
    const editPage = document.createElement('div');

    document.body.append(rootPage, editPage);
    registerDropdownPage({
      registry,
      page: { id: 'root', type: 'menu', elementRef: { current: rootPage } },
    });
    registerDropdownPage({
      registry,
      page: { id: 'edit', type: 'panel', elementRef: { current: editPage } },
    });

    expect(getDropdownPageType({ registry, pageId: 'edit' })).toBe('panel');
    expect(getDropdownPageType({ registry, pageId: 'missing' })).toBe(
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
