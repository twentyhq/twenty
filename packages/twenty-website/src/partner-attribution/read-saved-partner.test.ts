import { PARTNER_ATTRIBUTION_WINDOW_DAYS } from './partner-attribution-window-days';
import { readSavedPartner } from './read-saved-partner';
import { savePartner } from './save-partner';
import { PARTNER_STORAGE_KEY } from './partner-storage-key';

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const CLICKED_AT = Date.UTC(2026, 10, 3);

const createStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
};

describe('readSavedPartner', () => {
  it('returns the code until the end of the attribution window', () => {
    const storage = createStorage();

    savePartner({ storage, code: 'NORTHWIND', now: CLICKED_AT });

    expect(
      readSavedPartner({
        storage,
        now: CLICKED_AT + PARTNER_ATTRIBUTION_WINDOW_DAYS * DAY_IN_MILLISECONDS,
      }),
    ).toBe('NORTHWIND');
  });

  it('forgets the code once the attribution window has passed', () => {
    const storage = createStorage();

    savePartner({ storage, code: 'NORTHWIND', now: CLICKED_AT });

    expect(
      readSavedPartner({
        storage,
        now:
          CLICKED_AT +
          (PARTNER_ATTRIBUTION_WINDOW_DAYS + 1) * DAY_IN_MILLISECONDS,
      }),
    ).toBeNull();
    expect(storage.getItem(PARTNER_STORAGE_KEY)).toBeNull();
  });

  it('keeps the last link clicked, with a fresh window', () => {
    const storage = createStorage();

    savePartner({ storage, code: 'NORTHWIND', now: CLICKED_AT });
    savePartner({
      storage,
      code: 'CONTOSO',
      now: CLICKED_AT + 20 * DAY_IN_MILLISECONDS,
    });

    expect(
      readSavedPartner({ storage, now: CLICKED_AT + 45 * DAY_IN_MILLISECONDS }),
    ).toBe('CONTOSO');
  });

  it('ignores a value saved in an older format', () => {
    const storage = createStorage();

    storage.setItem(PARTNER_STORAGE_KEY, 'NORTHWIND');

    expect(readSavedPartner({ storage, now: CLICKED_AT })).toBeNull();
  });
});
