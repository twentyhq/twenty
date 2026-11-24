import { type MessageDescriptor } from '@lingui/core';

import {
  type ColumnDef,
  type RecordField,
  type RecordWidgetDefinition,
  type RowDef,
} from '@/app-preview/types';

// Fixed counts are part of the template: a page with five complaints or two
// discovery questions is a different page, so the type refuses it.
type Three<TItem> = readonly [TItem, TItem, TItem];
type Four<TItem> = readonly [TItem, TItem, TItem, TItem];
type Five<TItem> = readonly [TItem, TItem, TItem, TItem, TItem];

export type IndustryPageStatus = 'draft' | 'live';

export type IndustrySectionId =
  | 'pains'
  | 'dataModel'
  | 'workflows'
  | 'agents'
  | 'customScreen'
  | 'access'
  | 'switching'
  | 'proof'
  | 'questions'
  | 'discovery';

export type IndustryStandardObjectId = 'person' | 'company' | 'task' | 'note';

// The tabler names the product mockup can draw (app-preview PreviewIcon).
export type IndustryPreviewIconName =
  | 'book'
  | 'briefcase'
  | 'buildingSkyscraper'
  | 'calendarEvent'
  | 'checkbox'
  | 'coins'
  | 'fileText'
  | 'folder'
  | 'home'
  | 'key'
  | 'mapPin'
  | 'notes'
  | 'planet'
  | 'school'
  | 'search'
  | 'shieldCheck'
  | 'tag'
  | 'targetArrow'
  | 'user'
  | 'users';

export type IndustryPreviewTone =
  | 'amber'
  | 'blue'
  | 'gray'
  | 'green'
  | 'orange'
  | 'pink'
  | 'purple'
  | 'red'
  | 'teal';

export type IndustryPoint = {
  title: MessageDescriptor;
  body: MessageDescriptor;
};

export type IndustryField = {
  label: MessageDescriptor;
  relatesTo?: string;
};

export type IndustryObject = {
  id: string;
  label: MessageDescriptor;
  purpose: MessageDescriptor;
  fields: readonly IndustryField[];
  previewIcon: IndustryPreviewIconName;
  previewTone: IndustryPreviewTone;
};

export type IndustryPain = {
  complaint: MessageDescriptor;
  answer: MessageDescriptor;
  answeredBy: IndustrySectionId;
};

export type IndustryWorkflowStep = {
  kind: 'trigger' | 'action' | 'agent';
  label: MessageDescriptor;
};

export type IndustryWorkflow = {
  title: MessageDescriptor;
  outcome: MessageDescriptor;
  steps: readonly IndustryWorkflowStep[];
};

export type IndustryAgent = {
  name: MessageDescriptor;
  job: MessageDescriptor;
  reads: readonly string[];
  writes: readonly string[];
  limit: MessageDescriptor;
};

// `preview` is the same screen drawn inside the hero's record page.
export type IndustryCustomScreen = {
  title: MessageDescriptor;
  placedOn: string;
  description: MessageDescriptor;
  preview: RecordWidgetDefinition;
};

export type IndustryRole = {
  id: string;
  label: MessageDescriptor;
};

export type IndustryAccessRule = {
  objectId: string;
  accessByRoleId: Readonly<Record<string, MessageDescriptor>>;
};

export type IndustryObjectMapping = {
  salesforceObject: string;
  objectId: string;
};

export type IndustrySwitching = {
  salesforceProduct: string;
  mappings: readonly IndustryObjectMapping[];
  note: MessageDescriptor;
};

// No proof renders no section: a page never fills the slot with a made-up one.
export type IndustryProof =
  | { kind: 'caseStudy'; caseStudySlug: string }
  | { kind: 'none' };

export type IndustryQuestion = {
  question: MessageDescriptor;
  answer: MessageDescriptor;
};

export type IndustryDiscoveryQuestion = {
  question: MessageDescriptor;
  shapes: MessageDescriptor;
};

// Product-mockup strings stay untranslated, like the rest of app-preview.
// The record opens on the custom screen, so it belongs to the object the
// screen is placed on.
export type IndustryPreviewRecord = {
  name: string;
  createdAt: string;
  fields: RecordField[];
};

export type IndustryPreview = {
  workspaceName: string;
  tableObjectId: string;
  viewName: string;
  columns: ColumnDef[];
  rows: RowDef[];
  record: IndustryPreviewRecord;
};

export type IndustryHero = {
  headline: MessageDescriptor;
  body: MessageDescriptor;
};

export type IndustryMeta = {
  title: MessageDescriptor;
  description: MessageDescriptor;
};

export type IndustryCategoryPage = {
  kind: 'category';
  slug: string;
  status: IndustryPageStatus;
  name: MessageDescriptor;
  meta: IndustryMeta;
  hero: IndustryHero;
  preview: IndustryPreview;
  pains: Four<IndustryPain>;
  dataModel: {
    heading: MessageDescriptor;
    objects: readonly IndustryObject[];
    notes: Three<IndustryPoint>;
  };
  workflows: {
    heading: MessageDescriptor;
    items: Three<IndustryWorkflow>;
  };
  agents: {
    heading: MessageDescriptor;
    items: readonly IndustryAgent[];
  };
  customScreen: IndustryCustomScreen;
  access: {
    heading: MessageDescriptor;
    roles: readonly IndustryRole[];
    rules: readonly IndustryAccessRule[];
  };
  switching: IndustrySwitching;
  proof: IndustryProof;
  questions: readonly IndustryQuestion[];
  discovery: Five<IndustryDiscoveryQuestion>;
};

// A sub-category page inherits its category and states only what differs.
// Lists it replaces are spelled out in full: reuse a category item by
// referencing it from the category's data file.
export type IndustrySubCategoryPage = {
  kind: 'subCategory';
  slug: string;
  parentSlug: string;
  status: IndustryPageStatus;
  name: MessageDescriptor;
  meta: IndustryMeta;
  hero: IndustryHero;
  preview: IndustryPreview;
  pains?: Four<IndustryPain>;
  addedObjects: readonly IndustryObject[];
  workflows: Three<IndustryWorkflow>;
  customScreen?: IndustryCustomScreen;
  questions: readonly IndustryQuestion[];
  proof?: IndustryProof;
};

export type IndustryPageDefinition =
  | IndustryCategoryPage
  | IndustrySubCategoryPage;

export type ResolvedIndustryPage = Omit<IndustryCategoryPage, 'kind'> & {
  parent?: { slug: string; name: MessageDescriptor };
};
