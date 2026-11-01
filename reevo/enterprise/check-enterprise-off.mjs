#!/usr/bin/env node
// ReevoCrm patch P2 (interim): fails a deployment whose configuration would switch on a
// feature built from Twenty's Enterprise files (`/* @license Enterprise */`, commercial
// licence). Until those files are removed from the fork, they ship in our image but must
// stay off, and the image may be used for development and testing only (see PATCHES.md).
//
//   node reevo/enterprise/check-enterprise-off.mjs                 check process.env
//   node reevo/enterprise/check-enterprise-off.mjs --env-file .env check a dotenv file
//
// Only environment variables are checked. Values stored in the database through the admin
// panel are not; keep IS_CONFIG_VARIABLES_IN_DB_ENABLED=false so they cannot be set there.

import { readFileSync } from 'node:fs';

const MUST_BE_EMPTY = {
  ENTERPRISE_KEY: 'Enterprise key validation and every Enterprise feature it unlocks',
  ENTERPRISE_VALIDITY_TOKEN: 'Enterprise key validation',
  BILLING_STRIPE_API_KEY: 'Billing (Stripe)',
  BILLING_STRIPE_WEBHOOK_SECRET: 'Billing webhooks (Stripe)',
  BILLING_STRIPE_PUBLISHABLE_KEY: 'Billing (Stripe)',
  CLOUDFLARE_API_KEY: 'Custom domains (Cloudflare)',
  CLOUDFLARE_WEBHOOK_SECRET: 'Custom domains (Cloudflare)',
  SIGNING_KEY_ROTATION_DAYS: 'JWT signing-key rotation',
};

const MUST_NOT_BE_TRUE = {
  IS_BILLING_ENABLED: 'Billing, credits and usage limits',
  BILLING_USAGE_CAP_CLICKHOUSE_ENABLED: 'Usage caps',
  IS_FEATURE_FLAG_MANAGEMENT_ENABLED: 'lets server admins turn on Enterprise feature flags such as record sharing',
};

const ALLOWED_VALUES = {
  EMAILING_DOMAIN_DRIVER: { allowed: ['', 'LOG'], feature: 'Emailing domains' },
};

const SHOULD_BE_FALSE = {
  IS_CONFIG_VARIABLES_IN_DB_ENABLED: 'admins could set the variables above in the database, where this check cannot see them',
};

const parseEnvFile = (path) =>
  Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        const key = line.slice(0, index).replace(/^export\s+/, '').trim();
        const value = line.slice(index + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      }),
  );

const envFileIndex = process.argv.indexOf('--env-file');
const env = envFileIndex > -1 ? parseEnvFile(process.argv[envFileIndex + 1]) : process.env;
const value = (key) => (env[key] ?? '').trim();

const errors = [];
const warnings = [];

for (const [key, feature] of Object.entries(MUST_BE_EMPTY)) {
  if (value(key) !== '') {
    errors.push(`${key} is set: switches on ${feature}`);
  }
}
for (const [key, feature] of Object.entries(MUST_NOT_BE_TRUE)) {
  if (value(key).toLowerCase() === 'true') {
    errors.push(`${key}=true: ${feature}`);
  }
}
for (const [key, { allowed, feature }] of Object.entries(ALLOWED_VALUES)) {
  if (!allowed.includes(value(key).toUpperCase())) {
    errors.push(`${key}=${value(key)}: ${feature}; allowed: ${allowed.filter(Boolean).join(', ')} or unset`);
  }
}
for (const [key, reason] of Object.entries(SHOULD_BE_FALSE)) {
  if (value(key).toLowerCase() !== 'false') {
    warnings.push(`${key} is not false: ${reason}`);
  }
}

for (const warning of warnings) {
  console.warn(`check-enterprise-off: warning: ${warning}`);
}
if (errors.length > 0) {
  console.error('check-enterprise-off: this configuration switches on Enterprise (commercial) features:');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}
console.log('check-enterprise-off: no Enterprise feature is switched on by environment.');
