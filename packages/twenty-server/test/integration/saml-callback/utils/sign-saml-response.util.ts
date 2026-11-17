import crypto from 'node:crypto';

import { SignedXml } from 'xml-crypto';

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3000';

const buildLoginUrl = (identityProviderId: string) =>
  `${SERVER_URL}/auth/saml/login/${identityProviderId}`;

export const buildSamlCallbackUrl = (identityProviderId: string) =>
  `${SERVER_URL}/auth/saml/callback/${identityProviderId}`;

type SignSamlResponseArgs = {
  identityProviderId: string;
  email: string;
  privateKeyPem: string;
  certificatePem: string;
};

// Builds a SAML Response whose Assertion carries the given email as NameID and
// is signed (enveloped) with the given private key, the way @node-saml
// accepts it: audience is the SP entity id Twenty derives from SERVER_URL, the
// assertion has a unique ID, and a bearer SubjectConfirmation with NotOnOrAfter.
export const signSamlResponse = ({
  identityProviderId,
  email,
  privateKeyPem,
  certificatePem,
}: SignSamlResponseArgs): string => {
  const nowMs = Date.now();
  const issueInstant = new Date(nowMs).toISOString();
  const notBefore = new Date(nowMs - 60_000).toISOString();
  const notOnOrAfter = new Date(nowMs + 5 * 60_000).toISOString();
  const assertionId = '_' + crypto.randomBytes(16).toString('hex');
  const responseId = '_' + crypto.randomBytes(16).toString('hex');

  const audience = buildLoginUrl(identityProviderId);
  const callbackUrl = buildSamlCallbackUrl(identityProviderId);

  const assertionXml =
    `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ` +
    `Version="2.0" ID="${assertionId}" IssueInstant="${issueInstant}">` +
    `<saml:Issuer>self-signed-idp</saml:Issuer>` +
    `<saml:Subject>` +
    `<saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${email}</saml:NameID>` +
    `<saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">` +
    `<saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${callbackUrl}"/>` +
    `</saml:SubjectConfirmation>` +
    `</saml:Subject>` +
    `<saml:Conditions NotBefore="${notBefore}" NotOnOrAfter="${notOnOrAfter}">` +
    `<saml:AudienceRestriction><saml:Audience>${audience}</saml:Audience></saml:AudienceRestriction>` +
    `</saml:Conditions>` +
    `<saml:AuthnStatement AuthnInstant="${issueInstant}" SessionIndex="${assertionId}">` +
    `<saml:AuthnContext>` +
    `<saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef>` +
    `</saml:AuthnContext>` +
    `</saml:AuthnStatement>` +
    `</saml:Assertion>`;

  const signature = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certificatePem,
    signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
  });

  signature.addReference({
    xpath: `//*[local-name(.)='Assertion']`,
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  });

  signature.computeSignature(assertionXml, {
    location: { reference: `//*[local-name(.)='Issuer']`, action: 'after' },
  });

  const signedAssertion = signature.getSignedXml();

  const responseXml =
    `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ` +
    `xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ` +
    `Version="2.0" ID="${responseId}" IssueInstant="${issueInstant}" Destination="${callbackUrl}">` +
    `<saml:Issuer>self-signed-idp</saml:Issuer>` +
    `<samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status>` +
    signedAssertion +
    `</samlp:Response>`;

  return Buffer.from(responseXml, 'utf8').toString('base64');
};
