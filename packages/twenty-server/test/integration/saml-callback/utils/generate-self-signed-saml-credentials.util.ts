import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type SelfSignedSamlCredentials = {
  privateKeyPem: string;
  certificatePem: string;
  certificateBody: string;
};

// Generated in-test so no external identity provider or secret is needed
export const generateSelfSignedSamlCredentials =
  (): SelfSignedSamlCredentials => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'self-signed-saml-'));
    const keyPath = path.join(dir, 'key.pem');
    const certPath = path.join(dir, 'cert.pem');

    try {
      execFileSync(
        'openssl',
        [
          'req',
          '-x509',
          '-newkey',
          'rsa:2048',
          '-keyout',
          keyPath,
          '-out',
          certPath,
          '-days',
          '3650',
          '-nodes',
          '-subj',
          '/CN=self-signed-idp',
          '-sha256',
        ],
        { stdio: 'ignore' },
      );

      const privateKeyPem = fs.readFileSync(keyPath, 'utf8');
      const certificatePem = fs.readFileSync(certPath, 'utf8');
      const certificateBody = certificatePem
        .replace(/-----(BEGIN|END) CERTIFICATE-----/g, '')
        .replace(/\s/g, '');

      return { privateKeyPem, certificatePem, certificateBody };
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  };
