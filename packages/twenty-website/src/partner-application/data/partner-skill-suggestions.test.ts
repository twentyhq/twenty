import { PARTNER_SKILL_POOL } from './partner-skill-pool';
import { PARTNER_SKILL_SUGGESTIONS } from './partner-skill-suggestions';

const COMPETITOR_CRMS = ['Salesforce', 'HubSpot', 'Attio', 'Pipedrive', 'Zoho'];

describe('partner skill suggestions', () => {
  it('never surfaces a competitor CRM', () => {
    const all = [...PARTNER_SKILL_SUGGESTIONS, ...PARTNER_SKILL_POOL];
    for (const crm of COMPETITOR_CRMS) {
      expect(all).not.toContain(crm);
    }
  });

  it('keeps the shown chips and the searchable pool disjoint', () => {
    const shown = new Set(PARTNER_SKILL_SUGGESTIONS);
    for (const skill of PARTNER_SKILL_POOL) {
      expect(shown.has(skill)).toBe(false);
    }
  });
});
