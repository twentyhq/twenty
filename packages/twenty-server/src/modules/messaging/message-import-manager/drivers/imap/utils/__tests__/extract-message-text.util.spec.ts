import { type ParsedMail } from 'mailparser';

import { extractTextWithoutReplyQuotations } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-message-text.util';

describe('extractTextWithoutReplyQuotations', () => {
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
      headers: new Map(),
      headerLines: [],
      html: false,
    };

    const result = extractTextWithoutReplyQuotations(parsed);

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
      headers: new Map(),
      headerLines: [],
      html: false,
    };

    const result = extractTextWithoutReplyQuotations(parsed);

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
      headers: new Map(),
      headerLines: [],
    };

    const result = extractTextWithoutReplyQuotations(parsed);

    expect(result).toBe('just a follow up');
  });

  it('should return empty string when no text or html content', () => {
    const parsed: ParsedMail = {
      attachments: [],
      headers: new Map(),
      headerLines: [],
      html: false,
    };

    const result = extractTextWithoutReplyQuotations(parsed);

    expect(result).toBe('');
  });

  it('should prefer text over html when both are available', () => {
    const parsed: ParsedMail = {
      text: 'Plain text content\n\nOn 2023-01-01, user@example.com wrote:\n> Reply',
      html: '<html><body><p>HTML content</p></body></html>',
      attachments: [],
      headers: new Map(),
      headerLines: [],
    };

    const result = extractTextWithoutReplyQuotations(parsed);

    expect(result).toBe('Plain text content');
  });
});
