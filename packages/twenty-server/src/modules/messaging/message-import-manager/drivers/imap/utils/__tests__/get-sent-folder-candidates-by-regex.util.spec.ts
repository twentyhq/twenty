import { type ListResponse } from 'imapflow';

import { getImapSentFolderCandidatesByRegex } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-sent-folder-candidates-by-regex.util';

function makeList(paths: string[]): ListResponse[] {
  return paths.map((p) => ({ path: p, name: p }) as ListResponse);
}

describe('getSentFolderCandidatesByRegex', () => {
  it('matches English variants', () => {
    const englishVariants = [
      'Sent',
      'Sent Items',
      'Sent Mail',
      'Sent Messages',
      'sent-elements',
    ];
    const input = makeList(englishVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(englishVariants),
    );
  });

  it('matches French variants', () => {
    const frenchVariants = ['Envoyés', 'Éléments envoyés', 'Objets envoyés'];
    const input = makeList(frenchVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(frenchVariants),
    );
  });

  it('matches German variants', () => {
    const germanVariants = ['Gesendet', 'Gesendete Elemente'];
    const input = makeList(germanVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(germanVariants),
    );
  });

  it('matches Spanish variants', () => {
    const spanishVariants = ['Enviados', 'Elementos enviados'];
    const input = makeList(spanishVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(spanishVariants),
    );
  });

  it('matches Portuguese variants', () => {
    const portugueseVariants = ['Itens enviados'];
    const input = makeList(portugueseVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(portugueseVariants),
    );
  });

  it('matches Italian variants', () => {
    const italianVariants = ['Posta inviata', 'Inviati'];
    const input = makeList(italianVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(italianVariants),
    );
  });

  it('matches Korean variant', () => {
    const koreanVariants = ['보낸편지함'];
    const input = makeList(koreanVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(koreanVariants);
  });

  it('matches Japanese variants', () => {
    const japaneseVariants = ['送信済みメール', '送信済み'];
    const input = makeList(japaneseVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(japaneseVariants),
    );
  });

  it('matches Polish variants', () => {
    const polishVariants = ['Wysłane', 'Elementy wysłane'];
    const input = makeList(polishVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(polishVariants),
    );
  });

  it('matches Russian variants', () => {
    const russianVariants = [
      'Отправленные',
      'Отправленные письма',
      'Отправленные сообщения',
      'Исходящие',
    ];
    const input = makeList(russianVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(russianVariants),
    );
  });

  it('matches Gmail special folder', () => {
    const gmailVariants = ['[Gmail]/Sent Mail', '[Gmail]\\Sent Mail'];
    const input = makeList(gmailVariants);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result.map((r) => r.path)).toEqual(
      expect.arrayContaining(gmailVariants),
    );
  });

  it('does not match unrelated folders', () => {
    const unrelatedFolders = [
      'Inbox',
      'Drafts',
      'Trash',
      'Archive',
      'Junk',
      'Important',
      'RandomFolder',
    ];
    const input = makeList(unrelatedFolders);
    const result = getImapSentFolderCandidatesByRegex(input);

    expect(result).toEqual([]);
  });
});
