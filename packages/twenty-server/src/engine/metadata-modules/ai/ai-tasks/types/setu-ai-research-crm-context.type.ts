// What the research run may read about one account, already filtered by the
// person's permissions. Every item carries the evidence id a brief may cite.
export type SetuAiResearchCrmSource = {
  sourceId: string;
  objectNameSingular: string;
  recordId: string;
  label: string;
  data: Record<string, unknown>;
};

export type SetuAiResearchCrmContext = {
  company: SetuAiResearchCrmSource;
  people: SetuAiResearchCrmSource[];
  opportunities: SetuAiResearchCrmSource[];
  notes: SetuAiResearchCrmSource[];
  tasks: SetuAiResearchCrmSource[];
  unavailableSections: string[];
};
