import { msg } from '@lingui/core/macro';
import type { ImageType } from '@/design-system/components/Image';
import type { FeatureTileType } from '@/sections/Feature';

export const FEATURE_MASK: ImageType = {
  src: '/images/product/feature/mask.webp',
  alt: '',
};

export const FEATURE_TILES: FeatureTileType[] = [
  {
    icon: 'check',
    image: { src: '/images/product/feature/dashboards.webp', alt: '' },
    heading: msg`Reports & Dashboards`,
    bullets: [
      msg`Build custom dashboards`,
      msg`Aggregate, bar, line, pie, and gauge widgets`,
      msg`Filtered metrics from live CRM data`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/tasks.webp', alt: '' },
    heading: msg`Tasks & Activities`,
    bullets: [
      msg`Create tasks from records`,
      msg`Assign owners and due dates`,
      msg`Rich notes attached to records`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/emails.webp', alt: '' },
    heading: msg`Email & Calendar`,
    bullets: [
      msg`Connect Google or Microsoft accounts`,
      msg`Emails and events linked to CRM records`,
      msg`Full communication history in one place`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/contacts.webp', alt: '' },
    heading: msg`Contacts & Companies`,
    bullets: [
      msg`Custom fields and relationships`,
      msg`Unified timeline (emails, events, tasks, notes, files)`,
      msg`Email/calendar activity on each record`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/pipeline.webp', alt: '' },
    heading: msg`Pipeline Management`,
    bullets: [
      msg`Custom deal stages for your process`,
      msg`Drag-and-drop deals between stages`,
      msg`Track amount and close date`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/files.webp', alt: '' },
    heading: msg`Files`,
    bullets: [
      msg`Multi-file upload on records`,
      msg`Rename, download, and delete attachments`,
      msg`In-app preview for supported file types (when enabled)`,
    ],
  },
  {
    icon: 'check',
    image: { src: '/images/product/feature/data.webp', alt: '' },
    heading: msg`Data import`,
    bullets: [
      msg`CSV import flow`,
      msg`Column-to-field mapping (including relations)`,
      msg`CSV export anytime`,
    ],
  },
];
