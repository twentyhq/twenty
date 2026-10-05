import { stripQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/strip-quoted-history.util';

describe('stripQuotedHistory', () => {
  it('should return a simple message untouched', () => {
    expect(stripQuotedHistory('Oh, hai')).toBe('Oh, hai');
  });

  it('should understand the on-date-somebody-wrote splitter', () => {
    expect(
      stripQuotedHistory(
        [
          'Test reply',
          '',
          'On 11-Apr-2011, at 6:54 PM, Roman Tkachenko <romant@example.com> wrote:',
          '',
          '>',
          '> Test',
          '>',
          '> Roman',
        ].join('\n'),
      ),
    ).toBe('Test reply');
  });

  it('should allow a human to start a line with On', () => {
    const message = 'Blah-blah-blah\nOn blah-blah-blah';

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should keep real text that sits on the splitter line', () => {
    expect(
      stripQuotedHistory(
        'reply On Wed, Apr 4, 2012 at 3:59 PM, bob@example.com wrote:\n> Hi',
      ),
    ).toBe('reply');

    expect(
      stripQuotedHistory(
        'reply--- On Wed, Apr 4, 2012 at 3:59 PM, me@domain.com wrote:\n> Hi',
      ),
    ).toBe('reply');

    expect(
      stripQuotedHistory(
        'reply\nbla-bla - bla--- On Wed, Apr 4, 2012 at 3:59 PM, me@domain.com wrote:\n> Hi',
      ),
    ).toBe('reply\nbla-bla - bla');
  });

  it('should pick up replies written after the quotation', () => {
    expect(
      stripQuotedHistory(
        'On 04/19/2011 07:10 AM, Roman Tkachenko wrote:\n\n>\n> Test\nTest reply',
      ),
    ).toBe('Test reply');
  });

  it('should detect wrapping replies', () => {
    expect(
      stripQuotedHistory(
        'Test reply\nOn 04/19/2011 07:10 AM, Roman Tkachenko wrote:\n\n>\n> Test\nRegards, Roman',
      ),
    ).toBe('Test reply\nRegards, Roman');
  });

  it('should keep the whole message when replies are inline', () => {
    const message =
      'Please see my responses inline\nOn 04/19/2011 07:10 AM, Roman Tkachenko wrote:\n\n> Question 1\nResponse 1\n> Question 2\nResponse 2';

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should detect wrapping of nested replies', () => {
    expect(
      stripQuotedHistory(
        [
          'Test reply',
          'On 04/19/2011 07:10 AM, Roman Tkachenko wrote:',
          '',
          '>Test test',
          '>On 04/19/2011 07:10 AM, Roman Tkachenko wrote:',
          '>',
          '>>',
          '>> Test.',
          '>>',
          '>> Roman',
          '',
          'Regards, Roman',
        ].join('\n'),
      ),
    ).toBe('Test reply\nRegards, Roman');
  });

  it('should not be fooled by a two line splitter', () => {
    expect(
      stripQuotedHistory(
        [
          'Test reply',
          'On Fri, May 6, 2011 at 6:03 PM, Roman Tkachenko from Hacker News',
          '<roman@definebox.com> wrote:',
          '',
          '> Test.',
          '>',
          '> Roman',
          '',
          'Regards, Roman',
        ].join('\n'),
      ),
    ).toBe('Test reply\nRegards, Roman');
  });

  it('should not be fooled by a three line splitter', () => {
    expect(
      stripQuotedHistory(
        [
          'Test reply',
          'On Nov 30, 2011, at 12:47 PM, Somebody <',
          '416ffd3258d4d2fa4c85cfa4c44e1721d66e3e8f4@somebody.domain.com>',
          'wrote:',
          '',
          'Test message',
          '',
        ].join('\n'),
      ),
    ).toBe('Test reply');
  });

  it('should work with brief quotes', () => {
    expect(
      stripQuotedHistory(
        'Hi\nOn 04/19/2011 07:10 AM, Roman Tkachenko wrote:\n\n> Hello',
      ),
    ).toBe('Hi');
  });

  it('should not be fooled by indents', () => {
    expect(
      stripQuotedHistory(
        [
          'YOLO salvia cillum kogi typewriter mumblecore cardigan skateboard Austin.',
          '',
          '------On 12/29/1987 17:32 PM, Julius Caesar wrote-----',
          '',
          'Brunch mumblecore pug Marfa tofu, irure taxidermy hoodie readymade pariatur.',
          '    ',
        ].join('\n'),
      ),
    ).toBe(
      'YOLO salvia cillum kogi typewriter mumblecore cardigan skateboard Austin.',
    );
  });

  it('should not be fooled by empty lines inside quoted messages', () => {
    expect(
      stripQuotedHistory(
        [
          'Btw blah blah...',
          '',
          'On Tue, Jan 27, 2015 at 12:42 PM -0800, "Company" <christine.XXX@XXX.com> wrote:',
          '',
          'Hi Mark,',
          'Blah blah? ',
          'Thanks,Christine ',
          '',
          'On Jan 27, 2015, at 11:55 AM, Mark XXX <mark@XXX.com> wrote:',
          '',
          'Lorem ipsum?',
          'Mark',
          '',
          'Sent from Acompli',
        ].join('\n'),
      ),
    ).toBe('Btw blah blah...');
  });

  it('should handle unicode characters in a name', () => {
    expect(
      stripQuotedHistory(
        'Replying ok\n2011/4/7 Nathan \u0438ova <support@example.com>\n\n>  Cool beans, scro',
      ),
    ).toBe('Replying ok');
  });

  it('should treat original message headers as quotation', () => {
    expect(
      stripQuotedHistory(
        [
          'Allo! Follow up MIME!',
          '',
          'From: somebody@example.com',
          'Sent: March-19-11 5:42 PM',
          'To: Somebody',
          'Subject: The manager has commented on your Loop',
          '',
          'Blah-blah-blah',
          '',
        ].join('\n'),
      ),
    ).toBe('Allo! Follow up MIME!');
  });

  it('should treat German original message headers as quotation', () => {
    expect(
      stripQuotedHistory(
        [
          'Allo! Follow up MIME!',
          '',
          'Von: somebody@example.com',
          'Gesendet: Dienstag, 25. November 2014 14:59',
          'An: Somebody',
          'Betreff: The manager has commented on your Loop',
          '',
          'Blah-blah-blah',
          '',
        ].join('\n'),
      ),
    ).toBe('Allo! Follow up MIME!');
  });

  it('should treat French original message headers as quotation', () => {
    expect(
      stripQuotedHistory(
        [
          'Allo! Follow up MIME!',
          '',
          'De : Brendan xxx [mailto:brendan.xxx@xxx.com]',
          'Envoyé : vendredi 23 janvier 2015 16:39',
          'À : Camille XXX',
          'Objet : Follow Up',
          '',
          'Blah-blah-blah',
          '',
        ].join('\n'),
      ),
    ).toBe('Allo! Follow up MIME!');
  });

  it('should treat Danish original message headers as quotation', () => {
    expect(
      stripQuotedHistory(
        [
          'Allo! Follow up MIME!',
          '',
          'Fra: somebody@example.com',
          'Sendt: 19. march 2011 12:10',
          'Til: Somebody',
          'Emne: The manager has commented on your Loop',
          '',
          'Blah-blah-blah',
          '',
        ].join('\n'),
      ),
    ).toBe('Allo! Follow up MIME!');
  });

  it('should treat Swedish original message headers as quotation', () => {
    expect(
      stripQuotedHistory(
        [
          'Allo! Follow up MIME!',
          '',
          'Från: Anno Sportel [mailto:anno.spoel@hsbcssad.com]',
          'Skickat: den 26 augusti 2015 14:45',
          'Till: Isacson Leiff',
          'Ämne: RE: Week 36',
          '',
          'Blah-blah-blah',
          '',
        ].join('\n'),
      ),
    ).toBe('Allo! Follow up MIME!');
  });

  it('should understand French date-person-wrote splitters', () => {
    expect(
      stripQuotedHistory(
        'Lorem ipsum\n\nLe 23 janv. 2015 à 22:03, Brendan xxx <brendan.xxx@xxx.com<mailto:brendan.xxx@xxx.com>> a écrit:\n\nBonjour!',
      ),
    ).toBe('Lorem ipsum');
  });

  it('should understand Polish date-person-wrote splitters', () => {
    expect(
      stripQuotedHistory(
        'Lorem ipsum\n\nW dniu 28 stycznia 2015 01:53 użytkownik Zoe xxx <zoe.xxx@xxx.com>\nnapisał:\n\nBlah!',
      ),
    ).toBe('Lorem ipsum');
  });

  it('should understand Swedish date-person-wrote splitters', () => {
    expect(
      stripQuotedHistory(
        'Lorem\nDen 14 september, 2015 02:23:18, Valentino Rudy (valentino@rudy.be) skrev:\n\nVeniam laborum mlkshk kale chips authentic.',
      ),
    ).toBe('Lorem');
  });

  it('should understand Norwegian date-person-wrote splitters', () => {
    expect(
      stripQuotedHistory(
        'Lorem\nPå 14 september 2015 på 02:23:18, Valentino Rudy (valentino@rudy.be) skrev:\n\nVeniam laborum mlkshk kale chips authentic.',
      ),
    ).toBe('Lorem');
  });

  it('should understand Dutch date-person-wrote splitters', () => {
    expect(
      stripQuotedHistory(
        'Gluten-free culpa lo-fi et nesciunt nostrud.\n\nOp 17-feb.-2015, om 13:18 heeft Julius Caesar <pantheon@rome.com> het volgende geschreven:\n\nSmall batch beard laboris tempor.',
      ),
    ).toBe('Gluten-free culpa lo-fi et nesciunt nostrud.');
  });

  it('should not be fooled by fake quotations', () => {
    const message =
      'Visit us now for assistance...\n>>> >>>  http://www.domain.com <<<\nVisit our site by clicking the link above';

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should not treat a link as the end of a quotation', () => {
    expect(
      stripQuotedHistory(
        [
          '8.45am-1pm',
          '',
          'From: somebody@example.com',
          '',
          '<http://email.example.com/c/dHJhY2tpbmdfY29kZT1mMDdjYzBmNzM1ZjYzMGIxNT',
          '>  <bob@example.com <mailto:bob@example.com> >',
          '',
          'Requester: ',
        ].join('\n'),
      ),
    ).toBe('8.45am-1pm');

    expect(
      stripQuotedHistory(
        [
          'Blah',
          '',
          'On Thursday, October 25, 2012 at 3:03 PM, life is short. on Bob wrote:',
          '',
          '>',
          '> Post a response by replying to this email',
          '>',
          ' (http://example.com/c/YzOTYzMmE) >',
          '> life is short. (http://example.com/c/YzMmE)',
          '>',
          '',
        ].join('\n'),
      ),
    ).toBe('Blah');
  });

  it('should handle a quotation block starting with a date', () => {
    expect(
      stripQuotedHistory(
        'Blah\n\nDate: Wed, 16 May 2012 00:15:02 -0600\nTo: klizhentas@example.com',
      ),
    ).toBe('Blah');
  });

  it('should not be fooled when stars surround headers', () => {
    expect(
      stripQuotedHistory(
        [
          'Hi',
          '',
          '*From:* bob@example.com [mailto:',
          'bob@example.com]',
          '*Sent:* Wednesday, June 27, 2012 3:05 PM',
          '*To:* travis@example.com',
          '*Subject:* Hello',
          '',
        ].join('\n'),
      ),
    ).toBe('Hi');
  });

  it('should handle weird dates in a header block', () => {
    expect(
      stripQuotedHistory(
        [
          'Hi',
          '',
          'Date: Fri=2C 28 Sep 2012 10:55:48 +0000',
          'From: tickets@example.com',
          'To: bob@example.com',
          'Subject: [Ticket #8] Test',
          '',
          '',
        ].join('\n'),
      ),
    ).toBe('Hi');
  });

  it('should preserve forwarded messages', () => {
    const message = [
      'FYI',
      '',
      '---------- Forwarded message ----------',
      'From: bob@example.com',
      'Date: Tue, Sep 4, 2012 at 1:35 PM',
      'Subject: Two',
      'line subject',
      'To: rob@example.com',
      '',
      'Text',
    ].join('\n');

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should not be fooled by forwards inside quotations', () => {
    expect(
      stripQuotedHistory(
        [
          'Blah',
          '',
          '-----Original Message-----',
          '',
          'FYI',
          '',
          '---------- Forwarded message ----------',
          'From: bob@example.com',
          'Date: Tue, Sep 4, 2012 at 1:35 PM',
          'Subject: Two',
          'line subject',
          'To: rob@example.com',
          '',
          'Text',
        ].join('\n'),
      ),
    ).toBe('Blah');
  });

  it('should handle a message made of two links', () => {
    const message = '<http://link1> <http://link2>';

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should not throw on messages with malformed links', () => {
    const message =
      'http://test.lever.co/YOU HAVE AN INTERVIEW TODAY\nhttps://test.lever.co/interviews/07a605a0-0d0a-00e8-00aa-f02ca5350180 is coming up today athttps://www.google.com/calendar/event?eid=Z2FrbzhxcW0000YwbmtmMDN1ZWZ2OHAycnMgbGV2Z0000W1vLmNvbV82am00000000hvY3RjN200000000Vjc00000Bn.\n\nhttps://test.lever.co/interviews/0000a5ab-000b-43aa-a00a-f020003aaa84';

    expect(stripQuotedHistory(message)).toBe(message);
  });

  it('should stay fast on inline replies that do not end with a marker', () => {
    const message =
      'On 15-Dec-2011, at 6:54 PM, Sean Carter <s.carter@example.com> wrote:\n>-Sean' +
      '\nlorem\nipsum'.repeat(15);

    const startedAt = Date.now();

    stripQuotedHistory(message);

    expect(Date.now() - startedAt).toBeLessThan(1000);
  });
});
