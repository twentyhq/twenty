export const AGENT_CHAT_THREAD_DATA_SEED_IDS = {
  APPLE_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000011',
  APPLE_IMPORT_THREAD: '20202020-0000-4000-8000-000000000013',
  APPLE_FOLLOW_UP_THREAD: '20202020-0000-4000-8000-000000000014',
  YCOMBINATOR_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000012',
};

type AgentChatConversationSeed = {
  threadId: string;
  exchanges: [string, string][];
};

export const APPLE_AGENT_CHAT_CONVERSATION_SEEDS: AgentChatConversationSeed[] =
  [
    {
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_IMPORT_THREAD,
      exchanges: [
        [
          'Help me prepare a company import.',
          'Let’s review the file before importing. We’ll check the columns, clean up duplicates, and confirm the field mapping. No records have been changed.',
        ],
        [
          'Which columns should I include?',
          '## Recommended columns\n\n| Source column | Twenty field | Example |\n| --- | --- | --- |\n| Company | Name | Acme Studio |\n| Website | Domain name | acme.example |\n| City | Address city | Paris |\n| Country | Address country | France |\n| Employees | Employees | 50 |\n| Annual revenue | Annual revenue | 1200000 |\n\nKeep one company per row and put contact details in a separate sheet.',
        ],
        [
          'How should I clean the domains?',
          '## Normalize company websites\n\n1. Remove leading and trailing spaces.\n2. Use the same format for every website.\n3. Check for spelling mistakes.\n4. Separate multiple websites into distinct columns.\n5. Leave unknown websites empty.\n\nFor example, `https://acme.example/about` and `acme.example` refer to the same company domain. Review duplicates before choosing which record to keep.',
        ],
        [
          'What about duplicate companies?',
          '## Review duplicates\n\nGroup rows by domain first, then review matching company names.\n\n- Keep the most complete address.\n- Prefer the most recently verified employee count.\n- Preserve useful notes from both rows.\n- Check subsidiaries before merging similar names.\n- Ask the record owner when details conflict.\n\nDo not merge companies based only on a similar name. Two separate businesses can share a name.',
        ],
        [
          'Can you give me a mapping checklist?',
          '## Confirm the mapping\n\n| Check | Expected result |\n| --- | --- |\n| Company name | Required on every row |\n| Domain | One normalized domain |\n| Employee count | Whole number |\n| Revenue | Number without currency symbols |\n| Currency | A consistent currency code |\n| Country | Consistent country names |\n| Owner | An existing workspace member |\n| Notes | Plain text or supported formatting |\n\nReview a small sample before importing the entire file.',
        ],
        [
          'How do we handle missing values?',
          '## Missing information\n\nLeave unknown values blank instead of entering placeholders such as “N/A” or “unknown”.\n\n1. Require a company name.\n2. Flag rows without a domain for manual review.\n3. Keep missing revenue empty rather than entering zero.\n4. Assign an owner only when the match is clear.\n5. Keep a separate list of rows that need follow-up.\n\nA zero is a real value; it should not mean that information is missing.',
        ],
        [
          'What should I review after a small test import?',
          '## Validate the sample\n\n- Open several imported company records.\n- Check that names and websites are in the right fields.\n- Confirm currencies and numeric formatting.\n- Check that owners resolved correctly.\n- Look for unintended duplicates.\n- Compare the imported row count with the source file.\n\nIf anything looks wrong, correct the mapping before continuing. Keep the original file so you can compare the results.',
        ],
        [
          'Summarize the next steps.',
          '## Ready for review\n\n1. Clean and normalize the source file.\n2. Review potential duplicates.\n3. Confirm field mapping and required values.\n4. Import a small sample.\n5. Review the resulting records.\n6. Import the remaining rows once the sample is correct.\n\nThis conversation is a preparation checklist. No import has been performed.',
        ],
      ],
    },
    {
      threadId: AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_FOLLOW_UP_THREAD,
      exchanges: [
        [
          'Help me plan customer follow-ups for this week.',
          'Start with customers waiting for a reply, then review upcoming renewals and recent meetings.\n\n- Monday: review open questions.\n- Wednesday: follow up after demos.\n- Friday: confirm next steps and owners.',
        ],
        [
          'Draft a short follow-up I can personalize.',
          'Hi [Name],\n\nThanks for our conversation. I’m following up on [topic] and would love to hear your thoughts. Would [day] work for a quick check-in?\n\nBest,\nTim\n\nThis is a draft for review; no message has been sent.',
        ],
      ],
    },
  ];
