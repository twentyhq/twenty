export type SeededEmail = {
  to: string;
  cc?: string;
  subject: string;
  // HTML, as the email tools read a string body
  body: string;
};
