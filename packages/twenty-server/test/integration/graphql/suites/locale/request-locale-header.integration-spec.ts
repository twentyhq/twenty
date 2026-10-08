import request from 'supertest';

const SERVER_URL = `http://localhost:${APP_PORT}`;

const queryCurrentUserWithLocaleHeader = (locale: string) =>
  request(SERVER_URL)
    .post('/metadata')
    .set('x-locale', locale)
    .send({ query: 'query { currentUser { id } }' })
    .expect(200);

describe('x-locale request header (integration)', () => {
  it('translates errors into a supported locale', async () => {
    const response = await queryCurrentUserWithLocaleHeader('fr-FR');

    expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    expect(response.body.errors[0].extensions.userFriendlyMessage).toBe(
      'Vous devez être authentifié pour effectuer cette action.',
    );
  });

  it.each(['xx', 'xx-YY', 'toString', 'constructor'])(
    'falls back to the source locale for unsupported locale %s',
    async (locale) => {
      const response = await queryCurrentUserWithLocaleHeader(locale);

      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
      expect(response.body.errors[0].extensions.userFriendlyMessage).toBe(
        'You must be authenticated to perform this action.',
      );
    },
  );
});
