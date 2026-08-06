import { composeConnectionName } from 'src/modules/connection/utils/compose-connection-name.util';

describe('composeConnectionName', () => {
  it('joins both full names with the separator the import uses', () => {
    expect(
      composeConnectionName({
        personName: { firstName: 'Ada', lastName: 'Lovelace' },
        connectedToName: { firstName: 'Alan', lastName: 'Turing' },
      }),
    ).toBe('Ada Lovelace ↔ Alan Turing');
  });

  it('tolerates a missing last name on either side', () => {
    expect(
      composeConnectionName({
        personName: { firstName: 'Ada', lastName: '' },
        connectedToName: { firstName: 'Alan', lastName: 'Turing' },
      }),
    ).toBe('Ada ↔ Alan Turing');
  });

  it('returns undefined when either side has no usable name', () => {
    expect(
      composeConnectionName({
        personName: { firstName: '', lastName: '' },
        connectedToName: { firstName: 'Alan', lastName: 'Turing' },
      }),
    ).toBeUndefined();

    expect(
      composeConnectionName({
        personName: { firstName: 'Ada', lastName: 'Lovelace' },
        connectedToName: null,
      }),
    ).toBeUndefined();
  });
});
