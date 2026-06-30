import { type ContactActor } from './contact-actor';

export type ContactCompany = {
  accountOwner: ContactActor;
  address: string;
  arr: string;
  createdBy: ContactActor;
  domain: string;
  icp: boolean;
  industry: string;
  name: string;
};
