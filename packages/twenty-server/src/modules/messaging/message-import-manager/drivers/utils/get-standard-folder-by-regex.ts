import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';

const FOLDER_REGEX_PATTERNS: Record<StandardFolder, string[]> = {
  [StandardFolder.INBOX]: [
    // EN
    'inbox',
    '^mail$',
    '^messages?$',
    'received',
    // FR
    'boîte[\\s_-]?de[\\s_-]?réception',
    'courrier[\\s_-]?entrant',
    'messages[\\s_-]?reçus',
    'réception',
    // DE
    'posteingang',
    'eingang',
    'eingangsmails?',
    'empfangen',
    // ES
    'bandeja[\\s_-]?de[\\s_-]?entrada',
    'entrada',
    'correo[\\s_-]?entrante',
    'recibidos?',
    // PT
    'caixa[\\s_-]?de[\\s_-]?entrada',
    'entrada',
    'correio[\\s_-]?de[\\s_-]?entrada',
    'recebidos?',
    // IT
    'posta[\\s_-]?in[\\s_-]?arrivo',
    'arrivo',
    'casella[\\s_-]?postale',
    'ricevuti',
    // KO
    '받은편지함',
    '수신함',
    '받은메일',
    // JA
    '受信トレイ',
    '受信箱',
    '受信メール',
    // PL
    'odebrane',
    'skrzynka[\\s_-]?odbiorcza',
    'wiadomości[\\s_-]?przychodzące',
    // RU
    'входящие',
    'папка[\\s_-]?входящих',
    'полученные[\\s_-]?(сообщения|письма)?',
    // GMAIL
    '\\[gmail\\][\\/]+inbox',
  ],
  [StandardFolder.DRAFTS]: [
    // EN
    'drafts?',
    'draft[\\s_-]?(items|mail|messages|elements)?',
    // FR
    'brouillons?',
    '[ée]l[ée]ments[\\s_-]?brouillons?',
    // DE
    'entwürfe',
    'entwurf',
    // ES
    'borradores?',
    'elementos[\\s_-]?borrador',
    // PT
    'rascunhos?',
    'itens[\\s_-]?rascunho',
    // IT
    'bozze',
    'bozze[\\s_-]?salvate',
    // KO
    '임시보관함',
    '초안',
    // JA
    '下書き',
    '草稿',
    // PL
    'wersje[\\s_-]?robocze',
    'szkice',
    // RU
    'черновики',
    'черновые[\\s_-]?(сообщения|письма)?',
    'неотправленные',
    // GMAIL
    '\\[gmail\\][\\/]+drafts',
  ],
  [StandardFolder.SENT]: [
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
  ],
  [StandardFolder.TRASH]: [
    // EN
    'trash',
    'deleted[\\s_-]?(items|messages|mail)?',
    'bin',
    'recycle[\\s_-]?bin',
    // FR
    'corbeille',
    'supprim[ée]s',
    '[ée]l[ée]ments[\\s_-]?supprim[ée]s',
    // DE
    'gelöscht',
    'gelöschte[\\s_-]?elemente',
    'papierkorb',
    // ES
    'papelera',
    'eliminados?',
    'elementos[\\s_-]?eliminados',
    // PT
    'lixeira',
    'itens[\\s_-]?excluídos',
    // IT
    'cestino',
    'posta[\\s_-]?eliminata',
    'eliminati',
    // KO
    '휴지통',
    '삭제된편지함',
    // JA
    'ごみ箱',
    '削除済み',
    '削除済みメール',
    // PL
    'kosz',
    'usunięte',
    'elementy[\\s_-]?usunięte',
    // RU
    'удалённые',
    'корзина',
    'удалённые[\\s_-]?(сообщения|письма)?',
    // GMAIL
    '\\[gmail\\][\\/]+trash',
  ],
  [StandardFolder.JUNK]: [
    // EN
    'spam',
    'junk[\\s_-]?(mail|messages|email)?',
    'bulk[\\s_-]?(mail|messages)?',
    // FR
    'indésirables',
    'courrier[\\s_-]?indésirable',
    'spam',
    // DE
    'spam',
    'junk[\\s_-]?mail',
    'unerwünscht',
    // ES
    'spam',
    'correo[\\s_-]?basura',
    'no[\\s_-]?deseado',
    // PT
    'spam',
    'lixo[\\s_-]?eletrônico',
    'indesejados',
    // IT
    'spam',
    'posta[\\s_-]?indesiderata',
    'indesiderata',
    // KO
    '스팸',
    '정크메일',
    // JA
    'スパム',
    '迷惑メール',
    // PL
    'spam',
    'niechciane',
    'śmieci',
    // RU
    'спам',
    'нежелательные',
    'мусор',
    // GMAIL
    '\\[gmail\\][\\/]+spam',
  ],
};

const CACHED_REGEX_PATTERNS = Object.fromEntries(
  Object.entries(FOLDER_REGEX_PATTERNS).map(([standardFolder, patterns]) => [
    standardFolder,
    new RegExp(patterns.map((s) => `(${s})`).join('|'), 'i'),
  ]),
);

export function getStandardFolderByRegex(
  folderName: string,
): StandardFolder | null {
  for (const [standardFolder, regex] of Object.entries(CACHED_REGEX_PATTERNS)) {
    if (regex.test(folderName)) {
      return standardFolder as StandardFolder;
    }
  }

  return null;
}
