export type SalesforceWrongChoicePopupType = {
  body: string;
  titleBar: string;
};

export const SALESFORCE_POPUPS = {
  wrongChoiceDefault: {
    body: 'Better than liquid glass !',
    titleBar: 'Wrong choice',
  },
  wrongChoiceLorem: {
    body: 'Lorem ipsum dolor sit amet',
    titleBar: 'Wrong choice',
  },
} as const satisfies Record<string, SalesforceWrongChoicePopupType>;

export type SalesforcePopupKey = keyof typeof SALESFORCE_POPUPS;
