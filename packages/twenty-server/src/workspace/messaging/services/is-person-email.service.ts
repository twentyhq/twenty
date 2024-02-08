import { Injectable } from '@nestjs/common';

@Injectable()
export class IsPersonEmailService {
  constructor() {}

  isPersonEmail(email: string): boolean {
    const nonPersonalPatterns = [
      /noreply/,
      /no-reply/,
      /^info@/,
      /^admin@/,
      /^contact@/,
      /^hello@/,
      /^support@/,
      /^sales@/,
      /^feedback@/,
      /^service@/,
      /^help@/,
      /^mailer-daemon/,
      /^notifications?/,
      /^digest/,
      /^do_not_reply/,
      /^no.reply/,
      /^auto/,
      /^apps/,
      /^assign/,
      /^comments/,
      /^customer-success/,
      /^enterprise/,
      /^esign/,
      /^express/,
      /^forum/,
      /^gc@/,
      /^learn/,
      /^mailer/,
      /^marketing/,
      /^messages/,
      /^news/,
      /^notification/,
      /^payments/,
      /^receipts/,
      /^recrutement/,
      /^security/,
      /^service/,
      /^support/,
      /^team/,
    ];

    for (const pattern of nonPersonalPatterns) {
      if (pattern.test(email)) {
        return false;
      }
    }

    return true;
  }
}
