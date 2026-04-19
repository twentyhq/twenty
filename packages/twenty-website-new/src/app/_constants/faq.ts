import type { FaqDataType } from '@/sections/Faq/types';

export const FAQ_DATA: FaqDataType = {
  illustration: 'faqBackground',
  eyebrow: {
    heading: {
      text: 'Any Questions?',
      fontFamily: 'sans',
    },
  },
  heading: [
    {
      text: 'Stop fighting custom.\n',
      fontFamily: 'serif',
    },
    {
      text: ' Start building, with Twenty',
      fontFamily: 'sans',
    },
  ],
  questions: [
    {
      question: {
        text: 'Is Twenty really open-source?',
        fontFamily: 'sans',
      },
      answer: {
        text: "Yes. Twenty is the #1 open-source CRM on GitHub. Most teams run it on our managed cloud for zero-ops setup; self-hosting is always available if you'd rather own the infrastructure.",
      },
    },
    {
      question: {
        text: 'How long does it take to get started?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Sign up for Cloud in under a minute and start your 30-day trial. For larger rollouts, our 4-hour Onboarding Packs or certified partners get you live in 1–2 weeks.',
      },
    },
    {
      question: {
        text: 'Can I migrate from Salesforce or HubSpot?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Yes. Import your data via CSV, or use our API for 50,000+ records. Our partners can handle the full migration for you.',
      },
    },
    {
      question: {
        text: 'Do I need a developer to customize Twenty?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'No. Build custom objects, fields, views, and no-code workflows straight from Settings. Unlimited, no extra charge.',
      },
    },
    {
      question: {
        text: 'Can developers extend Twenty with code?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Yes, with our Apps framework. Scaffold an extension with `npx create-twenty-app` and ship custom objects, server-side logic functions, React components that render inside Twenty\u2019s UI, AI skills and agents, views, and navigation, all in TypeScript, deployable to any workspace.',
      },
    },
    {
      question: {
        text: 'Does Twenty work with Claude, ChatGPT, and Cursor?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Yes. Every Cloud workspace ships with a native MCP server. Connect your AI assistant via OAuth and it can read and write your CRM data in natural language.',
      },
    },
    {
      question: {
        text: 'What does Twenty cost?',
        fontFamily: 'sans',
      },
      answer: {
        text: 'Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams needing enterprise-grade security.',
      },
    },
  ],
};
