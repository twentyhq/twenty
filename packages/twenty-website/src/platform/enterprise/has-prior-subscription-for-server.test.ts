import type Stripe from 'stripe';

import { hasPriorSubscriptionForServer } from './has-prior-subscription-for-server';

const SERVER_ID = 'cf9dbd56-fdd5-45d1-80c1-1b22bb1ad994';

const stripeReturning = (
  data: unknown[],
  search = jest.fn(),
): { stripe: Stripe; search: jest.Mock } => {
  search.mockResolvedValue({ data });

  return {
    stripe: { subscriptions: { search } } as unknown as Stripe,
    search,
  };
};

describe('hasPriorSubscriptionForServer', () => {
  it('reports a prior subscription bound to the same server', async () => {
    const { stripe, search } = stripeReturning([{ id: 'sub_old' }]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(true);

    expect(search).toHaveBeenCalledWith({
      query: `metadata['boundServerId']:'${SERVER_ID}'`,
      limit: 1,
    });
  });

  it('reports no prior subscription for a first-time server', async () => {
    const { stripe } = stripeReturning([]);

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(false);
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
    const search = jest.fn().mockRejectedValue(new Error('stripe is down'));
    const stripe = { subscriptions: { search } } as unknown as Stripe;

    await expect(
      hasPriorSubscriptionForServer({ stripe, serverId: SERVER_ID }),
    ).resolves.toBe(false);
  });
});
