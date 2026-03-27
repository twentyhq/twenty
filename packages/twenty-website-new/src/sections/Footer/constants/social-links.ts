import { DiscordIcon, GitHubIcon, LinkedInIcon, XIcon } from "@/icons"

export const SOCIAL_LINKS = [
  {
    href: "https://github.com/twentyhq/twenty",
    icon: GitHubIcon,
    label: "39.8K",
    ariaLabel: "GitHub (opens in new tab)",
    showInDesktop: true,
    showInDrawer: true,
  },
  {
    href: "https://discord.gg/cx5n4Jzs57",
    icon: DiscordIcon,
    label: "5.6K",
    ariaLabel: "Discord (opens in new tab)",
    className: "discord-link",
    showInDesktop: true,
    showInDrawer: true,
  },
  {
    href: "https://www.linkedin.com/company/twenty",
    icon: LinkedInIcon,
    label: undefined,
    ariaLabel: "LinkedIn (opens in new tab)",
    showInDesktop: false,
    showInDrawer: true,
  },
  {
    href: "https://x.com/twentycrm",
    icon: XIcon,
    label: undefined,
    ariaLabel: "X (opens in new tab)",
    showInDesktop: false,
    showInDrawer: true,
  },
]
