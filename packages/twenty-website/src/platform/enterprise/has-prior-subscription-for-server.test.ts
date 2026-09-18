import { hasPriorSubscriptionForServer } from './has-prior-subscription-for-server';

const SERVER_ID = 'cf9dbd56-fdd5-45d1-80c1-1b22bb1ad994';
const EXPECTED_QUERY = `metadata['trialServerId']:'${SERVER_ID}' OR metadata['boundServerId']:'${SERVER_ID}'`;

const stripeReturning = (data: unknown[]) => {
  const search = jest.fn().mockResolvedValue({ data });

  return { stripe: { subscriptions: { search } }, search };
};

describe('hasPriorSubscriptionForServer', () => {
  it('reports a prior subscription bound to the same server', async () => {
    const { stripe, search } = stripeReturning([{ id: 'sub_old' }]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(true);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({ query: EXPECTED_QUERY, limit: 1 });
  });

  it('matches a server that consumed a trial and then released its binding', async () => {
    const { stripe, search } = stripeReturning([{ id: 'sub_released' }]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(true);

    expect(search.mock.calls[0][0].query).toContain(
      `metadata['trialServerId']:'${SERVER_ID}'`,
    );
  });

  it('reports no prior subscription for a first-time server', async () => {
    const { stripe, search } = stripeReturning([]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(false);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({ query: EXPECTED_QUERY, limit: 1 });
  });

  it.each([
    ["' OR metadata['boundServerId']:'*", 'quote injection'],
    ['', 'empty'],
    ['   ', 'whitespace'],
    [42, 'non-string'],
    [undefined, 'absent'],
  ])('never queries Stripe with %s (%s)', async (serverId, _label) => {
    const { stripe, search } = stripeReturning([{ id: 'sub_old' }]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId }),
    ).resolves.toBe(false);

    expect(search).not.toHaveBeenCalled();
  });

  it('grants the benefit of the doubt when the Stripe search fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const search = jest.fn().mockRejectedValue(new Error('stripe is down'));
    const stripe = { subscriptions: { search } };

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(false);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({ query: EXPECTED_QUERY, limit: 1 });
  });
});
