// Logins excluded from the public contributors list (team, bots, vendors).
// Aligned with packages/twenty-website/src/shared-utils/listTeamMembers.ts
const EXCLUDED_LOGINS = [
  'ady-beraud',
  'Bonapara',
  'bosiraphael',
  'charlesBochet',
  'cyborch',
  'dependabot',
  'dependabot-preview[bot]',
  'dependabot[bot]',
  'emilienchvt',
  'FelixMalfait',
  'Freebios',
  'gitstart-app',
  'gitstart-twenty',
  'github-actions[bot]',
  'ijreilly',
  'lucasbordeau',
  'magrinj',
  'martmull',
  'nimraahmed',
  'Samox',
  'thaisguigon',
  'thomtrp',
  'Weiko',
  'prastoin',
  'ehconitin',
  'etiennejouan',
  'Devessier',
  'guillim',
  'AMoreaux',
  'abdulrahmancodes',
  'mabdullahabaid',
  'neo773',
  'StephanieJoly4',
  'copilot',
];

const EXCLUDED_LOWER = new Set(
  EXCLUDED_LOGINS.map((login) => login.toLowerCase()),
);

export function isExcludedContributorLogin(login: string): boolean {
  return EXCLUDED_LOWER.has(login.toLowerCase());
}
