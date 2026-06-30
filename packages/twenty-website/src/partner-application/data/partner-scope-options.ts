import { msg } from '@lingui/core/macro';

import { defineFieldOptions } from './define-field-options';

// Each scope is a selectable card carrying its own description and examples.
export const PARTNER_SCOPE_OPTIONS = defineFieldOptions([
  {
    value: 'ADVISORY',
    label: msg`Advisory & Discovery`,
    description: msg`Upfront consulting, scoping, strategy.`,
    examples: msg`CRM audit · Requirements · Process mapping · ROI · RevOps · Vendor selection`,
  },
  {
    value: 'SOLUTIONING',
    label: msg`Solutioning`,
    description: msg`What an admin can do without writing code.`,
    examples: msg`Data modeling · Migrations · No-code workflows · Dashboards · SSO/SCIM · Integrations`,
  },
  {
    value: 'DEVELOPMENT',
    label: msg`Custom Development`,
    description: msg`Anything that needs a developer.`,
    examples: msg`Custom Apps · Scripts · AI/agent integrations`,
  },
  {
    value: 'HOSTING',
    label: msg`Hosting & Infrastructure`,
    description: msg`Anything that needs devops skills.`,
    examples: msg`Self-hosted (Docker/K8s) · Cloud architecture · Scaling · Security · Monitoring`,
  },
  {
    value: 'SUPPORT',
    label: msg`Training, Adoption & Support`,
    description: msg`User-side rollout & ongoing support.`,
    examples: msg`Onboarding · Documentation · Change management · L1/L2 support · Managed services`,
  },
]);

export type PartnerScopeValue = (typeof PARTNER_SCOPE_OPTIONS)[number]['value'];
