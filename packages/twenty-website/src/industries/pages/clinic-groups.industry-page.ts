import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';
import { HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE } from './healthcare-life-sciences.industry-page';

const referrerRow = (
  id: string,
  name: string,
  type: string,
  site: string,
  referrals: string,
  trend: { value: string; color: 'green' | 'gray' | 'red' | 'amber' },
  liaison: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'purple' },
    type: { type: 'select', color: 'blue', value: type },
    site: { type: 'entity', name: site },
    referrals: { type: 'number', value: referrals },
    trend: { type: 'select', ...trend },
    liaison: { type: 'person', name: liaison, kind: 'person', tone: 'gray' },
  },
});

export const CLINIC_GROUPS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'clinic-groups',
  parentSlug: 'healthcare-life-sciences',
  status: 'draft',
  name: msg`Clinic groups`,
  meta: {
    title: msg`Twenty for clinic groups — track referrers, referral volumes and partnerships by site`,
    description: msg`Track referrers, monthly referral volumes, sites and partnership agreements in an open source CRM. Patient records stay in clinical systems. See an example clinic group workspace.`,
  },
  hero: {
    headline: msg`Know which referrers *keep each clinic full*`,
    body: msg`Referrers, referral volumes, sites and partnership agreements, for the growth team of a multi-site clinic group. Patient records stay in clinical systems. Here is an example workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Harbourline Clinics',
    tableObjectId: 'referrer',
    viewName: 'Top referrers',
    columns: [
      { id: 'name', label: 'Referrer', width: 200, isFirstColumn: true },
      { id: 'type', label: 'Type', width: 120 },
      { id: 'site', label: 'Main site', width: 180 },
      {
        id: 'referrals',
        label: 'Referrals, 30 days',
        width: 150,
        align: 'right',
      },
      { id: 'trend', label: 'Trend', width: 120 },
      { id: 'liaison', label: 'Liaison', width: 150 },
    ],
    rows: [
      referrerRow(
        'elmgrove',
        'Elmgrove Family Practice',
        'Practice',
        'Harbourline Quayside',
        '64',
        { value: 'Down 34%', color: 'red' },
        'Saoirse Doyle',
      ),
      referrerRow(
        'kessler',
        'Dr. Hannah Kessler',
        'Clinician',
        'Harbourline Westfield',
        '41',
        { value: 'Up 12%', color: 'green' },
        'Tomasz Wilk',
      ),
      referrerRow(
        'ridgeway',
        'Ridgeway Sports Medicine',
        'Practice',
        'Harbourline Westfield',
        '38',
        { value: 'Steady', color: 'gray' },
        'Tomasz Wilk',
      ),
      referrerRow(
        'northpoint',
        'Northpoint GP Partners',
        'Practice',
        'Harbourline Quayside',
        '29',
        { value: 'Down 11%', color: 'amber' },
        'Saoirse Doyle',
      ),
      referrerRow(
        'oyelaran',
        'Dr. Marcus Oyelaran',
        'Clinician',
        'Harbourline Millbank',
        '17',
        { value: 'New', color: 'green' },
        'Jonah Ellery',
      ),
    ],
    record: {
      name: 'Elmgrove Family Practice',
      createdAt: 'Added Feb 2',
      fields: [
        {
          label: 'Type',
          value: { type: 'select', color: 'blue', value: 'Practice' },
        },
        {
          label: 'Specialty',
          value: { type: 'text', value: 'General practice' },
        },
        { label: 'Region', value: { type: 'text', value: 'Harbour North' } },
        {
          label: 'Liaison',
          value: { type: 'person', name: 'Saoirse Doyle', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`We notice a practice stopped referring when the schedule is already empty.`,
      answer: msg`A monthly workflow compares volumes and opens a task when a referrer drops by 30% or more.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Nobody can say which referrers fill which site.`,
      answer: msg`The referral trend screen shows each referrer's volume by month, site and service line.`,
      answeredBy: 'customScreen',
    },
    {
      complaint: msg`A new site opens and outreach starts weeks late.`,
      answer: msg`Setting a site to opening creates an outreach task for every referrer in its region.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`Patient data cannot sit in a sales tool.`,
      answer: msg`It never has to. Referral volumes arrive as monthly counts, and patient records stay in clinical systems.`,
      answeredBy: 'dataModel',
    },
  ],
  addedObjects: [
    {
      id: 'referrer',
      label: msg`Referrers`,
      purpose: msg`A clinician or practice that sends patients to your sites.`,
      fields: [
        { label: msg`Type` },
        { label: msg`Specialty` },
        { label: msg`Clinician`, relatesTo: 'person' },
        { label: msg`Practice`, relatesTo: 'company' },
      ],
      previewIcon: 'user',
      previewTone: 'purple',
    },
    {
      id: 'referralVolume',
      label: msg`Referral volumes`,
      purpose: msg`How many referrals one referrer sent to one site in a month. A count, never a patient.`,
      fields: [
        { label: msg`Month` },
        { label: msg`Count` },
        { label: msg`Referrer`, relatesTo: 'referrer' },
        { label: msg`Site`, relatesTo: 'site' },
        { label: msg`Service line`, relatesTo: 'serviceLine' },
      ],
      previewIcon: 'coins',
      previewTone: 'amber',
    },
    {
      id: 'site',
      label: msg`Sites`,
      purpose: msg`One clinic location, with its region, opening date and status.`,
      fields: [
        { label: msg`Region` },
        { label: msg`Opening date` },
        { label: msg`Service lines`, relatesTo: 'serviceLine' },
      ],
      previewIcon: 'mapPin',
      previewTone: 'teal',
    },
    {
      id: 'serviceLine',
      label: msg`Service lines`,
      purpose: msg`A service offered across sites, such as physiotherapy or imaging.`,
      fields: [
        { label: msg`Weekly capacity` },
        { label: msg`Sites`, relatesTo: 'site' },
      ],
      previewIcon: 'tag',
      previewTone: 'green',
    },
    {
      id: 'partnershipAgreement',
      label: msg`Partnership agreements`,
      purpose: msg`A formal arrangement with a hospital, insurer or employer, with a renewal date.`,
      fields: [
        { label: msg`Renews on` },
        { label: msg`Partner`, relatesTo: 'company' },
        { label: msg`Sites covered`, relatesTo: 'site' },
      ],
      previewIcon: 'fileText',
      previewTone: 'gray',
    },
  ],
  omittedObjectIds: [
    'facility',
    'department',
    'stakeholder',
    'deal',
    'contract',
    'visit',
  ],
  modelNotes: [
    {
      title: msg`Referrers are people and practices`,
      body: msg`A referrer links the clinician to their practice, so a move between practices keeps the history.`,
    },
    {
      title: msg`Volumes are counts`,
      body: msg`Each record is one referrer, one site, one month and a number. Patient records stay in clinical systems.`,
    },
    {
      title: msg`Sites and service lines are records`,
      body: msg`Volumes point to both, so you can read referrals by location or by service.`,
    },
  ],
  workflows: [
    {
      title: msg`Referrer volume drop`,
      outcome: msg`A liaison calls a referrer the month volumes fall, not a quarter later.`,
      steps: [
        { kind: 'trigger', label: msg`On the 2nd of every month` },
        { kind: 'action', label: msg`Find last month's referral volumes` },
        {
          kind: 'action',
          label: msg`Compare each referrer with the month before`,
        },
        { kind: 'action', label: msg`If down 30% or more` },
        {
          kind: 'action',
          label: msg`Create a relationship task for the liaison`,
        },
      ],
    },
    {
      title: msg`New site opening`,
      outcome: msg`Every referrer near a new site hears about it before the doors open.`,
      steps: [
        { kind: 'trigger', label: msg`Site status changes to Opening` },
        { kind: 'action', label: msg`Find referrers in the site's region` },
        {
          kind: 'action',
          label: msg`Create an outreach task for each referrer`,
        },
        { kind: 'action', label: msg`Email the growth lead the outreach list` },
      ],
    },
    {
      title: msg`Partnership agreement renewal`,
      outcome: msg`Every renewal starts four months out, with the volumes to argue from.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        { kind: 'action', label: msg`Find agreements renewing in 120 days` },
        {
          kind: 'agent',
          label: msg`Summarize referral volumes at the covered sites`,
        },
        {
          kind: 'action',
          label: msg`Create a renewal task for the growth lead`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Referral trend`,
    placedOn: 'referrer',
    description: msg`A referrer's monthly volume by site and service line, with the change from the month before.`,
    preview: {
      tabLabel: 'Referral trend',
      title: 'Referral trend',
      caption: 'Last four months, all sites',
      columns: ['Month', 'Site', 'Service line', 'Referrals'],
      rows: [
        {
          id: 'november',
          highlighted: true,
          cells: [
            { type: 'text', value: 'November' },
            { type: 'text', value: 'Quayside' },
            { type: 'text', value: 'Physiotherapy' },
            { type: 'select', color: 'red', value: '64, down 34%' },
          ],
        },
        {
          id: 'october',
          cells: [
            { type: 'text', value: 'October' },
            { type: 'text', value: 'Quayside' },
            { type: 'text', value: 'Physiotherapy' },
            { type: 'select', color: 'gray', value: '97' },
          ],
        },
        {
          id: 'september',
          cells: [
            { type: 'text', value: 'September' },
            { type: 'text', value: 'Quayside' },
            { type: 'text', value: 'Physiotherapy' },
            { type: 'select', color: 'gray', value: '93' },
          ],
        },
        {
          id: 'august',
          cells: [
            { type: 'text', value: 'August' },
            { type: 'text', value: 'Quayside' },
            { type: 'text', value: 'Physiotherapy' },
            { type: 'select', color: 'gray', value: '101' },
          ],
        },
      ],
      footnote: 'Physiotherapy referrals fell by a third in November.',
    },
  },
  agents: {
    heading: msg`Agents that read the numbers. *Liaisons keep the relationships*`,
    items: [
      {
        name: msg`Referrer briefer`,
        job: msg`Before a liaison meets a referrer, summarizes their volume trend by site and service line in a note.`,
        reads: ['referrer', 'referralVolume', 'site', 'serviceLine', 'task'],
        writes: ['note'],
        limit: msg`Reads referral counts only. There is no patient data in the workspace to read.`,
      },
      {
        name: msg`Renewal analyst`,
        job: msg`Ahead of a partnership renewal, compares referral volumes at the covered sites with the year before.`,
        reads: ['partnershipAgreement', 'referralVolume', 'site'],
        writes: ['note', 'task'],
        limit: msg`Cannot edit agreement terms or renewal dates.`,
      },
    ],
  },
  access: {
    heading: msg`Liaisons see their region. *Agreements stay with the growth lead*`,
    roles: [
      { id: 'liaison', label: msg`Liaison` },
      { id: 'growthLead', label: msg`Growth lead` },
      { id: 'siteManager', label: msg`Site manager` },
    ],
    rules: [
      {
        objectId: 'referrer',
        accessByRoleId: {
          liaison: msg`Own region`,
          growthLead: msg`See and edit all`,
          siteManager: msg`Referrers to own site`,
        },
      },
      {
        objectId: 'referralVolume',
        accessByRoleId: {
          liaison: msg`See own region`,
          growthLead: msg`See all`,
          siteManager: msg`See own site`,
        },
      },
      {
        objectId: 'partnershipAgreement',
        accessByRoleId: {
          liaison: msg`No access`,
          growthLead: msg`See and edit all`,
          siteManager: msg`See own site's agreements`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Health Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Healthcare Provider', objectId: 'referrer' },
      { salesforceObject: 'Contract', objectId: 'partnershipAgreement' },
    ],
    note: msg`Patient objects stay out of scope. Import the rest by CSV or API, into our cloud or your own servers.`,
  },
  discovery: [
    {
      question: msg`How do you track referrals today?`,
      shapes: msg`Decides the referrer fields and the first import.`,
    },
    {
      question: msg`Can your scheduling system export monthly counts by referrer and site?`,
      shapes: msg`Sets how referral volumes reach Twenty: CSV or API.`,
    },
    {
      question: msg`How many sites do you run, and how many are opening?`,
      shapes: msg`Sets the site records and the opening workflow.`,
    },
    {
      question: msg`Who owns referrer relationships, by region or by site?`,
      shapes: msg`Sets the liaison and site manager roles and their row-level rules.`,
    },
    {
      question: msg`Which hospitals, insurers or employers do you hold agreements with?`,
      shapes: msg`Decides the partnership agreement fields and the renewal lead time.`,
    },
  ],
  categoryQuestions: 'omit',
  questions: [
    {
      question: msg`Where do the referral counts come from?`,
      answer: msg`Export monthly totals by referrer, site and service line from your scheduling system. Import them by CSV or post them to the API.`,
    },
    {
      question: msg`Does any patient information enter the CRM?`,
      answer: msg`No. The workspace holds referrers, sites and agreements, and volumes are counts. Patient records stay in your clinical systems.`,
    },
    HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE.questions[0],
    HEALTHCARE_LIFE_SCIENCES_INDUSTRY_PAGE.questions[2],
  ],
};
