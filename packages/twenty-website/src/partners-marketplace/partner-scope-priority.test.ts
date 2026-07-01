import { topScopes } from './partner-scope-priority';

test('keeps the two highest-priority scopes and counts the rest', () => {
  const result = topScopes([
    'SUPPORT',
    'SOLUTIONING',
    'HOSTING',
    'DEVELOPMENT',
    'ADVISORY',
  ]);
  expect(result.shown).toEqual(['SOLUTIONING', 'DEVELOPMENT']);
  expect(result.rest).toBe(3);
});
test('no overflow counter when two or fewer', () => {
  expect(topScopes(['ADVISORY', 'SUPPORT']).rest).toBe(0);
});
