import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

export type FaqQuestionType = {
  question: MessageDescriptor;
  answer: MessageDescriptor;
};

export const FAQ_QUESTIONS: FaqQuestionType[] = [
  {
    question: msg`Is Twenty really open-source?`,
    answer: msg`Yes. Twenty is the #1 Open Source CRM on GitHub. You can self-host to fully own your infrastructure, or run it on our managed cloud for a zero-ops setup.`,
  },
  {
    question: msg`How long does it take to get started?`,
    answer: msg`Sign up for Cloud in under a minute and start your 30-day trial. For larger rollouts, our 4-hour Onboarding Packs or certified partners get you live in 1–2 weeks.`,
  },
  {
    question: msg`Can I migrate from Salesforce or HubSpot?`,
    answer: msg`Yes. Import your data via CSV, or use our API for 50,000+ records. Our partners can handle the full migration for you.`,
  },
  {
    question: msg`Do I need a developer to customize Twenty?`,
    answer: msg`No. Build custom objects, fields, views, and no-code workflows straight from Settings. Unlimited, no extra charge.`,
  },
  {
    question: msg`Can developers extend Twenty with code?`,
    answer: msg`Yes, with our Apps framework. Scaffold an extension with \`npx create-twenty-app\` and ship custom objects, server-side logic functions, React components that render inside Twenty\u2019s UI, AI skills and agents, views, and navigation, all in TypeScript, deployable to any workspace.`,
  },
  {
    question: msg`Does Twenty work with Claude, ChatGPT, and Cursor?`,
    answer: msg`Yes. Every Cloud workspace ships with a native MCP server. Connect your AI assistant via OAuth and it can read and write your CRM data in natural language.`,
  },
  {
    question: msg`What does Twenty cost?`,
    answer: msg`Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.`,
  },
];
