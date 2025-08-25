import { type ListResponse } from 'imapflow';

export function getImapSentFolderCandidatesByRegex(
  list: ListResponse[],
): string[] {
  const sentFolderPattern = new RegExp(
    [
      // EN
      'sent([\\s_-]?(items|mail|messages|elements))?',
      // FR
      'envoy[éê]s?',
      '[ée]l[ée]ments[\\s_-]?envoy[éê]s',
      // DE
      'gesendet',
      'gesendete[\\s_-]?elemente',
      // ES
      'enviados?',
      'elementos[\\s_-]?enviados',
      // PT
      'itens[\\s_-]?enviados',
      // IT
      'posta[\\s_-]?inviata',
      'inviati',
      // KO
      '보낸편지함',
      // JA
      '送信済みメール',
      '送信済み',
      // PL
      'elementy[\\s_-]?wysłane',
      'wysłane',
      // RU
      'отправленные',
      'отправленные[\\s_-]?(сообщения|письма)?',
      'исходящие',
      // GMAIL
      '\\[gmail\\][\\/]+sent[\\s_-]?mail',
    ]
      .map((s) => `(${s})`)
      .join('|'),
    'i',
  );

  const regexCandidateFolders = [];

  for (const folder of list) {
    if (sentFolderPattern.test(folder.path)) {
      regexCandidateFolders.push(folder.path);
    }
  }

  return regexCandidateFolders;
}
