// Longest url first so a link that is a prefix of another cannot claim the
// longer one's characters.
export const replacePlainTextLinkUrls = (
  text: string,
  replacementByUrl: Map<string, string>,
): string =>
  [...replacementByUrl.entries()]
    .sort(([firstUrl], [secondUrl]) => secondUrl.length - firstUrl.length)
    .reduce(
      (current, [url, replacement]) => current.split(url).join(replacement),
      text,
    );
