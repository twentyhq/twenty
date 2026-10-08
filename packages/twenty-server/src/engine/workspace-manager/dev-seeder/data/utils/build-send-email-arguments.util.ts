import { type SeededEmail } from 'src/engine/workspace-manager/dev-seeder/data/utils/seeded-email.type';

export const buildSendEmailArguments = (email: SeededEmail) => ({
  recipients: { to: email.to, cc: email.cc ?? '', bcc: '' },
  subject: email.subject,
  body: email.body,
});
