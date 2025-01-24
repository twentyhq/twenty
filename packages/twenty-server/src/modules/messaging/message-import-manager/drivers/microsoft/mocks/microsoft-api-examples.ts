export const microsoftGraphWithMessages = {
  '@odata.context':
    'https://graph.microsoft.com/beta/$metadata#Collection(message)',
  value: [
    {
      '@odata.type': '#microsoft.graph.message',
      '@odata.etag': 'W/"CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAACItFa"',
      id: 'AAMkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwBGAAAAAADzAhgkpMbwQYnkXH1D-Va3BwAadQ_1xAL8SLCZzf1KYyk_AAAAAAEMAAAadQ_1xAL8SLCZzf1KYyk_AAACJSmSAAA=',
    },
  ],
  '@odata.nextLink':
    "https://graph.microsoft.com/beta/me/mailFolders('inbox')/messages/delta?$skiptoken=jWnSM_TVmEdmKBzfVjDdNbDwpt3yYSUqEf9CFdhRcTxhbogC9oaTvY1ZdONMplHuz0pwtPay_qkEcFQ5RLEuDZ3O6IgnI5FXRcfekzOECWlL7zRVdGBidZ5TkXmXV7O7P8cxtvBMFJ2_dV951teFMatpdnD6hvksBK0Ff4tJKfo.HvZwAw_DM9PR3xf90ThtbqSdMCkGCHNPkjpaedxSBN3",
};

export const microsoftGraphBatchWithTwoMessagesResponse = [
  {
    responses: [
      {
        id: '2',
        status: 200,
        headers: {
          'Cache-Control': 'private',
          'Content-Type':
            'application/json; odata.metadata=minimal; odata.streaming=true; IEEE754Compatible=false; charset=utf-8',
        },
        body: {
          '@odata.context':
            "https://graph.microsoft.com/v1.0/$metadata#users('599cbaf7-873d-4b6f-b374-f87d3605e9e0')/messages/$entity",
          '@odata.etag': 'W/"CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAACItFa"',
          id: 'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
          createdDateTime: '2025-01-10T13:31:37Z',
          lastModifiedDateTime: '2025-01-10T13:31:38Z',
          changeKey: 'CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAACItFa',
          categories: [],
          receivedDateTime: '2025-01-10T13:31:37Z',
          sentDateTime: '2025-01-10T13:31:34Z',
          hasAttachments: true,
          internetMessageId:
            '<FRZP194MB2383FF1CFE426952F85B1110981C3@FRAP194MB2383.EURP194.PROD.OUTLOOK.COM>',
          subject: 'test email John: number 4',
          bodyPreview: 'test 4',
          importance: 'normal',
          parentFolderId:
            'AAMkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAuAAAAAADzAhgkpMbwQYnkXH1D-Va3AQAadQ_1xAL8SLCZzf1KYyk_AAAAAAEMAAA=',
          conversationId:
            'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQAAZhOZ86nXZElRkxyGJRiY8=',
          conversationIndex: 'AQHbY2PrBmE5nzqddkSVGTHIYlGJjw==',
          isDeliveryReceiptRequested: null,
          isReadReceiptRequested: false,
          isRead: false,
          isDraft: false,
          webLink:
            'https://outlook.office365.com/owa/?ItemID=AAkALgAAAAAAHYQDEapmEc2byACqAC%2FEWg0AGnUPtcQC%2FEiwmc39SmMpPgAAAiVYkAAA&exvsurl=1&viewmodel=ReadMessageItem',
          inferenceClassification: 'focused',
          body: {
            contentType: 'text',
            content: 'plain text format test 4',
          },
          sender: {
            emailAddress: {
              name: 'John l',
              address: 'John.l@outlook.fr',
            },
          },
          from: {
            emailAddress: {
              name: 'John l',
              address: 'John.l@outlook.fr',
            },
          },
          toRecipients: [
            {
              emailAddress: {
                name: 'Walker',
                address: 'walker@felixacme.onmicrosoft.com',
              },
            },
          ],
          ccRecipients: [],
          bccRecipients: [],
          replyTo: [],
          flag: {
            flagStatus: 'notFlagged',
          },
        },
      },
      {
        id: '1',
        status: 200,
        headers: {
          'Cache-Control': 'private',
          'Content-Type':
            'application/json; odata.metadata=minimal; odata.streaming=true; IEEE754Compatible=false; charset=utf-8',
        },
        body: {
          '@odata.context':
            "https://graph.microsoft.com/v1.0/$metadata#users('599cbaf7-873d-4b6f-b374-f87d3605e9e0')/messages/$entity",
          '@odata.etag': 'W/"CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAADw4Em"',
          id: 'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAA8ZAfgAA',
          createdDateTime: '2025-01-13T09:38:06Z',
          lastModifiedDateTime: '2025-01-13T11:50:48Z',
          changeKey: 'CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAADw4Em',
          categories: [],
          receivedDateTime: '2025-01-13T09:38:06Z',
          sentDateTime: '2025-01-13T09:38:01Z',
          hasAttachments: false,
          internetMessageId:
            '<dfe8ac36-cf4c-4842-a506-034548452966@az.westus2.microsoft.com>',
          subject: 'test subject',
          bodyPreview: 'You now have 2 licenses',
          importance: 'normal',
          parentFolderId:
            'AAMkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAuAAAAAADzAhgkpMbwQYnkXH1D-Va3AQAadQ_1xAL8SLCZzf1KYyk_AAAAAAEMAAA=',
          conversationId:
            'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQADz34qcnxpxEidnAJbZA-OI=',
          conversationIndex: 'AQHbZZ7ZPPfipyfGnESJ2cAltkD84g==',
          isDeliveryReceiptRequested: null,
          isReadReceiptRequested: false,
          isRead: false,
          isDraft: false,
          webLink:
            'https://outlook.office365.com/owa/?ItemID=AAkALgAAAAAAHYQDEapmEc2byACqAC%2FEWg0AGnUPtcQC%2FEiwmc39SmMpPgAAA8ZAfgAA&exvsurl=1&viewmodel=ReadMessageItem',
          inferenceClassification: 'focused',
          body: {
            contentType: 'text',
            content: 'You will send a message in the plain text format',
          },
          sender: {
            emailAddress: {
              name: 'Microsoft',
              address: 'microsoft-noreply@microsoft.com',
            },
          },
          from: {
            emailAddress: {
              name: 'Microsoft',
              address: 'microsoft-noreply@microsoft.com',
            },
          },
          toRecipients: [
            {
              emailAddress: {
                name: 'Walker',
                address: 'walker@felixacme.onmicrosoft.com',
              },
            },
          ],
          ccRecipients: [
            {
              emailAddress: {
                name: 'Antoine',
                address: 'antoine@gmail.com',
              },
            },
            {
              emailAddress: {
                name: 'Cyril@acme2.com',
                address: 'cyril@acme2.com',
              },
            },
          ],
          bccRecipients: [],
          replyTo: [],
          flag: {
            flagStatus: 'notFlagged',
          },
        },
      },
    ],
  },
];

export const microsoftGraphBatchWithHtmlMessagesResponse = [
  {
    responses: [
      {
        id: '2',
        status: 200,
        headers: {
          'Cache-Control': 'private',
          'Content-Type':
            'application/json; odata.metadata=minimal; odata.streaming=true; IEEE754Compatible=false; charset=utf-8',
        },
        body: {
          '@odata.context':
            "https://graph.microsoft.com/v1.0/$metadata#users('599cbaf7-873d-4b6f-b374-f87d3605e9e0')/messages/$entity",
          '@odata.etag': 'W/"CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAACItFa"',
          id: 'AAkALgAAAAAAHYQDEapmEc2byACqAC-EWg0AGnUPtcQC-Eiwmc39SmMpPgAAAiVYkAAA',
          createdDateTime: '2025-01-10T13:31:37Z',
          lastModifiedDateTime: '2025-01-10T13:31:38Z',
          changeKey: 'CQAAABYAAAAadQ+1xAL8SLCZzf1KYyk+AAACItFa',
          categories: [],
          receivedDateTime: '2025-01-10T13:31:37Z',
          sentDateTime: '2025-01-10T13:31:34Z',
          hasAttachments: true,
          internetMessageId:
            '<FRZP194MB2383FF1CFE426952F85B1110981C3@FRAP194MB2383.EURP194.PROD.OUTLOOK.COM>',
          subject: 'test email John: number 5',
          bodyPreview: 'test 5',
          importance: 'normal',
          parentFolderId:
            'AAMkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAuAAAAAADzAhgkpMbwQYnkXH1D-Va3AQAadQ_1xAL8SLCZzf1KYyk_AAAAAAEMAAA=',
          conversationId:
            'AAQkAGZlMDQ1NjU5LTUzN2UtNDAyMC1hNmVlLTZhZmExMGU3ZDU1NwAQAAZhOZ86nXZElRkxyGJRiY9=',
          conversationIndex: 'AQHbY2PrBmE5nzqddkSVGTHIYlGJjr==',
          isDeliveryReceiptRequested: null,
          isReadReceiptRequested: false,
          isRead: false,
          isDraft: false,
          webLink:
            'https://outlook.office365.com/owa/?ItemID=AAkALgAAAAAAHYQDEapmEc2byACqAC%2FEWg0AGnUPtcQC%2FEiwmc39SmMpPgAAAiVYkAAA&exvsurl=1&viewmodel=ReadMessageItem',
          inferenceClassification: 'focused',
          body: {
            contentType: 'html',
            content:
              '<html><head>\r\n<meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body><div dir="ltr"><div dir="ltr"><div dir="ltr"><br></div></div><div id="divRplyFwdMsg" dir="ltr"><div>&nbsp;</div></div><div dir="ltr"><div class="x_elementToProof" style="font-family:Calibri,Helvetica,sans-serif; font-size:12pt; color:rgb(0,0,0)">test 4</div></div></div></body></html>',
          },
          sender: {
            emailAddress: {
              name: 'John l',
              address: 'John.l@outlook.fr',
            },
          },
          from: {
            emailAddress: {
              name: 'John l',
              address: 'John.l@outlook.fr',
            },
          },
          toRecipients: [],
          ccRecipients: [],
          bccRecipients: [],
          replyTo: [],
          flag: {
            flagStatus: 'notFlagged',
          },
        },
      },
    ],
  },
];
