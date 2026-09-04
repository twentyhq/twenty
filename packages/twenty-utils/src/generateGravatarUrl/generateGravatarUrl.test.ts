import { generateGravatarUrl } from './generateGravatarUrl'; import assert from 'node:assert/strict';
assert.equal(generateGravatarUrl("test@example.com").includes("gravatar.com/avatar/"), true);