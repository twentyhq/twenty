import { randomUUID } from 'node:crypto';

import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

const EMAIL_PREFIX = `rest-canonical-${randomUUID()}`;

describe('REST EMAILS domain canonicalization (integration)', () => {
  let personId: string;

  afterAll(async () => {
    if (personId) {
      await makeRestAPIRequest({
        method: 'delete',
        path: `/people/${personId}`,
      });
    }
  });

  it('canonicalizes primary and additional email values on create', async () => {
    const response = await makeRestAPIRequest({
      method: 'post',
      path: '/people',
      body: {
        emails: {
          primaryEmail: `${EMAIL_PREFIX.toUpperCase()}@💩。LA.`,
          additionalEmails: [`${EMAIL_PREFIX}-other@München．DE.`],
        },
      },
    });

    expect(response.status).toBe(201);
    personId = response.body.data.createPerson.id;
    expect(response.body.data.createPerson.emails).toEqual({
      primaryEmail: `${EMAIL_PREFIX}@xn--ls8h.la`,
      additionalEmails: [`${EMAIL_PREFIX}-other@xn--mnchen-3ya.de`],
    });
  });

  it('canonicalizes both email subfields on update', async () => {
    const response = await makeRestAPIRequest({
      method: 'patch',
      path: `/people/${personId}`,
      body: {
        emails: {
          primaryEmail: `${EMAIL_PREFIX}@MÜNCHEN｡DE.`,
          additionalEmails: [`${EMAIL_PREFIX}-other@💩．LA.`],
        },
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.data.updatePerson.emails).toEqual({
      primaryEmail: `${EMAIL_PREFIX}@xn--mnchen-3ya.de`,
      additionalEmails: [`${EMAIL_PREFIX}-other@xn--ls8h.la`],
    });
  });
});
