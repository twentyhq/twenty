import { createSign, generateKeyPairSync, randomUUID } from 'node:crypto';

import { http, HttpResponse } from 'msw';

import { type MswHandler } from 'test/integration/utils/http-mock.util';

// The SNS validator fetches the signing certificate over https and verifies the
// canonical string with it. Node's verify() accepts a bare public key, so the
// suite serves one at a URL matching the validator's amazonaws.com pattern
// instead of minting a real X.509 certificate.
export const SNS_SIGNING_CERT_URL =
  'https://sns.eu-west-3.amazonaws.com/SimpleNotificationService-abcdef0123456789abcdef0123456789.pem';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const publicKeyPem = publicKey
  .export({ type: 'spki', format: 'pem' })
  .toString();

const SIGNED_KEYS_BY_TYPE = {
  Notification: [
    'Message',
    'MessageId',
    'Subject',
    'Timestamp',
    'TopicArn',
    'Type',
  ],
  SubscriptionConfirmation: [
    'Message',
    'MessageId',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ],
  UnsubscribeConfirmation: [
    'Message',
    'MessageId',
    'SubscribeURL',
    'Timestamp',
    'Token',
    'TopicArn',
    'Type',
  ],
} as const;

export const snsSigningCertHandler = (): MswHandler =>
  http.get(SNS_SIGNING_CERT_URL, () => HttpResponse.text(publicKeyPem));

type SnsPayloadType = keyof typeof SIGNED_KEYS_BY_TYPE;

const signPayload = (
  type: SnsPayloadType,
  payload: Record<string, string>,
): string => {
  const signer = createSign('sha256WithRSAEncryption');

  for (const key of SIGNED_KEYS_BY_TYPE[type]) {
    if (key in payload) {
      signer.write(`${key}\n${payload[key]}\n`);
    }
  }

  signer.end();

  return signer.sign(privateKey, 'base64');
};

export const snsNotification = ({
  topicArn,
  message,
  signed = true,
}: {
  topicArn: string;
  message: unknown;
  signed?: boolean;
}): Record<string, string> => {
  const payload: Record<string, string> = {
    Type: 'Notification',
    MessageId: randomUUID(),
    TopicArn: topicArn,
    Message: JSON.stringify(message),
    Timestamp: '2026-01-01T00:00:00.000Z',
    SignatureVersion: '2',
    SigningCertURL: SNS_SIGNING_CERT_URL,
  };

  return {
    ...payload,
    Signature: signed
      ? signPayload('Notification', payload)
      : Buffer.from('not-a-signature').toString('base64'),
  };
};

export const snsSubscriptionConfirmation = ({
  topicArn,
  subscribeUrl,
}: {
  topicArn: string;
  subscribeUrl: string;
}): Record<string, string> => {
  const payload: Record<string, string> = {
    Type: 'SubscriptionConfirmation',
    MessageId: randomUUID(),
    TopicArn: topicArn,
    Token: randomUUID().replace(/-/g, ''),
    SubscribeURL: subscribeUrl,
    Message: 'You have chosen to subscribe to the topic.',
    Timestamp: '2026-01-01T00:00:00.000Z',
    SignatureVersion: '2',
    SigningCertURL: SNS_SIGNING_CERT_URL,
  };

  return {
    ...payload,
    Signature: signPayload('SubscriptionConfirmation', payload),
  };
};
