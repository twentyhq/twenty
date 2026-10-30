// Deterministic stand-in for an outbound mail provider. The outcomes mirror
// the cases the durable action worker must survive: definite acceptance,
// definite rejection, and a timeout where the provider may or may not have
// accepted the message.

export type FakeEmailMessage = {
  idempotencyKey: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
};

export type FakeEmailOutcome =
  | 'accept'
  | 'reject'
  | 'timeout-after-accept'
  | 'timeout-before-accept';

export type FakeEmailSendResult =
  | { status: 'accepted'; providerMessageId: string }
  | { status: 'rejected'; errorCode: string };

export type FakeEmailProvider = {
  send: (message: FakeEmailMessage) => Promise<FakeEmailSendResult>;
  findAcceptedByIdempotencyKey: (
    idempotencyKey: string,
  ) => { providerMessageId: string } | undefined;
  setNextOutcomes: (outcomes: FakeEmailOutcome[]) => void;
  attempts: FakeEmailMessage[];
  accepted: (FakeEmailMessage & { providerMessageId: string })[];
};

export class FakeEmailProviderTimeoutError extends Error {
  constructor() {
    super('Fake email provider timed out');
    this.name = 'FakeEmailProviderTimeoutError';
  }
}

export const createFakeEmailProvider = (): FakeEmailProvider => {
  const attempts: FakeEmailMessage[] = [];
  const accepted: (FakeEmailMessage & { providerMessageId: string })[] = [];
  let pendingOutcomes: FakeEmailOutcome[] = [];

  const accept = (message: FakeEmailMessage) => {
    const providerMessageId = `fake-provider-message-${accepted.length + 1}`;

    accepted.push({ ...message, providerMessageId });

    return providerMessageId;
  };

  return {
    attempts,
    accepted,
    setNextOutcomes: (outcomes) => {
      pendingOutcomes = [...outcomes];
    },
    findAcceptedByIdempotencyKey: (idempotencyKey) => {
      const match = accepted.find(
        (message) => message.idempotencyKey === idempotencyKey,
      );

      return match ? { providerMessageId: match.providerMessageId } : undefined;
    },
    send: async (message) => {
      attempts.push(message);

      const outcome = pendingOutcomes.shift() ?? 'accept';

      switch (outcome) {
        case 'accept':
          return { status: 'accepted', providerMessageId: accept(message) };
        case 'reject':
          return { status: 'rejected', errorCode: 'RECIPIENT_REJECTED' };
        case 'timeout-after-accept':
          accept(message);
          throw new FakeEmailProviderTimeoutError();
        case 'timeout-before-accept':
          throw new FakeEmailProviderTimeoutError();
      }
    },
  };
};
