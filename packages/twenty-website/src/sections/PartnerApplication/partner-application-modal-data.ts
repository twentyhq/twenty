import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const PARTNER_APPLICATION_MODAL_COPY = {
  titleSerif: msg`Apply to build`,
  titleSans: msg`the future of CRM`,
  subtitleLine1: msg`Join our ecosystem and help businesses take control of their customer data with`,
  subtitleLine2: msg`open-source primitives.`,
  stepProgressLabel: (current: number, total: number) =>
    msg`Step ${current} of ${total}`,
  back: msg`← Back`,
  next: msg`Next →`,
  submit: msg`Submit application`,
  submitInFlight: msg`Submitting…`,
  successTitleSerif: msg`Thanks, you're in.`,
  successTitleSans: msg`Now book your intro call.`,
  bookIntroSubtitle: msg`Grab 30 minutes so we can get to know your team.`,
  bookLater: msg`I'll book later →`,
  validation: {
    incompleteForm: msg`Please complete all required fields before continuing.`,
    invalidEmail: msg`Enter a valid email address.`,
    invalidUrl: msg`Enter a valid URL (starting with http:// or https://).`,
    submitFailed: msg`We could not submit your application. Please try again in a moment.`,
  },
} as const;

export const PARTNER_APPLICATION_FIELD_COPY = {
  // Identity
  name: msg`Your name *`,
  email: msg`Work email *`,
  company: msg`Company or brand *`,
  website: msg`Website or GitHub`,
  // Profile
  linkedin: msg`LinkedIn URL`,
  city: msg`City`,
  country: msg`Country *`,
  countryPlaceholder: msg`Select your country`,
  countrySearchPlaceholder: msg`Search a country…`,
  countrySearchEmpty: msg`No matching country.`,
  languages: msg`Languages spoken`,
  // Expertise
  typeOfTeam: msg`Type of team *`,
  typeOfTeamPlaceholder: msg`Solo or agency?`,
  partnerScope: msg`What you cover *`,
  partnerScopeHint: msg`Pick every category that applies.`,
  skills: msg`Technical skills`,
  skillsHint: msg`Press Enter or comma to add a skill.`,
  skillsPlaceholder: msg`e.g. React, Postgres, n8n…`,
  applicationNotes: msg`Anything else we should know?`,
  applicationNotesPlaceholder: msg`Workspace URL, customer references, relevant links…`,
  // Commercials
  hourlyRate: msg`Hourly rate`,
  hourlyRatePlaceholder: msg`150`,
  projectBudgetMin: msg`Minimum project budget`,
  projectBudgetMinPlaceholder: msg`5,000`,
  calendarLink: msg`Calendar / booking link`,
} as const;

export type PartnerApplicationFieldCopyKey =
  keyof typeof PARTNER_APPLICATION_FIELD_COPY;

export const PARTNER_APPLICATION_STEP_HEADER_LABELS: Record<
  'identity' | 'profile' | 'expertise' | 'commercials',
  MessageDescriptor
> = {
  identity: msg`Identity`,
  profile: msg`Profile`,
  expertise: msg`Expertise & experience`,
  commercials: msg`Commercials`,
};
