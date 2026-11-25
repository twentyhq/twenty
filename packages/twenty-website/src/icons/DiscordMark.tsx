import { DISCORD_PATH } from './discord-path';

export type DiscordMarkProps = {
  size?: number;
  'aria-hidden'?: boolean;
};

// The official Discord mark (ported geometry), on currentColor.
export function DiscordMark({ size = 14, ...rest }: DiscordMarkProps) {
  return (
    <svg
      fill="none"
      height={size}
      viewBox="0 0 12.4 9.5"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path d={DISCORD_PATH} fill="currentColor" />
    </svg>
  );
}
