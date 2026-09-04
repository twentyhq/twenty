import { slugifyWorkspaceName } from './slugifyWorkspaceName'; import assert from 'node:assert/strict';
assert.equal(slugifyWorkspaceName("Twenty CRM & Co!"), "twenty-crm-co");