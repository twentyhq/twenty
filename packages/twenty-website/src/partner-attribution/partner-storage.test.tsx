import { readSavedPartner, savePartner } from './partner-storage';

const DAY_MS = 24 * 60 * 60 * 1000;
const CLICKED_AT = Date.UTC(2026, 10, 3);

describe('partner storage', () => {
  afterEach(() => localStorage.clear());

  it('should keep the partner of a click for 30 days', () => {
    savePartner('northwind', CLICKED_AT);

    expect(readSavedPartner(CLICKED_AT + 29 * DAY_MS)).toBe('northwind');
    expect(readSavedPartner(CLICKED_AT + 31 * DAY_MS)).toBeNull();
  });

  it('should give the credit to the latest click', () => {
    savePartner('northwind', CLICKED_AT);
    savePartner('acme', CLICKED_AT + DAY_MS);

    expect(readSavedPartner(CLICKED_AT + 2 * DAY_MS)).toBe('acme');
  });

  it('should ignore a value saved in another format', () => {
    localStorage.setItem('partner', 'northwind');

    expect(readSavedPartner(CLICKED_AT)).toBeNull();
  });
});
