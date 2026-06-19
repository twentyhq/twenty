import { type ComponentType } from 'react';

// The authored informative glyph set (16-grid strokes, verbatim from the
// old site) — feature bullets and any future informative chrome.
export type InformativeMarkProps = {
  color: string;
  sizePx: number;
  strokeWidth?: number;
};

function BookMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 3h4.2c.7 0 1.4.3 1.8.9.4-.6 1.1-.9 1.8-.9H14v9H9.8c-.7 0-1.4.3-1.8.9-.4-.6-1.1-.9-1.8-.9H2V3Z"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path d="M8 4.5v8" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

function CheckMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m11 6-3.75 4L5 8" stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M8 14a6 6 0 1 0-4.243-1.757"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function CodeMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m5 4-3 4 3 4M11 4l3 4-3 4"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function EditMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={color} strokeWidth={strokeWidth}>
        <path d="M7.604 3.621c-.744.034-1.476.112-2.19.194-.96.11-1.729.88-1.835 1.84-.104.94-.2 1.911-.2 2.904s.096 1.963.2 2.904c.106.96.875 1.729 1.835 1.839.946.109 1.922.211 2.919.211s1.973-.102 2.92-.211a2.094 2.094 0 0 0 1.834-1.839 35 35 0 0 0 .178-2.032" />
        <path d="M11.916 2.61 8.847 6.09a1.74 1.74 0 0 0-.394.791L8.087 8.6c-.074.349.29.68.63.572l1.724-.542c.287-.09.541-.247.743-.46l3.171-3.336c.578-.608.477-1.625-.222-2.243-.683-.604-1.676-.596-2.217.018Z" />
      </g>
    </svg>
  );
}

function EyeMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={(sizePx * 13) / 16}
      viewBox="0 0 16 13"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.437 5.719a1.719 1.719 0 1 1-3.437 0 1.719 1.719 0 0 1 3.437 0Z"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M11.458 2.363C10.38 1.583 9.07 1 7.656 1 3.98 1 1 4.94 1 6.059 1 6.77 2.207 8.626 4.033 9.88m9.265-5.765c.643.801 1.015 1.549 1.015 1.944 0 1.118-2.98 5.059-6.657 5.059a5.5 5.5 0 0 1-1.362-.177"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function SearchMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx={6.5}
        cy={6.5}
        r={4.5}
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="m11 11 4 4"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

function TagMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2h5l7 7-5 5-7-7V2Z"
        stroke={color}
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <circle cx={5} cy={5} fill={color} r={1} />
    </svg>
  );
}

function UsersMark({ color, sizePx, strokeWidth = 2 }: InformativeMarkProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={sizePx}
      viewBox="0 0 16 16"
      width={sizePx}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={6} cy={5.5} r={2} stroke={color} strokeWidth={strokeWidth} />
      <path
        d="M2.5 13c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={11.5}
        cy={6}
        r={1.5}
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <path
        d="M10.5 9.5c1.9.2 3.3 1.8 3 3.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export const INFORMATIVE_MARKS: Record<
  'book' | 'check' | 'code' | 'edit' | 'eye' | 'search' | 'tag' | 'users',
  ComponentType<InformativeMarkProps>
> = {
  book: BookMark,
  check: CheckMark,
  code: CodeMark,
  edit: EditMark,
  eye: EyeMark,
  search: SearchMark,
  tag: TagMark,
  users: UsersMark,
};
