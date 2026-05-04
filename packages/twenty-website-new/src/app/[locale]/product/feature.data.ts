import { msg } from '@lingui/core/macro';
import type { FeatureDataType } from '@/sections/Feature/types';

export const FEATURE_DATA: FeatureDataType = {
  eyebrow: {
    heading: {
      text: msg`Core Features`,
      fontFamily: 'sans',
    },
  },
  mask: { src: '/images/product/feature/mask.webp', alt: '' },
  tiles: [
    {
      icon: 'check',
      image: { src: '/images/product/feature/dashboards.webp', alt: '' },
      heading: { text: msg`Reports & Dashboards`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Build custom dashboards` },
        { text: msg`Aggregate, bar, line, pie, and gauge widgets` },
        { text: msg`Filtered metrics from live CRM data` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/tasks.webp', alt: '' },
      heading: { text: msg`Tasks & Activities`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Create tasks from records` },
        { text: msg`Assign owners and due dates` },
        { text: msg`Rich notes attached to records` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/emails.webp', alt: '' },
      heading: { text: msg`Email & Calendar`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Connect Google or Microsoft accounts` },
        { text: msg`Emails and events linked to CRM records` },
        { text: msg`Full communication history in one place` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/contacts.webp', alt: '' },
      heading: { text: msg`Contacts & Companies`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Custom fields and relationships` },
        { text: msg`Unified timeline (emails, events, tasks, notes, files)` },
        { text: msg`Email/calendar activity on each record` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/pipeline.webp', alt: '' },
      heading: { text: msg`Pipeline Management`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Custom deal stages for your process` },
        { text: msg`Drag-and-drop deals between stages` },
        { text: msg`Track amount and close date` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/files.webp', alt: '' },
      heading: { text: msg`Files`, fontFamily: 'sans' },
      bullets: [
        { text: msg`Multi-file upload on records` },
        { text: msg`Rename, download, and delete attachments` },
        { text: msg`In-app preview for supported file types (when enabled)` },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/data.webp', alt: '' },
      heading: { text: msg`Data import`, fontFamily: 'sans' },
      bullets: [
        { text: msg`CSV import flow` },
        { text: msg`Column-to-field mapping (including relations)` },
        { text: msg`CSV export anytime` },
      ],
    },
  ],
};
