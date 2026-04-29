export type HrefEtagMap = Record<string, string>;

export type HrefEtagDiff = {
  changedHrefs: string[];
  cancelledHrefs: string[];
};

export const diffHrefEtagMap = (
  stored: HrefEtagMap,
  current: HrefEtagMap,
): HrefEtagDiff => {
  const changedHrefs: string[] = [];

  for (const [href, etag] of Object.entries(current)) {
    const storedEtag = stored[href];

    if (storedEtag === undefined || storedEtag !== etag) {
      changedHrefs.push(href);
    }
  }

  const cancelledHrefs = Object.keys(stored).filter(
    (href) => !(href in current),
  );

  return { changedHrefs, cancelledHrefs };
};
