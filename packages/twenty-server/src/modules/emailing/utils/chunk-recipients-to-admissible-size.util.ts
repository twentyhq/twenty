import chunk from 'lodash.chunk';

// The batch size is chosen from the instance-wide send limit, but the bucket
// that admits it can be a lower per-workspace override. A batch costing more
// than that limit is refused at any moment, so waiting longer never helps and
// the recipients would eventually be failed as rate limited. Splitting to the
// limit is what lets them go out.
export const chunkRecipientsToAdmissibleSize = <TRecipient>({
  recipients,
  limitValue,
}: {
  recipients: TRecipient[];
  limitValue: number | null;
}): TRecipient[][] => {
  const admissibleSize = Math.floor(limitValue ?? 0);

  if (admissibleSize < 1 || recipients.length <= admissibleSize) {
    return [recipients];
  }

  return chunk(recipients, admissibleSize);
};
