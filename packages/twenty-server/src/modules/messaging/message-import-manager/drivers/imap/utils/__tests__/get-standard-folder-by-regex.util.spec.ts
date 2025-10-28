import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';
import { getStandardFolderByRegex } from 'src/modules/messaging/message-import-manager/drivers/utils/get-standard-folder-by-regex';

function testFolderMatches(
  variants: string[],
  expectedStandardFolder: StandardFolder,
) {
  variants.forEach((variant) => {
    const result = getStandardFolderByRegex(variant);

    expect(result).toBe(expectedStandardFolder);
  });
}

describe('getStandardFolderByRegex', () => {
  describe('INBOX folder detection', () => {
    it('matches English variants', () => {
      const englishVariants = [
        'Inbox',
        'Mail',
        'Messages',
        'Message',
        'Received',
      ];

      testFolderMatches(englishVariants, StandardFolder.INBOX);
    });

    it('matches French variants', () => {
      const frenchVariants = [
        'Boîte de réception',
        'Courrier entrant',
        'Messages reçus',
        'Réception',
      ];

      testFolderMatches(frenchVariants, StandardFolder.INBOX);
    });

    it('matches German variants', () => {
      const germanVariants = [
        'Posteingang',
        'Eingang',
        'Eingangsmails',
        'Empfangen',
      ];

      testFolderMatches(germanVariants, StandardFolder.INBOX);
    });

    it('matches Spanish variants', () => {
      const spanishVariants = [
        'Bandeja de entrada',
        'Entrada',
        'Correo entrante',
        'Recibidos',
      ];

      testFolderMatches(spanishVariants, StandardFolder.INBOX);
    });

    it('matches Portuguese variants', () => {
      const portugueseVariants = [
        'Caixa de entrada',
        'Entrada',
        'Correio de entrada',
        'Recebidos',
      ];

      testFolderMatches(portugueseVariants, StandardFolder.INBOX);
    });

    it('matches Italian variants', () => {
      const italianVariants = [
        'Posta in arrivo',
        'Arrivo',
        'Casella postale',
        'Ricevuti',
      ];

      testFolderMatches(italianVariants, StandardFolder.INBOX);
    });

    it('matches Korean variants', () => {
      const koreanVariants = ['받은편지함', '수신함', '받은메일'];

      testFolderMatches(koreanVariants, StandardFolder.INBOX);
    });

    it('matches Japanese variants', () => {
      const japaneseVariants = ['受信トレイ', '受信箱', '受信メール'];

      testFolderMatches(japaneseVariants, StandardFolder.INBOX);
    });

    it('matches Polish variants', () => {
      const polishVariants = [
        'Odebrane',
        'Skrzynka odbiorcza',
        'Wiadomości przychodzące',
      ];

      testFolderMatches(polishVariants, StandardFolder.INBOX);
    });

    it('matches Russian variants', () => {
      const russianVariants = [
        'Входящие',
        'Папка входящих',
        'Полученные сообщения',
        'Полученные письма',
      ];

      testFolderMatches(russianVariants, StandardFolder.INBOX);
    });

    it('matches Gmail special folder', () => {
      const gmailVariants = ['[Gmail]/Inbox', '[Gmail]\\Inbox'];

      testFolderMatches(gmailVariants, StandardFolder.INBOX);
    });
  });

  describe('DRAFTS folder detection', () => {
    it('matches English variants', () => {
      const englishVariants = [
        'Drafts',
        'Draft',
        'Draft Items',
        'Draft Mail',
        'Draft Messages',
      ];

      testFolderMatches(englishVariants, StandardFolder.DRAFTS);
    });

    it('matches French variants', () => {
      const frenchVariants = ['Brouillons', 'Éléments brouillons'];

      testFolderMatches(frenchVariants, StandardFolder.DRAFTS);
    });

    it('matches German variants', () => {
      const germanVariants = ['Entwürfe', 'Entwurf'];

      testFolderMatches(germanVariants, StandardFolder.DRAFTS);
    });

    it('matches Spanish variants', () => {
      const spanishVariants = ['Borradores', 'Elementos borrador'];

      testFolderMatches(spanishVariants, StandardFolder.DRAFTS);
    });

    it('matches Portuguese variants', () => {
      const portugueseVariants = ['Rascunhos', 'Itens rascunho'];

      testFolderMatches(portugueseVariants, StandardFolder.DRAFTS);
    });

    it('matches Italian variants', () => {
      const italianVariants = ['Bozze', 'Bozze salvate'];

      testFolderMatches(italianVariants, StandardFolder.DRAFTS);
    });

    it('matches Korean variants', () => {
      const koreanVariants = ['임시보관함', '초안'];

      testFolderMatches(koreanVariants, StandardFolder.DRAFTS);
    });

    it('matches Japanese variants', () => {
      const japaneseVariants = ['下書き', '草稿'];

      testFolderMatches(japaneseVariants, StandardFolder.DRAFTS);
    });

    it('matches Polish variants', () => {
      const polishVariants = ['Wersje robocze', 'Szkice'];

      testFolderMatches(polishVariants, StandardFolder.DRAFTS);
    });

    it('matches Russian variants', () => {
      const russianVariants = [
        'Черновики',
        'Черновые сообщения',
        'Неотправленные',
      ];

      testFolderMatches(russianVariants, StandardFolder.DRAFTS);
    });

    it('matches Gmail special folder', () => {
      const gmailVariants = ['[Gmail]/Drafts', '[Gmail]\\Drafts'];

      testFolderMatches(gmailVariants, StandardFolder.DRAFTS);
    });
  });

  describe('SENT folder detection', () => {
    it('matches English variants', () => {
      const englishVariants = [
        'Sent',
        'Sent Items',
        'Sent Mail',
        'Sent Messages',
        'sent-elements',
      ];

      testFolderMatches(englishVariants, StandardFolder.SENT);
    });

    it('matches French variants', () => {
      const frenchVariants = ['Envoyés', 'Éléments envoyés', 'Objets envoyés'];

      testFolderMatches(frenchVariants, StandardFolder.SENT);
    });

    it('matches German variants', () => {
      const germanVariants = ['Gesendet', 'Gesendete Elemente'];

      testFolderMatches(germanVariants, StandardFolder.SENT);
    });

    it('matches Spanish variants', () => {
      const spanishVariants = ['Enviados', 'Elementos enviados'];

      testFolderMatches(spanishVariants, StandardFolder.SENT);
    });

    it('matches Portuguese variants', () => {
      const portugueseVariants = ['Itens enviados'];

      testFolderMatches(portugueseVariants, StandardFolder.SENT);
    });

    it('matches Italian variants', () => {
      const italianVariants = ['Posta inviata', 'Inviati'];

      testFolderMatches(italianVariants, StandardFolder.SENT);
    });

    it('matches Korean variant', () => {
      const koreanVariants = ['보낸편지함'];

      testFolderMatches(koreanVariants, StandardFolder.SENT);
    });

    it('matches Japanese variants', () => {
      const japaneseVariants = ['送信済みメール', '送信済み'];

      testFolderMatches(japaneseVariants, StandardFolder.SENT);
    });

    it('matches Polish variants', () => {
      const polishVariants = ['Wysłane', 'Elementy wysłane'];

      testFolderMatches(polishVariants, StandardFolder.SENT);
    });

    it('matches Russian variants', () => {
      const russianVariants = [
        'Отправленные',
        'Отправленные письма',
        'Отправленные сообщения',
        'Исходящие',
      ];

      testFolderMatches(russianVariants, StandardFolder.SENT);
    });

    it('matches Gmail special folder', () => {
      const gmailVariants = ['[Gmail]/Sent Mail', '[Gmail]\\Sent Mail'];

      testFolderMatches(gmailVariants, StandardFolder.SENT);
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

      unrelatedFolders.forEach((folder) => {
        const result = getStandardFolderByRegex(folder);

        expect(result).not.toBe(StandardFolder.SENT);
      });
    });
  });

  describe('TRASH folder detection', () => {
    it('matches English variants', () => {
      const englishVariants = [
        'Trash',
        'Deleted Items',
        'Deleted Messages',
        'Bin',
        'Recycle Bin',
      ];

      testFolderMatches(englishVariants, StandardFolder.TRASH);
    });

    it('matches French variants', () => {
      const frenchVariants = ['Corbeille', 'Supprimés', 'Éléments supprimés'];

      testFolderMatches(frenchVariants, StandardFolder.TRASH);
    });

    it('matches German variants', () => {
      const germanVariants = ['Gelöscht', 'Gelöschte Elemente', 'Papierkorb'];

      testFolderMatches(germanVariants, StandardFolder.TRASH);
    });

    it('matches Spanish variants', () => {
      const spanishVariants = [
        'Papelera',
        'Eliminados',
        'Elementos eliminados',
      ];

      testFolderMatches(spanishVariants, StandardFolder.TRASH);
    });

    it('matches Portuguese variants', () => {
      const portugueseVariants = ['Lixeira', 'Itens excluídos'];

      testFolderMatches(portugueseVariants, StandardFolder.TRASH);
    });

    it('matches Italian variants', () => {
      const italianVariants = ['Cestino', 'Posta eliminata', 'Eliminati'];

      testFolderMatches(italianVariants, StandardFolder.TRASH);
    });

    it('matches Korean variants', () => {
      const koreanVariants = ['휴지통', '삭제된편지함'];

      testFolderMatches(koreanVariants, StandardFolder.TRASH);
    });

    it('matches Japanese variants', () => {
      const japaneseVariants = ['ごみ箱', '削除済み', '削除済みメール'];

      testFolderMatches(japaneseVariants, StandardFolder.TRASH);
    });

    it('matches Polish variants', () => {
      const polishVariants = ['Kosz', 'Usunięte', 'Elementy usunięte'];

      testFolderMatches(polishVariants, StandardFolder.TRASH);
    });

    it('matches Russian variants', () => {
      const russianVariants = ['Удалённые', 'Корзина', 'Удалённые сообщения'];

      testFolderMatches(russianVariants, StandardFolder.TRASH);
    });

    it('matches Gmail special folder', () => {
      const gmailVariants = ['[Gmail]/Trash', '[Gmail]\\Trash'];

      testFolderMatches(gmailVariants, StandardFolder.TRASH);
    });
  });

  describe('JUNK/SPAM folder detection', () => {
    it('matches English variants', () => {
      const englishVariants = [
        'Spam',
        'Junk Mail',
        'Junk Messages',
        'Bulk Mail',
        'Bulk Messages',
      ];

      testFolderMatches(englishVariants, StandardFolder.JUNK);
    });

    it('matches French variants', () => {
      const frenchVariants = ['Indésirables', 'Courrier indésirable', 'Spam'];

      testFolderMatches(frenchVariants, StandardFolder.JUNK);
    });

    it('matches German variants', () => {
      const germanVariants = ['Spam', 'Junk Mail', 'Unerwünscht'];

      testFolderMatches(germanVariants, StandardFolder.JUNK);
    });

    it('matches Spanish variants', () => {
      const spanishVariants = ['Spam', 'Correo basura', 'No deseado'];

      testFolderMatches(spanishVariants, StandardFolder.JUNK);
    });

    it('matches Portuguese variants', () => {
      const portugueseVariants = ['Spam', 'Lixo eletrônico', 'Indesejados'];

      testFolderMatches(portugueseVariants, StandardFolder.JUNK);
    });

    it('matches Italian variants', () => {
      const italianVariants = ['Spam', 'Posta indesiderata', 'Indesiderata'];

      testFolderMatches(italianVariants, StandardFolder.JUNK);
    });

    it('matches Korean variants', () => {
      const koreanVariants = ['스팸', '정크메일'];

      testFolderMatches(koreanVariants, StandardFolder.JUNK);
    });

    it('matches Japanese variants', () => {
      const japaneseVariants = ['スパム', '迷惑メール'];

      testFolderMatches(japaneseVariants, StandardFolder.JUNK);
    });

    it('matches Polish variants', () => {
      const polishVariants = ['Spam', 'Niechciane', 'Śmieci'];

      testFolderMatches(polishVariants, StandardFolder.JUNK);
    });

    it('matches Russian variants', () => {
      const russianVariants = ['Спам', 'Нежелательные', 'Мусор'];

      testFolderMatches(russianVariants, StandardFolder.JUNK);
    });

    it('matches Gmail special folder', () => {
      const gmailVariants = ['[Gmail]/Spam', '[Gmail]\\Spam'];

      testFolderMatches(gmailVariants, StandardFolder.JUNK);
    });
  });
});
