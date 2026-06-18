// Cal.com prefill keys for the intro call. `notes` carries the applicant's
// company so the booking arrives pre-qualified. Empty inputs are omitted.
export type PartnerIntroPrefill = {
  name?: string;
  email?: string;
  notes?: string;
};

export function buildPartnerIntroPrefill(input: {
  name?: string;
  email?: string;
  company?: string;
}): PartnerIntroPrefill {
  const prefill: PartnerIntroPrefill = {};
  const name = input.name?.trim();
  const email = input.email?.trim();
  const company = input.company?.trim();
  if (name) prefill.name = name;
  if (email) prefill.email = email;
  if (company) prefill.notes = `Company: ${company}`;
  return prefill;
}
