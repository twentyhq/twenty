import { recordTrialCard } from './record-trial-card';
import { TRIAL_CARD_RECORD_OUTCOME } from './trial-card-record-outcome';

const SUBSCRIPTION_ID = 'sub_new';
const PRIOR_SUBSCRIPTION_ID = 'sub_previous';
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

describe('recordTrialCard', () => {
  it('flags a card that already trialed elsewhere, without touching the trial', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { stripe, update, search } = stripeWith({
      subscription: trialingSubscription(),
      searchResults: [{ id: PRIOR_SUBSCRIPTION_ID }],
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.REPEAT_FLAGGED);

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith({
      query: `metadata['trialCardFingerprint']:'${FINGERPRINT}'`,
      limit: 2,
    });
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: {
        trialCardFingerprint: FINGERPRINT,
        priorTrialSubscriptionId: PRIOR_SUBSCRIPTION_ID,
      },
    });
  });

  it('never ends a trial the customer was shown', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { stripe, update } = stripeWith({
      subscription: trialingSubscription(),
      searchResults: [{ id: PRIOR_SUBSCRIPTION_ID }],
    });

    await recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID });

    expect(update.mock.calls[0][1]).not.toHaveProperty('trial_end');
  });

  it('records a first-time card without flagging it', async () => {
    const { stripe, update } = stripeWith({
      subscription: trialingSubscription(),
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.FIRST_TRIAL_FOR_CARD);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });

  it('does not flag itself when the search returns only this subscription', async () => {
    const { stripe, update } = stripeWith({
      subscription: trialingSubscription(),
      searchResults: [{ id: SUBSCRIPTION_ID }],
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.FIRST_TRIAL_FOR_CARD);

    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });

  it('is idempotent across webhook redeliveries', async () => {
    const { stripe, search, update } = stripeWith({
      subscription: trialingSubscription({
        trialCardFingerprint: FINGERPRINT,
      }),
      searchResults: [{ id: PRIOR_SUBSCRIPTION_ID }],
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.ALREADY_RECORDED);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('leaves a subscription that is not trialing alone', async () => {
    const { stripe, search, update } = stripeWith({
      subscription: { ...trialingSubscription(), status: 'active' },
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.NOT_TRIALING);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    [null, 'no payment method'],
    ['pm_123', 'an unexpanded payment method'],
    [{ card: null }, 'a non-card payment method'],
    [{ card: { fingerprint: null } }, 'a card without a fingerprint'],
    [{ card: { fingerprint: "' OR 1:'1" } }, 'an unsearchable fingerprint'],
  ])('records nothing for %s (%s)', async (defaultPaymentMethod, _label) => {
    const { stripe, search, update } = stripeWith({
      subscription: {
        ...trialingSubscription(),
        default_payment_method: defaultPaymentMethod,
      },
    });

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.CARD_UNKNOWN);

    expect(search).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('still stamps the card when the prior-trial lookup fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { stripe, search, update } = stripeWith({
      subscription: trialingSubscription(),
    });
    search.mockRejectedValue(new Error('stripe is down'));

    await expect(
      recordTrialCard({ stripe, subscriptionId: SUBSCRIPTION_ID }),
    ).resolves.toBe(TRIAL_CARD_RECORD_OUTCOME.FIRST_TRIAL_FOR_CARD);

    expect(search).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(SUBSCRIPTION_ID, {
      metadata: { trialCardFingerprint: FINGERPRINT },
    });
  });
});
