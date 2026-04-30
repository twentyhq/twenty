export type PartnerProgramId = 'technology' | 'content' | 'solutions';

export const PARTNER_PROGRAM_OPTIONS: ReadonlyArray<{
  id: PartnerProgramId;
  label: string;
}> = [
  { id: 'technology', label: 'Technology Partner' },
  { id: 'content', label: 'Content & Community Partner' },
  { id: 'solutions', label: 'Solutions Partner' },
];

export const PARTNER_APPLICATION_MODAL_COPY = {
  titleSerif: 'Apply to build',
  titleSans: 'the future of CRM',
  subtitleLine1:
    'Join our ecosystem and help businesses take control of their customer data with',
  subtitleLine2: 'open-source primitives.',
  selectLabel: 'Select your team',
  fields: {
    name: 'Your name *',
    email: 'Work email *',
    company: 'Company or brand *',
    website: 'Website or github link *',
    opportunities: 'Estimated monthly opportunities (optional)',
    messageLabel: 'How do you want to partner with Twenty? *',
    messageHint:
      'Tell us about the custom solutions or integrations you plan to build.',
  },
  submit: 'Submit application',
  submitInFlight: 'Submitting…',
  validation: {
    incompleteForm: 'Please complete all required fields before submitting.',
    invalidEmail: 'Enter a valid email address.',
    submitFailed:
      'We could not submit your application. Please try again in a moment.',
  },
} as const;
