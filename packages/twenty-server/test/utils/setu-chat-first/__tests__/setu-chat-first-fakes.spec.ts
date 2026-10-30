import {
  createFakeEmailProvider,
  FakeEmailProviderTimeoutError,
  type FakeEmailMessage,
} from 'test/utils/setu-chat-first/fake-email-provider';
import {
  createFakeSearchProvider,
  FAKE_SEARCH_PROMPT_INJECTION_RESULT,
} from 'test/utils/setu-chat-first/fake-search-provider';
import {
  SETU_CHAT_FIRST_PEOPLE,
  SETU_CHAT_FIRST_SENDER_EMAIL,
} from 'test/utils/setu-chat-first/setu-chat-first-crm.fixture';

const buildMessage = (idempotencyKey: string): FakeEmailMessage => ({
  idempotencyKey,
  from: SETU_CHAT_FIRST_SENDER_EMAIL,
  to: [SETU_CHAT_FIRST_PEOPLE.priya.email],
  subject: 'Restarting the expansion discussion',
  body: 'Hi Priya, would a 20-minute call next week be useful?',
});

describe('fake email provider', () => {
  it('accepts by default and records the provider message id', async () => {
    const provider = createFakeEmailProvider();

    const result = await provider.send(buildMessage('action-1:revision-1'));

    expect(result).toEqual({
      status: 'accepted',
      providerMessageId: 'fake-provider-message-1',
    });
    expect(provider.accepted).toHaveLength(1);
  });

  it('keeps a message accepted when the call times out after acceptance', async () => {
    const provider = createFakeEmailProvider();

    provider.setNextOutcomes(['timeout-after-accept']);

    await expect(
      provider.send(buildMessage('action-2:revision-1')),
    ).rejects.toBeInstanceOf(FakeEmailProviderTimeoutError);
    expect(
      provider.findAcceptedByIdempotencyKey('action-2:revision-1'),
    ).toEqual({ providerMessageId: 'fake-provider-message-1' });
  });

  it('accepts nothing when the call times out before acceptance', async () => {
    const provider = createFakeEmailProvider();

    provider.setNextOutcomes(['timeout-before-accept']);

    await expect(
      provider.send(buildMessage('action-3:revision-1')),
    ).rejects.toBeInstanceOf(FakeEmailProviderTimeoutError);
    expect(
      provider.findAcceptedByIdempotencyKey('action-3:revision-1'),
    ).toBeUndefined();
  });

  it('reports a definite rejection without accepting', async () => {
    const provider = createFakeEmailProvider();

    provider.setNextOutcomes(['reject']);

    const result = await provider.send(buildMessage('action-4:revision-1'));

    expect(result).toEqual({
      status: 'rejected',
      errorCode: 'RECIPIENT_REJECTED',
    });
    expect(provider.accepted).toHaveLength(0);
  });

  it('uses only reserved example domains in fixtures', () => {
    const addresses = [
      SETU_CHAT_FIRST_SENDER_EMAIL,
      ...Object.values(SETU_CHAT_FIRST_PEOPLE).map((person) => person.email),
    ];

    for (const address of addresses) {
      expect(address).toMatch(/@([a-z-]+\.)*example\.(com|org|net)$/);
    }
  });
});

describe('fake search provider', () => {
  it('returns both Orbit matches so research must ask which one', async () => {
    const provider = createFakeSearchProvider();

    const results = await provider.search('Orbit company overview');

    expect(results.map((result) => result.url)).toEqual([
      'https://orbit.example.com/about',
      'https://orbit-systems.example.org/about',
    ]);
  });

  it('includes untrusted instruction-like content for Acme', async () => {
    const provider = createFakeSearchProvider();

    const results = await provider.search('acme news');

    expect(results).toContainEqual(FAKE_SEARCH_PROMPT_INJECTION_RESULT);
    expect(provider.queries).toEqual(['acme news']);
  });
});
