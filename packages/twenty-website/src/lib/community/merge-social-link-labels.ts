type SocialLinkWithIcon = {
  icon: string;
  label?: string;
};

export function mergeSocialLinkLabels<T extends SocialLinkWithIcon>(
  links: readonly T[],
  labels: { discord: string; github: string },
): T[] {
  return links.map((link) => {
    if (link.icon === 'github') {
      return { ...link, label: labels.github };
    }
    if (link.icon === 'discord') {
      return { ...link, label: labels.discord };
    }
    return link;
  });
}
