export type PartnerIntroPrefillInput = {
  name?: string;
  email?: string;
  company?: string;
};

// Cal.com prefill keys. `notes` surfaces the applicant's company on the booking
// so the call arrives pre-qualified.
export type PartnerIntroPrefill = {
  name?: string;
  email?: string;
  notes?: string;
};

export function buildPartnerIntroPrefill(
  input: PartnerIntroPrefillInput,
): PartnerIntroPrefill {
  const prefill: PartnerIntroPrefill = {};
  const name = input.name?.trim();
  const email = input.email?.trim();
  const company = input.company?.trim();
  if (name) prefill.name = name;
  if (email) prefill.email = email;
  if (company) prefill.notes = `Company: ${company}`;
  return prefill;
}
