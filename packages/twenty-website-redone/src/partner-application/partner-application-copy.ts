import { msg } from '@lingui/core/macro';

// All of the wizard's copy in one place: modal chrome, the success screen, the
// per-field labels/placeholders/hints, validation messages, and the step header
// labels. The wizard and steps read the slices they need.
export const PARTNER_APPLICATION_COPY = {
  title: msg`Apply to build\n*the future of CRM*`,
  subtitle: msg`Join our ecosystem and help businesses take control of their customer data with open-source primitives.`,
  back: msg`← Back`,
  next: msg`Next →`,
  submit: msg`Submit application`,
  submitInFlight: msg`Submitting…`,
  successTitle: msg`Thanks, you're in.\n*Now book your intro call.*`,
  bookIntroSubtitle: msg`Grab 30 minutes so we can get to know your team.`,
  bookLater: msg`I'll book later →`,
  stepProgressLabel: (current: number, total: number) =>
    msg`Step ${current} of ${total}`,
  validation: {
    incompleteForm: msg`Please complete all required fields before continuing.`,
    invalidEmail: msg`Enter a valid email address.`,
    invalidUrl: msg`Enter a valid URL (starting with http:// or https://).`,
    submitFailed: msg`We could not submit your application. Please try again in a moment.`,
  },
  removeSkill: (skill: string) => msg`Remove ${skill}`,
  fields: {
    name: msg`Your name *`,
    email: msg`Work email *`,
    company: msg`Company or brand *`,
    website: msg`Website or GitHub`,
    linkedin: msg`LinkedIn URL`,
    city: msg`City`,
    country: msg`Country *`,
    countryPlaceholder: msg`Select your country`,
    countrySearchPlaceholder: msg`Search a country…`,
    countrySearchEmpty: msg`No matching country.`,
    languages: msg`Languages spoken`,
    typeOfTeam: msg`Type of team *`,
    partnerScope: msg`What you cover *`,
    partnerScopeHint: msg`Pick every category that applies.`,
    skills: msg`Technical skills`,
    skillsHint: msg`Press Enter or comma to add a skill.`,
    skillsPlaceholder: msg`e.g. React, Postgres, n8n…`,
    applicationNotes: msg`Anything else we should know?`,
    applicationNotesPlaceholder: msg`Workspace URL, customer references, relevant links…`,
    hourlyRate: msg`Hourly rate`,
    hourlyRatePlaceholder: msg`150`,
    projectBudgetMin: msg`Minimum project budget`,
    projectBudgetMinPlaceholder: msg`5,000`,
    calendarLink: msg`Calendar / booking link`,
  },
  stepHeaders: {
    identity: msg`Identity`,
    profile: msg`Profile`,
    expertise: msg`Expertise & experience`,
    commercials: msg`Commercials`,
  },
};
