import { type DealActor } from './deal-actor';
import { type DealCompany } from './deal-company';
import { type DealPerson } from './deal-person';
import { type PipelineCardId } from './pipeline-card-id';

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
