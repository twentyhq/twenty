import { msg } from '@lingui/core/macro';

import { type RowDef } from '@/app-preview/types';

import { type IndustrySubCategoryPage } from '../industry-page-types';

const disclosureRow = (
  id: string,
  name: string,
  inventor: string,
  department: string,
  stage: { value: string; color: 'amber' | 'green' | 'blue' | 'gray' },
  manager: string,
): RowDef => ({
  id,
  cells: {
    name: { type: 'text', value: name, shortLabel: name[0], tone: 'orange' },
    inventor: { type: 'person', name: inventor, kind: 'person', tone: 'blue' },
    department: { type: 'text', value: department },
    stage: { type: 'select', ...stage },
    manager: { type: 'person', name: manager, kind: 'person', tone: 'gray' },
  },
});

export const RESEARCH_INSTITUTIONS_INDUSTRY_PAGE: IndustrySubCategoryPage = {
  kind: 'subCategory',
  slug: 'research-institutions',
  parentSlug: 'public-sector-defense',
  status: 'draft',
  name: msg`Research institutions`,
  meta: {
    title: msg`Twenty for research institutions — industry partnerships and licences in one CRM`,
    description: msg`Track industry partners, research agreements, invention disclosures, licences and spin-outs in an open source CRM you can host yourself. See an example tech transfer workspace built on Twenty.`,
  },
  hero: {
    headline: msg`Every industry partnership and licence *in one place*`,
    body: msg`Industry partners, research agreements, invention disclosures, licences and spin-outs, on servers you choose. Here is an example tech transfer workspace built on Twenty.`,
  },
  preview: {
    workspaceName: 'Ellery University Innovation Office',
    tableObjectId: 'inventionDisclosure',
    viewName: 'Active disclosures',
    columns: [
      { id: 'name', label: 'Disclosure', width: 200, isFirstColumn: true },
      { id: 'inventor', label: 'Lead inventor', width: 180 },
      { id: 'department', label: 'Department', width: 160 },
      { id: 'stage', label: 'Stage', width: 130 },
      { id: 'manager', label: 'Licensing manager', width: 170 },
    ],
    rows: [
      disclosureRow(
        'gas-sensor',
        'Low-power gas sensor',
        'Amara Okafor',
        'Chemistry',
        { value: 'Licensing', color: 'amber' },
        'Jonas Becker',
      ),
      disclosureRow(
        'folding-assay',
        'Protein folding assay',
        'Lucas Ferreira',
        'Biosciences',
        { value: 'Assessment', color: 'blue' },
        'Mei Tanaka',
      ),
      disclosureRow(
        'bridge-damper',
        'Adaptive bridge damper',
        'Rhiannon Price',
        'Civil engineering',
        { value: 'Patent filed', color: 'green' },
        'Jonas Becker',
      ),
      disclosureRow(
        'soil-carbon',
        'Soil carbon model',
        'Kofi Mensah',
        'Earth sciences',
        { value: 'Submitted', color: 'gray' },
        'Mei Tanaka',
      ),
    ],
    record: {
      name: 'Low-power gas sensor',
      createdAt: 'Added Jun 2',
      fields: [
        {
          label: 'Stage',
          value: { type: 'select', color: 'amber', value: 'Licensing' },
        },
        {
          label: 'Lead inventor',
          value: { type: 'person', name: 'Amara Okafor', kind: 'person' },
        },
        { label: 'Department', value: { type: 'text', value: 'Chemistry' } },
        {
          label: 'Licensing manager',
          value: { type: 'person', name: 'Jonas Becker', kind: 'person' },
        },
      ],
    },
  },
  pains: [
    {
      complaint: msg`Disclosures arrive by email and sit in someone's inbox.`,
      answer: msg`A submitted disclosure gets an owner, an assessment task and a prior-art summary.`,
      answeredBy: 'workflows',
    },
    {
      complaint: msg`We cannot see every agreement we hold with one company.`,
      answer: msg`Research agreements, licences and spin-outs link to the same company record.`,
      answeredBy: 'dataModel',
    },
    {
      complaint: msg`Nobody checks royalty reports against the licence terms.`,
      answer: msg`An agent compares each report with the terms and opens a task when figures do not match.`,
      answeredBy: 'agents',
    },
    {
      complaint: msg`Contracts officers need terms, not the invention's details.`,
      answer: msg`Roles decide who sees disclosures and who sees agreement terms.`,
      answeredBy: 'access',
    },
  ],
  addedObjects: [
    {
      id: 'researchAgreement',
      label: msg`Research agreements`,
      purpose: msg`Sponsored or collaborative research with an industry partner, with funding and milestones.`,
      fields: [
        { label: msg`Funding` },
        { label: msg`Next milestone` },
        { label: msg`Industry partner`, relatesTo: 'company' },
        { label: msg`Principal investigator`, relatesTo: 'person' },
      ],
      previewIcon: 'book',
      previewTone: 'blue',
    },
    {
      id: 'inventionDisclosure',
      label: msg`Invention disclosures`,
      purpose: msg`A new invention reported by researchers, from assessment to patent and licence.`,
      fields: [
        { label: msg`Stage` },
        { label: msg`Inventors`, relatesTo: 'person' },
        { label: msg`Research agreement`, relatesTo: 'researchAgreement' },
      ],
      previewIcon: 'notes',
      previewTone: 'orange',
    },
    {
      id: 'licenceAgreement',
      label: msg`Licence agreements`,
      purpose: msg`Rights granted to a licensee, with a field of use, royalty terms and report dates.`,
      fields: [
        { label: msg`Field of use` },
        { label: msg`Next royalty report` },
        { label: msg`Licensee`, relatesTo: 'company' },
        { label: msg`Invention`, relatesTo: 'inventionDisclosure' },
      ],
      previewIcon: 'key',
      previewTone: 'amber',
    },
    {
      id: 'spinOut',
      label: msg`Spin-outs`,
      purpose: msg`A company formed around your research, with the institution's equity and licences.`,
      fields: [
        { label: msg`Equity held` },
        { label: msg`Founders`, relatesTo: 'person' },
        { label: msg`Licence`, relatesTo: 'licenceAgreement' },
      ],
      previewIcon: 'buildingSkyscraper',
      previewTone: 'pink',
    },
  ],
  omittedObjectIds: ['programme', 'tender', 'partner', 'approval'],
  modelNotes: [
    {
      title: msg`Industry partners are companies`,
      body: msg`Sponsors and licensees share one company record, so every agreement with them stays attached.`,
    },
    {
      title: msg`An invention moves through stages`,
      body: msg`Each disclosure links to its inventors and the agreement that funded it, which settles ownership questions early.`,
    },
    {
      title: msg`Licences carry their dates`,
      body: msg`Royalty report dates are fields, so a workflow can chase a licensee before a report is late.`,
    },
  ],
  workflows: [
    {
      title: msg`Invention disclosure submitted`,
      outcome: msg`Every disclosure gets an assessment owner and a prior-art summary in its first week.`,
      steps: [
        { kind: 'trigger', label: msg`Invention disclosure created` },
        {
          kind: 'action',
          label: msg`Create an assessment task for the licensing manager`,
        },
        { kind: 'agent', label: msg`Draft a prior-art summary as a note` },
      ],
    },
    {
      title: msg`Royalty report due`,
      outcome: msg`No licensee report slips past its due date unnoticed.`,
      steps: [
        { kind: 'trigger', label: msg`First day of each month` },
        {
          kind: 'action',
          label: msg`Find licences with a royalty report due within 30 days`,
        },
        { kind: 'action', label: msg`Email a reminder to the licensee` },
        {
          kind: 'action',
          label: msg`Create a follow-up task for the licensing manager`,
        },
      ],
    },
    {
      title: msg`Research agreement milestone`,
      outcome: msg`Investigators and partners hear about a milestone before it is due.`,
      steps: [
        { kind: 'trigger', label: msg`Every day at 07:00` },
        {
          kind: 'action',
          label: msg`Find research agreements with a milestone due within 14 days`,
        },
        { kind: 'action', label: msg`Email the principal investigator` },
        {
          kind: 'action',
          label: msg`Create a check-in task for the contracts officer`,
        },
      ],
    },
  ],
  customScreen: {
    title: msg`Licensing pipeline`,
    placedOn: 'inventionDisclosure',
    description: msg`Lists every company talking to you about an invention, by field of use and stage.`,
    preview: {
      tabLabel: 'Licensing',
      title: 'Licensing pipeline',
      caption: 'Prospective licensees',
      columns: ['Company', 'Field of use', 'Stage', 'Next step'],
      rows: [
        {
          id: 'halvorsen',
          highlighted: true,
          cells: [
            { type: 'text', value: 'Halvorsen Instruments' },
            { type: 'text', value: 'Industrial safety' },
            { type: 'select', color: 'amber', value: 'Term sheet' },
            { type: 'text', value: 'Royalty rate, Dec 4' },
          ],
        },
        {
          id: 'brightwater',
          cells: [
            { type: 'text', value: 'Brightwater Utilities' },
            { type: 'text', value: 'Water networks' },
            { type: 'select', color: 'blue', value: 'NDA signed' },
            { type: 'text', value: 'Lab demo, Jan 12' },
          ],
        },
        {
          id: 'kestrel',
          cells: [
            { type: 'text', value: 'Kestrel Aerospace' },
            { type: 'text', value: 'Aviation' },
            { type: 'select', color: 'gray', value: 'Declined' },
            { type: 'text', value: 'None' },
          ],
        },
      ],
      footnote:
        'Halvorsen wants industrial safety only. Water networks stays open for Brightwater.',
    },
  },
  agents: {
    heading: msg`Agents do the first read. *Your team decides what to protect*`,
    items: [
      {
        name: msg`Prior-art reader`,
        job: msg`Reads a new disclosure and the references attached to it, then drafts a prior-art summary as a note.`,
        reads: ['inventionDisclosure', 'researchAgreement'],
        writes: ['note'],
        limit: msg`Runs on your own AI provider. A person decides whether to file a patent.`,
      },
      {
        name: msg`Royalty checker`,
        job: msg`Compares each royalty report with the licence terms and creates a task when figures do not match.`,
        reads: ['licenceAgreement', 'company'],
        writes: ['task'],
        limit: msg`Cannot invoice or contact a licensee.`,
      },
    ],
  },
  access: {
    heading: msg`Managers run their inventions. *The director sees every deal*`,
    roles: [
      { id: 'licensingManager', label: msg`Licensing manager` },
      { id: 'contractsOfficer', label: msg`Contracts officer` },
      { id: 'director', label: msg`Director` },
    ],
    rules: [
      {
        objectId: 'inventionDisclosure',
        accessByRoleId: {
          licensingManager: msg`See all, edit own`,
          contractsOfficer: msg`See all`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'licenceAgreement',
        accessByRoleId: {
          licensingManager: msg`Edit on own inventions`,
          contractsOfficer: msg`See all, edit terms`,
          director: msg`See and edit all`,
        },
      },
      {
        objectId: 'researchAgreement',
        accessByRoleId: {
          licensingManager: msg`See all`,
          contractsOfficer: msg`See and edit all`,
          director: msg`See and edit all`,
        },
      },
    ],
  },
  switching: {
    salesforceProduct: 'Sales Cloud',
    mappings: [
      { salesforceObject: 'Account', objectId: 'company' },
      { salesforceObject: 'Contact', objectId: 'person' },
      { salesforceObject: 'Opportunity', objectId: 'licenceAgreement' },
      {
        salesforceObject: 'Invention (custom)',
        objectId: 'inventionDisclosure',
      },
      {
        salesforceObject: 'Research agreement (custom)',
        objectId: 'researchAgreement',
      },
    ],
    note: msg`Custom objects map one to one. When you self-host, the migration can run inside your own network.`,
  },
  discovery: [
    {
      question: msg`How many disclosures do you receive each year?`,
      shapes: msg`Sets the disclosure stages and how managers split the work.`,
    },
    {
      question: msg`How do researchers submit an invention today?`,
      shapes: msg`The form becomes a webhook that creates the disclosure.`,
    },
    {
      question: msg`Who signs research and licence agreements?`,
      shapes: msg`Sets the contracts officer role and its edit rights.`,
    },
    {
      question: msg`Where are patents and royalty reports tracked?`,
      shapes: msg`Each tool becomes an import or an API sync.`,
    },
    {
      question: msg`Which AI providers may read unpublished work?`,
      shapes: msg`Sets the provider the agents run on.`,
    },
  ],
  questions: [
    {
      question: msg`Our spin-outs hold licences and give us equity.`,
      answer: msg`Each spin-out is a record with its founders, equity held and the licences it depends on.`,
    },
    {
      question: msg`Do unpublished inventions leave our servers?`,
      answer: msg`Not when you self-host. Agents run on a custom AI provider, available on the Organization plan and above.`,
    },
  ],
};
