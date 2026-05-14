import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import * as jwt from 'jsonwebtoken';
import { decodeJwtCompleteOrThrow } from 'test/integration/graphql/utils/decode-jwt-complete-or-throw.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';

import {
  PREVIOUS_PRIVATE_KEY_PEM,
  PREVIOUS_PUBLIC_KEY_PEM,
} from './jwt-key-rotation.fixture';

const GET_SIGNING_KEYS = gql`
  query GetSigningKeys {
    getSigningKeys {
      signingKeys {
        id
        publicKey
        isCurrent
        createdAt
        revokedAt
        verifyCountInWindow
      }
      legacyVerifyCountInWindow
      verifyWindowDays
    }
  }
`;

const REVOKE_SIGNING_KEY = gql`
  mutation RevokeSigningKey($id: UUID!) {
    revokeSigningKey(id: $id) {
      id
      isCurrent
      revokedAt
    }
  }
`;

describe('Admin panel signing keys (integration)', () => {
  it('exposes signing keys with current marker and a 7-day window', async () => {
    const response = await makeAdminPanelAPIRequest({
      query: GET_SIGNING_KEYS,
    });

    expect(response.body.errors).toBeUndefined();

    const payload = response.body.data?.getSigningKeys;

    expect(payload).toBeDefined();
    expect(payload.verifyWindowDays).toBe(7);
    expect(Array.isArray(payload.signingKeys)).toBe(true);
    expect(payload.signingKeys.length).toBeGreaterThan(0);

    const currentKeys = payload.signingKeys.filter(
      (signingKey: { isCurrent: boolean }) => signingKey.isCurrent === true,
    );

    expect(currentKeys).toHaveLength(1);
    expect(currentKeys[0].revokedAt).toBeNull();
    expect(typeof currentKeys[0].publicKey).toBe('string');
    expect(typeof payload.legacyVerifyCountInWindow).toBe('number');
  });

  it('revokes a non-current signing key, keeps the current key active, and rejects tokens signed with the revoked kid', async () => {
    const seededRow = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const seededCurrentKid: string = seededRow[0].id;

    const obsoleteKid = randomUUID();

    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent")
       VALUES ($1, $2, NULL, false)`,
      [obsoleteKid, PREVIOUS_PUBLIC_KEY_PEM],
    );

    const response = await makeAdminPanelAPIRequest({
      query: REVOKE_SIGNING_KEY,
      variables: { id: obsoleteKid },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.revokeSigningKey?.id).toBe(obsoleteKid);
    expect(response.body.data?.revokeSigningKey?.isCurrent).toBe(false);
    expect(response.body.data?.revokeSigningKey?.revokedAt).not.toBeNull();

    const stillCurrentRows = await global.testDataSource.query(
      `SELECT "id", "isCurrent", "revokedAt" FROM core."signingKey"
       WHERE "id" = $1`,
      [seededCurrentKid],
    );

    expect(stillCurrentRows[0].isCurrent).toBe(true);
    expect(stillCurrentRows[0].revokedAt).toBeNull();

    const tokenSignedByRevokedKey = jwt.sign(
      { sub: 'irrelevant' },
      PREVIOUS_PRIVATE_KEY_PEM,
      { algorithm: 'ES256', keyid: obsoleteKid, expiresIn: '5m' },
    );

    const { data: userAfterRevoke, errors: userAfterRevokeErrors } =
      await getCurrentUser({
        accessToken: tokenSignedByRevokedKey,
        expectToFail: true,
      });

    expect(userAfterRevoke?.currentUser).toBeFalsy();
    expect(userAfterRevokeErrors).toBeDefined();

    await global.testDataSource.query(
      `DELETE FROM core."signingKey" WHERE "id" = $1`,
      [obsoleteKid],
    );
  });

  it('revokes the current signing key and the next sign mints a new current key', async () => {
    const before = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentKid: string = before[0].id;

    const response = await makeAdminPanelAPIRequest({
      query: REVOKE_SIGNING_KEY,
      variables: { id: previousCurrentKid },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data?.revokeSigningKey?.isCurrent).toBe(false);
    expect(response.body.data?.revokeSigningKey?.revokedAt).not.toBeNull();

    const uniqueEmail = `signing-key-revoke-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    const workspaceAgnosticToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await global.testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const { data: workspaceData } = await signUpInNewWorkspace({
      accessToken: workspaceAgnosticToken,
      expectToFail: false,
    });

    const subdomainUrl =
      workspaceData.signUpInNewWorkspace.workspace.workspaceUrls.subdomainUrl;
    const loginToken = workspaceData.signUpInNewWorkspace.loginToken.token;

    const { data: tokensData } = await getAuthTokensFromLoginToken({
      loginToken,
      origin: subdomainUrl,
      expectToFail: false,
    });

    const accessToken =
      tokensData.getAuthTokensFromLoginToken.tokens
        .accessOrWorkspaceAgnosticToken.token;
    const decoded = decodeJwtCompleteOrThrow(accessToken);

    expect(decoded.header.alg).toBe('ES256');
    expect(decoded.header.kid).not.toBe(previousCurrentKid);

    const { errors } = await getCurrentUser({
      accessToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    try {
      await deleteUser({ accessToken, expectToFail: false });
    } catch {
      /* */
    }
  });
});
