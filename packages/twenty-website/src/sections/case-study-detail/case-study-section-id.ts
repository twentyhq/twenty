// The DOM id for the nth article section — the anchor the table-of-contents
// links to and the scroll-spy reads. Shared by the body and the nav.
export function caseStudySectionId(index: number): string {
  return `case-study-section-${index}`;
}
