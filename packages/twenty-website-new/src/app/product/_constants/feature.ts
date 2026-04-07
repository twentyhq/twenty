import type { FeatureDataType } from '@/sections/Feature/types';

export const FEATURE_DATA: FeatureDataType = {
  eyebrow: {
    heading: {
      text: 'Core Features',
      fontFamily: 'sans',
    },
  },
  heading: [
    { text: 'Everything you need,', fontFamily: 'serif' },
    { text: ' out of the box', fontFamily: 'sans' },
  ],
  mask: { src: '/images/product/feature/mask.png', alt: '' },
  tiles: [
    {
      icon: 'check',
      image: { src: '/images/product/feature/dashboards.png', alt: '' },
      heading: { text: 'Reports & Dashboards', fontFamily: 'sans' },
      bullets: [
        { text: 'Build custom dashboards' },
        { text: 'Aggregate, bar, line, pie, and gauge widgets' },
        { text: 'Filtered metrics from live CRM data' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/tasks.png', alt: '' },
      heading: { text: 'Tasks & Activities', fontFamily: 'sans' },
      bullets: [
        { text: 'Create tasks from records' },
        { text: 'Assign owners and due dates' },
        { text: 'Rich notes attached to records' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/emails.png', alt: '' },
      heading: { text: 'Email & Calendar', fontFamily: 'sans' },
      bullets: [
        { text: 'Connect Google or Microsoft accounts' },
        { text: 'Emails and events linked to CRM records' },
        { text: 'Full communication history in one place' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/contacts.png', alt: '' },
      heading: { text: 'Contacts & Companies', fontFamily: 'sans' },
      bullets: [
        { text: 'Custom fields and relationships' },
        { text: 'Unified timeline (emails, events, tasks, notes, files)' },
        { text: 'Email/calendar activity on each record' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/pipeline.png', alt: '' },
      heading: { text: 'Pipeline Management', fontFamily: 'sans' },
      bullets: [
        { text: 'Custom deal stages for your process' },
        { text: 'Drag-and-drop deals between stages' },
        { text: 'Track amount and close date' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/files.png', alt: '' },
      heading: { text: 'Files', fontFamily: 'sans' },
      bullets: [
        { text: 'Multi-file upload on records' },
        { text: 'Rename, download, and delete attachments' },
        { text: 'In-app preview for supported file types (when enabled)' },
      ],
    },
    {
      icon: 'check',
      image: { src: '/images/product/feature/data.png', alt: '' },
      heading: { text: 'Data import', fontFamily: 'sans' },
      bullets: [
        { text: 'CSV import flow' },
        { text: 'Column-to-field mapping (including relations)' },
        { text: 'CSV export anytime' },
      ],
    },
  ],
};
