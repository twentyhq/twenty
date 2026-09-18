import { enforceTrialEligibility } from './enforce-trial-eligibility';
import { TRIAL_ELIGIBILITY_OUTCOME } from './trial-eligibility-outcome';

const SUBSCRIPTION_ID = 'sub_new';
const FINGERPRINT = 'Xt5EWLLDS7FJjR1c';

const stripeWith = ({
  subscription,
  searchResults = [],
}: {
  subscription: unknown;
  searchResults?: unknown[];
}) => {
  const retrieve = jest.fn().mockResolvedValue(subscription);
  const search = jest.fn().mockResolvedValue({ data: searchResults });
  const update = jest.fn().mockResolvedValue({});

  return {
    stripe: { subscriptions: { retrieve, search, update } },
    retrieve,
    search,
    update,
  };
};

const trialingSubscription = (metadata: Record<string, string> = {}) => ({
  id: SUBSCRIPTION_ID,
  status: 'trialing',
  metadata,
  default_payment_method: { card: { fingerprint: FINGERPRINT } },
});

describe('enforceTrialEligibility', () => {
  it('ends the trial when the card already consumed one', async () => {
    const { stripe, update, search } = stripeWith({
      subscription: trialingSubscription(),
      searchResults: [{ id: 'sub_previous' }],
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.TRIAL_ENDED);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({
      query: `metadata['trialCardFingerprint']:'${FINGERPRINT}'`,
      limit: 2,
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
      trial_end: 'now',
    });
  });

  it('keeps the trial and stamps the card when it is the first one', async () => {
    const { stripe, update } = stripeWith({
      subscription: trialingSubscription(),
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.TRIAL_KEPT);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });

  it('does not end its own trial when the search returns only itself', async () => {
    const { stripe, update } = stripeWith({
      subscription: trialingSubscription(),
      searchResults: [{ id: SUBSCRIPTION_ID }],
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.TRIAL_KEPT);

    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });

  it('is idempotent across webhook redeliveries', async () => {
    const { stripe, search, update } = stripeWith({
      subscription: trialingSubscription({
        trialCardFingerprint: FINGERPRINT,
      }),
      searchResults: [{ id: 'sub_previous' }],
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.ALREADY_ENFORCED);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves a subscription that is not trialing alone', async () => {
    const { stripe, search, update } = stripeWith({
      subscription: { ...trialingSubscription(), status: 'active' },
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.NOT_TRIALING);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    [null, 'no payment method'],
    ['pm_123', 'an unexpanded payment method'],
    [{ card: null }, 'a non-card payment method'],
    [{ card: { fingerprint: null } }, 'a card without a fingerprint'],
    [{ card: { fingerprint: "' OR 1:'1" } }, 'an unsearchable fingerprint'],
  ])('cannot enforce with %s (%s)', async (defaultPaymentMethod, _label) => {
    const { stripe, search, update } = stripeWith({
      subscription: {
        ...trialingSubscription(),
        default_payment_method: defaultPaymentMethod,
      },
    });

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.CARD_UNKNOWN);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('keeps the trial when the prior-trial lookup fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { stripe, search, update } = stripeWith({
      subscription: trialingSubscription(),
    });
    search.mockRejectedValue(new Error('stripe is down'));

    await expect(
      enforceTrialEligibility({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_ELIGIBILITY_OUTCOME.TRIAL_KEPT);

    expect(search).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });
});
