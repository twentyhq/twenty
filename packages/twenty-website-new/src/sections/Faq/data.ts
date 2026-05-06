import { msg } from '@lingui/core/macro';
import type { FaqDataType } from '@/sections/Faq/types';

export const FAQ_DATA: FaqDataType = {
  eyebrow: {
    heading: {
      text: msg`Any Questions?`,
      fontFamily: 'sans',
    },
  },
  questions: [
    {
      question: {
        text: msg`Is Twenty really open-source?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Yes. Twenty is the #1 Open Source CRM on GitHub. You can self-host to fully own your infrastructure, or run it on our managed cloud for a zero-ops setup.`,
      },
    },
    {
      question: {
        text: msg`How long does it take to get started?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Sign up for Cloud in under a minute and start your 30-day trial. For larger rollouts, our 4-hour Onboarding Packs or certified partners get you live in 1–2 weeks.`,
      },
    },
    {
      question: {
        text: msg`Can I migrate from Salesforce or HubSpot?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Yes. Import your data via CSV, or use our API for 50,000+ records. Our partners can handle the full migration for you.`,
      },
    },
    {
      question: {
        text: msg`Do I need a developer to customize Twenty?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`No. Build custom objects, fields, views, and no-code workflows straight from Settings. Unlimited, no extra charge.`,
      },
    },
    {
      question: {
        text: msg`Can developers extend Twenty with code?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Yes, with our Apps framework. Scaffold an extension with \`npx create-twenty-app\` and ship custom objects, server-side logic functions, React components that render inside Twenty\u2019s UI, AI skills and agents, views, and navigation, all in TypeScript, deployable to any workspace.`,
      },
    },
    {
      question: {
        text: msg`Does Twenty work with Claude, ChatGPT, and Cursor?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Yes. Every Cloud workspace ships with a native MCP server. Connect your AI assistant via OAuth and it can read and write your CRM data in natural language.`,
      },
    },
    {
      question: {
        text: msg`What does Twenty cost?`,
        fontFamily: 'sans',
      },
      answer: {
        text: msg`Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.`,
      },
    },
  ],
};
