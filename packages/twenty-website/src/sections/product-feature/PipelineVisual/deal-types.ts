import { type PipelineCardId } from './utils/pipeline-move-card';

export type DealPerson = {
  avatarUrl: string;
  name: string;
};

export type DealCompany = {
  domain: string;
  name: string;
};

export type DealActor = {
  avatarUrl?: string;
  name: string;
  source: 'member' | 'system';
};

export type DealData = {
  amount: string;
  avatarTone: string;
  company: DealCompany;
  contact: DealPerson;
  createdBy: DealActor;
  date: string;
  id: PipelineCardId;
  title: string;
};
