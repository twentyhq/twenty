import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type PartnerService = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

export const PARTNER_SERVICES: readonly PartnerService[] = [
  {
    title: msg`Migration`,
    body: msg`Move your data out of Salesforce, HubSpot or spreadsheets.`,
  },
  {
    title: msg`Customization & apps`,
    body: msg`Custom objects, workflows and apps built on the platform.`,
  },
  {
    title: msg`Self-hosted operations`,
    body: msg`Deploy, upgrade and operate Twenty on your own infrastructure.`,
  },
  {
    title: msg`Training & RevOps`,
    body: msg`Onboard your team and design your sales process.`,
  },
];
