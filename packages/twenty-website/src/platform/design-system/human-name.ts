// A code name made readable, as Geist labels its components: CaseStudyHero
// becomes "Case Study Hero". The code name stays on the page itself.
export const humanName = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
