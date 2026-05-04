import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const PARTNER_PROGRAM_IDS = [
  'technology',
  'content',
  'solutions',
] as const;

export type PartnerProgramId = (typeof PARTNER_PROGRAM_IDS)[number];

export const PARTNER_PROGRAM_LABELS: Record<
  PartnerProgramId,
  MessageDescriptor
> = {
  technology: msg`Technology Partner`,
  content: msg`Content & Community Partner`,
  solutions: msg`Solutions Partner`,
};

export const PARTNER_APPLICATION_MODAL_COPY = {
  titleSerif: msg`Apply to build`,
  titleSans: msg`the future of CRM`,
  subtitleLine1: msg`Join our ecosystem and help businesses take control of their customer data with`,
  subtitleLine2: msg`open-source primitives.`,
  selectLabel: msg`Select your team`,
  fields: {
    name: msg`Your name *`,
    email: msg`Work email *`,
    company: msg`Company or brand *`,
    website: msg`Website or github link *`,
    opportunities: msg`Estimated monthly opportunities (optional)`,
    messageLabel: msg`How do you want to partner with Twenty? *`,
    messageHint: msg`Tell us about the custom solutions or integrations you plan to build.`,
  },
  submit: msg`Submit application`,
  submitInFlight: msg`Submitting…`,
  validation: {
    incompleteForm: msg`Please complete all required fields before submitting.`,
    invalidEmail: msg`Enter a valid email address.`,
    submitFailed: msg`We could not submit your application. Please try again in a moment.`,
  },
} as const;
