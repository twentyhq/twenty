import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/utils/extract-text-without-reply-quotations.util';

describe('extractTextWithoutReplyQuotations', () => {
  it('should keep the new reply and drop the quoted history', () => {
    const result = extractTextWithoutReplyQuotations(
      'New reply here.\n\nOn Mon, someone wrote:\n> old line',
    );

    expect(result).toContain('New reply here.');
    expect(result).not.toContain('old line');
  });

  it('should drop a nested "On <date>, <name> wrote:" thread without quote markers', () => {
    const result = extractTextWithoutReplyQuotations(
      'Latest answer.\n\nOn 24 Jun 2024, at 15:14, Omar M <omar@x.com> wrote:\nprevious question\nsecond previous line',
    );

    expect(result).toContain('Latest answer.');
    expect(result).not.toContain('previous question');
  });

  it('should keep the full body when the message is entirely quoted (forward) and would otherwise be emptied', () => {
    // Regression: forwarded emails are entirely quotation-like, so the parser
    // returned empty and the message body was lost.
    const forwardedBody =
      '> quoted line one\n> quoted line two\n> quoted line three';

    expect(extractTextWithoutReplyQuotations(forwardedBody)).toBe(
      forwardedBody,
    );
  });

  it('should drop a Danish Outlook Fra:/Sendt:/Til:/Emne: quoted thread', () => {
    const result = extractTextWithoutReplyQuotations(
      'Hej Jane\n\nKan vi mødes i morgen?\n\nFra: John Doe <john@example.com>\nSendt: 1. september 2026 10:00\nTil: Jane Doe <jane@example.com>\nEmne: Re: Møde\n\nGammel besked her',
    );

    expect(result).toContain('Kan vi mødes i morgen?');
    expect(result).not.toContain('Gammel besked her');
    expect(result).not.toContain('john@example.com');
  });

  it('should keep a Danish forward that starts with Fra:', () => {
    const forwardedBody =
      'Fra: John Doe <john@example.com>\nSendt: 1. september 2026\n\nGammel besked her';

    expect(extractTextWithoutReplyQuotations(forwardedBody)).toBe(
      forwardedBody,
    );
  });

  it('should leave Fra: intact when the Outlook separator sits above the header', () => {
    const bodyWithSeparator =
      'Svar her\n\n________________________________\nFra: John Doe <john@example.com>\nSendt: i dag\n\nGammel besked her';

    expect(extractTextWithoutReplyQuotations(bodyWithSeparator)).toBe(
      bodyWithSeparator,
    );
    expect(extractTextWithoutReplyQuotations(bodyWithSeparator)).not.toContain(
      'From:',
    );
  });

  it('should leave unmatched mid-message Fra: without an email address intact', () => {
    const bodyWithoutBrackets =
      'Hej\n\nFra: John Doe\nSendt: i dag\n\nGammel besked her';

    expect(extractTextWithoutReplyQuotations(bodyWithoutBrackets)).toBe(
      bodyWithoutBrackets,
    );
  });
});
