import { type ClientBriefHostingType } from './data/hosting-type-values';

export type HostingTypeValue = ClientBriefHostingType | '';

export type ClientBriefState = {
  stepIndex: number;

  // Brief
  need: string;
  requirements: string;

  // Context
  hostingType: HostingTypeValue;
  country: string;
  languages: string;
  seatCount: string;
  timeline: string;
  budgetRange: string;

  // Identity
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;

  // Meta
  fieldErrors: Partial<Record<string, string>>;
  submitError: string | null;
  isSubmitting: boolean;
  isSubmitted: boolean;
};

export type ScalarFieldName =
  | 'need'
  | 'requirements'
  | 'hostingType'
  | 'country'
  | 'languages'
  | 'seatCount'
  | 'timeline'
  | 'budgetRange'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'companyName';

export type ClientBriefAction =
  | { type: 'SET_FIELD'; field: ScalarFieldName; value: string }
  | { type: 'SET_FIELD_ERRORS'; errors: Partial<Record<string, string>> }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'SKIP_CONTEXT' }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_SUBMIT_ERROR'; value: string | null }
  | { type: 'SET_SUBMITTED' }
  | { type: 'RESET' };

export const INITIAL_CLIENT_BRIEF_STATE: ClientBriefState = {
  stepIndex: 0,
  need: '',
  requirements: '',
  hostingType: '',
  country: '',
  languages: '',
  seatCount: '',
  timeline: '',
  budgetRange: '',
  firstName: '',
  lastName: '',
  email: '',
  companyName: '',
  fieldErrors: {},
  submitError: null,
  isSubmitting: false,
  isSubmitted: false,
};
