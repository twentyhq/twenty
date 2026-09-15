const SEARCH_HANDLE_PATH = 'm10.5 10.5 3 3';

export type SearchProps = {
  sizePx?: number;
};

// A magnifier on currentColor — the consumer sets the ink via color.
export function Search({ sizePx = 16 }: SearchProps) {
  return (
    <svg
      fill="none"
      height={sizePx}
      style={{ display: 'block' }}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth={1.5} />
      <path
        d={SEARCH_HANDLE_PATH}
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth={1.5}
      />
    </svg>
  );
}
