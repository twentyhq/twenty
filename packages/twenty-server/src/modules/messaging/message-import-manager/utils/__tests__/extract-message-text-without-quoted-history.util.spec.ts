import { type Email as ParsedMail } from 'postal-mime';

import { extractMessageTextWithoutQuotedHistory } from 'src/modules/messaging/message-import-manager/utils/extract-message-text-without-quoted-history.util';

describe('extractMessageTextWithoutQuotedHistory', () => {
  it('should extract text from plain text emails with lot of reply quotations', () => {
    const parsed: ParsedMail = {
      text: `Hi John,

Thank you for contacting Developer Support, this is Erica again. I hope you are having a good day. 

I understand that you are unable to contact finance. Despite your account being expired, you should still be able to contact our finance team. 

Follow the link below the link for contacting our finance team. 

https://idmsa.apple.com/IDMSWebAuth/signin.html?path=/contact/finance/

Best Regards,

Erica 
Developer Support

>On Mar 26, 2025 at 6:59 PM, zef<john@gmail.com> wrote:
>
>Just bumping this incase you missed my last message
>
>On Thu, Mar 20, 2025 at 5:50 AM zef <john@gmail.com> wrote:
>
>> About that I can’t contact the finance department as I’m no longer a
>> member it doesn’t let me choose it on the contact page. Says “Permission
>> denied"
>>
>> So this was my last hope and resort
>>
>> On Thu, Mar 20, 2025 at 5:30 AM Apple Support <devprograms@apple.com>
>> wrote:
>>
>>> Hi Uzef,
>>>
>>> Thank you for contacting Developer Support, my name is Erica and I would
>>> be happy to assist you.
>>>
>>> I understand that you are contacting us regarding a balance in your
>>> account and requesting to verify your eligibility for a payout.
>>>
>>> The finance team specializes in tax, banking, and payment questions.
>>>
>>> Visit Contact Us About Financial Information
>>>  to submit your questions.
>>> For payment questions, include the Transaction ID or Consolidated Credit
>>> Identifier (CII). You'll receive an automated email with a follow-up number.
>>>
>>> Note that the finance team supports only requests in English.
>>>
>>> If you have additional questions related to this request, please refer to
>>> case number 123.
>>>
>>> Best Regards,
>>>
>>> Erica
>>>
>>> Developer Support
>>>
>>> On Mar 19, 2025 at 1:07 AM, <john@gmail.com> wrote:
>>>
>>> Product Name :  Apple Developer Support
>>>
>>> Support Category :  Membership and Account
>>>
>>> Support Topic :  Other Membership or Account Questions
>>>
>>> Additional Details :
>>>
>>> Message:
>>>
>>> Hi,
>>>
>>> I was a member of the Apple Developer Program some time ago.
>>>
>>> I'm no longer a member so it won't let me specifically select "Payments"
>>> page when contacting so I'm using this.
>>>
>>> During my period I checked my account has around $40 in revenue which
>>> meets the minimum threshold for a payout, however I never received one.
>>>
>>> I was hoping you could look into it and see if I'm eligible to get the
>>> payout?
>>>
>>> Thanks
>>>
>>> -John
`,
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe(`Hi John,

Thank you for contacting Developer Support, this is Erica again. I hope you are having a good day.

I understand that you are unable to contact finance. Despite your account being expired, you should still be able to contact our finance team.

Follow the link below the link for contacting our finance team.

https://idmsa.apple.com/IDMSWebAuth/signin.html?path=/contact/finance/

Best Regards,

Erica
Developer Support`);
  });

  it('should handle email with reply quotations (Titan email style)', () => {
    const parsed: ParsedMail = {
      text: `just a follow up
        
        
          On Aug 18 2025, at 4:06 pm, neo@titanemailtest.xyz wrote:
          
        
        
           Dear Colleagues,This is a reminder that the updated security policy goes into effect starting next Monday.  All employees must reset their corporate VPN credentials and enable two-factor authentication by then.  Please reach out to the IT helpdesk if you experience any issues during the setup.  Regards,  IT Department
        
      `,
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe('just a follow up');
  });

  it('should handle html email with reply quotations', () => {
    const parsed: ParsedMail = {
      html: `<div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">just a follow up</div><br fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"><img class="flm-open" width="0" height="0" style="border:0;width:0;height:0;" data-open-tracking-src="{{track-read-receipt}}"><div class="fr-inner gmail_quote flockmail-quote flockmail-quote-id-<186307386731076608.0.v2@titan.email>">
        <br>
        <div dir="ltr">
          On Aug 18 2025, at 4:06 pm, neo@titanemailtest.xyz wrote:
          <br>
        </div>
        <blockquote class="gmail_quote" style="margin:0 0 0 .8ex;border-left:1px #ccc solid;padding:initial;padding-left:1ex;color:inherit">
           <div id="isPasted" fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">Dear Colleagues,</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"><br fr-original-style="" style="user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"></div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">This is a reminder that the updated security policy goes into effect starting next Monday. &nbsp;</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">All employees must reset their corporate VPN credentials and enable two-factor authentication by then. &nbsp;</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"><br fr-original-style="" style="user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"></div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">Please reach out to the IT helpdesk if you experience any issues during the setup. &nbsp;</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"><br fr-original-style="" style="user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"></div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">Regards, &nbsp;</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box">IT Department</div><div fr-original-style="" style="display:block;user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"><br fr-original-style="" style="user-select:inherit;scrollbar-color:var(--scrollbar-active-color) #0000;box-sizing:border-box"></div>
        </blockquote>
      </div>`,
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe('just a follow up');
  });

  it('should return empty string when no text or html content', () => {
    const parsed: ParsedMail = {
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe('');
  });

  it('should preserve new lines in html email', () => {
    const parsed: ParsedMail = {
      attachments: [],
      headers: [],
      headerLines: [],
      html: `<html><head><style>
  html, body {
    font-size: 14.5px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    border: 0;
    margin: 0;
    padding: 0;
    overflow-x: auto;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Ubuntu, Helvetica, Arial, sans-serif;
    margin: 0;
    -webkit-text-size-adjust: auto;
    word-wrap: break-word; -webkit-nbsp-mode: space; -webkit-line-break: after-white-space;
  }

  strong, b, .bold {
    font-weight: 600;
  }

  body {
    overflow-y: hidden;
    word-break: break-word;
    filter: invert(0.88);
    --image-filter: grayscale(20%);
  }
  .theme-emoji {
    filter: var(--image-filter) invert(0.88);
  }

  a {
    color: #925b00;
  }

  a:hover {
    color: #925b00;
  }

  a:visited {
    color: #925b00;
  }
  
  a img {
    border-bottom: 0;
  }

  body.heightDetermined {
    overflow-y: hidden;
  }

  div,pre {
    max-width: 100%;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  pre.flockmail-plaintext {
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  img {
    border: 0;
  }
  img:not([src*='.svg']) {
    filter: var(--image-filter) invert(0.88);
  }
  .grayscale {
    filter: var(--image-filter) invert(0.88);
  }

  search-match, .search-match {
    background: #fff000;
    border-radius: 4px;
    box-shadow: 0 0.5px 0.5px rgba(0,0,0,0.25);
    &.current-match {
      background: #ff8b1a;
    }
  }

  table {
    word-break: initial;
    border-collapse: collapse;
  }

  a.mk-unsubscribe:not([href]), a[fr-original-class=mk-unsubscribe]:not([href]) {
    pointer-events: none !important;
  }

  p.MsoNormal, li.MsoNormal, div.MsoNormal {margin: 0px;}

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }
  
  ::-webkit-scrollbar {
    width: 14px;
    height: 14px;
    cursor: default;
  }
  
  ::-webkit-scrollbar-thumb {
    border-radius: 14px;
    background-clip: content-box;
    border: 3px solid transparent;
    background: transparent;
    box-shadow: inset 0 0 15px 15px rgba(136, 136, 136, 0.4);
  }
  ::-webkit-scrollbar-thumb:hover {
    box-shadow: inset 0 0 15px 15px #bdbdbd;
  }

  </style></head><body><div id="inbox-html-wrapper"><div id="isPasted" fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">Hi Sarah,</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"><br fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"></div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">I wanted to quickly follow up regarding the Q3 marketing campaign results. &nbsp;</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">We’ve seen a 14% increase in engagement compared to last quarter, but conversions are still slightly below target. &nbsp;</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"><br fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"></div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">Let’s schedule a short call early next week to discuss adjustments before the Q4 push. &nbsp;</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">Would Monday 10 AM work for you?</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"><br fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"></div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">Best regards, &nbsp;</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;">John</div><div fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"><br fr-original-style="" style="user-select: inherit; scrollbar-color: var(--scrollbar-active-color) #0000; box-sizing: border-box;"></div><img class="flm-open" width="0" height="0" style="border: 0px; width: 0px; height: 0px; max-width: 100vw;" data-open-tracking-src="{{track-read-receipt}}"></div></body></html>`,
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toEqual(
      `Hi Sarah,\n\nI wanted to quickly follow up regarding the Q3 marketing campaign results.\nWe’ve seen a 14% increase in engagement compared to last quarter, but conversions are still slightly below target.\n\nLet’s schedule a short call early next week to discuss adjustments before the Q4 push.\nWould Monday 10 AM work for you?\n\nBest regards,\nJohn`,
    );
  });

  it('should prefer text over html when both are available', () => {
    const parsed: ParsedMail = {
      text: 'Plain text content\n\nOn 2023-01-01, user@example.com wrote:\n> Reply',
      html: '<html><body><p>HTML content</p></body></html>',
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe('Plain text content');
  });

  it('should strip an Outlook for Mac quote container, which carries no text marker', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>My actual reply.</div><div id="OLK_SRC_BODY_SECTION"><div dir="ltr"><p>The older message body.</p></div></div>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should keep a forward whose whole body is an Outlook for Mac quote container', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div id="OLK_SRC_BODY_SECTION"><div dir="ltr"><p>The entire forwarded body.</p></div></div>',
    });

    expect(result).toBe('The entire forwarded body.');
  });

  it('should keep a forward whose whole body is a blockquote', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<blockquote type="cite"><p>The entire forwarded body.</p></blockquote>',
    });

    expect(result).toBe('> The entire forwarded body.');
  });

  it('should keep a signature written after a gmail quote', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>Sounds good.</div><div class="gmail_quote"><div>On Mon Bob wrote:</div><div>can we move it?</div></div><div>Regards, me</div>',
    });

    expect(result).toBe('Sounds good.\n\nRegards, me');
  });

  it('should keep a disclaimer written after an Outlook for Mac quote', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>Sounds good.</div><div id="OLK_SRC_BODY_SECTION"><div>can we move it?</div></div><div>Confidentiality notice</div>',
    });

    expect(result).toBe('Sounds good.\n\nConfidentiality notice');
  });

  it('should strip space stuffed quoting, which RFC 3676 senders emit', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      text: 'Sounds good.\n\n > can we move it?\n > next week?',
    });

    expect(result).toBe('Sounds good.');
  });

  it('should strip a quote whose attribution is itself quoted', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      text: 'Sounds good.\n\n> On Mon, Aug 4, 2026 at 9:14 AM Bob <bob@example.com> wrote:\n> can we move it?\n\nRegards, me',
    });

    expect(result).toBe('Sounds good.\nRegards, me');
  });

  it('should strip a German attribution, which names the sender after the verb', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      text: 'Sounds good.\n\nAm 04.08.2026 um 09:14 schrieb Bob <bob@example.com>:\ncan we move it?\n\nRegards, me',
    });

    expect(result).toBe('Sounds good.');
  });

  it('should strip a bare blockquote quote that carries no header line', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>My actual reply.</div><blockquote type="cite"><p>The older message body.</p></blockquote>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should strip plain text quoting that carries no header line', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      text: 'My actual reply.\n\n> The older message body.\n> More of it.',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should strip an Outlook desktop From block', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<p class="MsoNormal">My actual reply.</p><p class="MsoNormal">&nbsp;</p><p class="MsoNormal"><b>From:</b> Bob &lt;bob@example.com&gt;<br><b>Sent:</b> Monday, August 4, 2026 09:14<br><b>Subject:</b> RE: hi</p><p class="MsoNormal">&nbsp;</p><p class="MsoNormal">The older message body.</p>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should strip an Outlook Web From block separated by empty divs', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>My actual reply.</div><div><br></div><div>From: Bob &lt;bob@example.com&gt;</div><div>Sent: Monday, August 4, 2026</div><div><br></div><div>The older message body.</div>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should strip a From block that has no blank line before it', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<div>My actual reply.</div><div>From: Bob &lt;bob@example.com&gt;</div><div>Date: Monday, August 4, 2026</div><div>The older message body.</div>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should strip an Original Message splitter', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html: '<p>My actual reply.</p><p>-----Original Message-----<br>From: Bob &lt;bob@example.com&gt;<br>Sent: Monday, August 4, 2026 09:14</p><p>The older message body.</p>',
    });

    expect(result).toBe('My actual reply.');
  });

  it('should keep prose that merely opens lines with a field label', () => {
    const message = 'Trip details\nFrom: Paris\nTo: Berlin';

    expect(extractMessageTextWithoutQuotedHistory({ text: message })).toBe(
      message,
    );
  });

  it('should keep a date label that carries no sender address', () => {
    const message =
      'Booking summary\nDate: 4 August\nVenue: the office\nSee you there.';

    expect(extractMessageTextWithoutQuotedHistory({ text: message })).toBe(
      message,
    );
  });

  it('should still cut a header block that carries a sender address', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      text: 'Trip details\n\nFrom: Bob <bob@example.com>\nSent: Monday, August 4, 2026\n\nCan we move it?',
    });

    expect(result).toBe('Trip details');
  });

  it('should drop every level of a nested quote container', () => {
    const result = extractMessageTextWithoutQuotedHistory({
      html:
        '<div>My reply.</div>' +
        '<div class="gmail_quote"><div>outer quote</div>' +
        '<div class="gmail_quote"><div>inner quote</div></div>' +
        '<div>outer tail</div></div>' +
        '<div>Signature line.</div>',
    });

    expect(result).toBe('My reply.\n\nSignature line.');
  });

  it('should preserve percent sequences instead of URI-decoding the body', () => {
    const parsed: ParsedMail = {
      text: 'See https://example.com/path%2Fto%2Ffile and a 100%20 budget cut',
      attachments: [],
      headers: [],
      headerLines: [],
    };

    const result = extractMessageTextWithoutQuotedHistory({
      text: parsed.text,
      html: parsed.html,
    });

    expect(result).toBe(
      'See https://example.com/path%2Fto%2Ffile and a 100%20 budget cut',
    );
  });
});
