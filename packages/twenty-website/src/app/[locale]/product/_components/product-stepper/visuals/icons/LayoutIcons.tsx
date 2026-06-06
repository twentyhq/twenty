export type LayoutFieldIconType =
  | 'link'
  | 'user'
  | 'money'
  | 'target'
  | 'users'
  | 'map'
  | 'calendar';

export function FieldIcon({ type }: { type: LayoutFieldIconType }) {
  const c = '#666';
  const z = 10;
  switch (type) {
    case 'link':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M7 9a3.5 3.5 0 005 0l2-2a3.536 3.536 0 00-5-5L8 3m1 4a3.5 3.5 0 00-5 0L2 9a3.536 3.536 0 005 5l1-1"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="5.5" r="2.5" stroke={c} strokeWidth={1.2} />
          <path
            d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'money':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M8 2v12M5 4.5h4.5a1.5 1.5 0 010 3H5.5a1.5 1.5 0 000 3H11"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="6" stroke={c} strokeWidth={1.2} />
          <circle cx="8" cy="8" r="3" stroke={c} strokeWidth={1.2} />
          <circle cx="8" cy="8" fill={c} r="1" />
        </svg>
      );
    case 'users':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="6" cy="5" r="2" stroke={c} strokeWidth={1.2} />
          <path
            d="M2 13c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
          <circle cx="11" cy="5.5" r="1.5" stroke={c} strokeWidth={1.2} />
          <path
            d="M12 9.5c1.5.5 2.5 1.5 2.5 3"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'map':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M3 4l3.5-1.5 3 1.5L13 2.5v9.5l-3.5 1.5-3-1.5L3 13.5V4z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
          <path d="M6.5 2.5v9M9.5 4v9" stroke={c} strokeWidth={1.2} />
        </svg>
      );
    case 'calendar':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="1.5"
            stroke={c}
            strokeWidth={1.2}
            width="10"
            x="3"
            y="3.5"
          />
          <path d="M3 7h10M6 2v2M10 2v2" stroke={c} strokeWidth={1.2} />
        </svg>
      );
    default:
      return null;
  }
}

export function NavSvgIcon({ type }: { type: string }) {
  const c = '#555';
  const z = 7;
  switch (type) {
    case 'building':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M5 14V3l6 2v9M5 6H3v8h12V7h-4"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="5" r="2.5" stroke={c} strokeWidth={1.4} />
          <path
            d="M3.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="5" stroke={c} strokeWidth={1.4} />
          <circle cx="8" cy="8" r="2" stroke={c} strokeWidth={1.4} />
          <path d="M8 3v2M13 8h-2" stroke={c} strokeWidth={1.4} />
        </svg>
      );
    case 'checkbox':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="2"
            stroke={c}
            strokeWidth={1.4}
            width="10"
            x="3"
            y="3"
          />
          <path
            d="M6 8l1.5 1.5L10 6"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'notes':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="1.5"
            stroke={c}
            strokeWidth={1.4}
            width="8"
            x="4"
            y="3"
          />
          <path
            d="M6.5 6h3M6.5 8.5h3"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'automation':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="5" stroke={c} strokeWidth={1.4} />
          <path
            d="M8 5v3l2 1"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'play':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M5 3.5l8 4.5-8 4.5V3.5z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'versions':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="8"
            rx="1"
            stroke={c}
            strokeWidth={1.4}
            width="6"
            x="5"
            y="4"
          />
          <path d="M3 6v6a1 1 0 001 1h6" stroke={c} strokeWidth={1.4} />
        </svg>
      );
    case 'ai':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M8 2l1.5 4L14 8l-4.5 2L8 14l-1.5-4L2 8l4.5-2L8 2z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'letter-S':
      return (
        <svg height={z} viewBox="0 0 16 16" width={z}>
          <text
            fill="#35290f"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            x="8"
            y="12"
          >
            S
          </text>
        </svg>
      );
    case 'stripe-S':
      return (
        <svg height={z} viewBox="0 0 16 16" width={z}>
          <text
            fill="#333"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            x="8"
            y="12"
          >
            S
          </text>
        </svg>
      );
    default:
      return null;
  }
}

export function EyeIcon({ visible }: { visible: boolean }) {
  if (visible)
    return (
      <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
        <path
          d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
          stroke="#999"
          strokeLinejoin="round"
          strokeWidth={1.2}
        />
        <circle cx="8" cy="8" r="1.5" stroke="#999" strokeWidth={1.2} />
      </svg>
    );
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
        stroke="#b3b3b3"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
      <path
        d="M3 3l10 10"
        stroke="#b3b3b3"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function ChevLeft() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M10 4l-4 4 4 4"
        stroke="#999"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function ChevDown() {
  return (
    <svg fill="none" height={7} viewBox="0 0 16 16" width={7}>
      <path
        d="M4 6l4 4 4-4"
        stroke="#999"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
    </svg>
  );
}

export function DotsV() {
  return (
    <svg fill="none" height={10} viewBox="0 0 4 12" width={5}>
      <circle cx="2" cy="2" fill="#999" r="0.8" />
      <circle cx="2" cy="6" fill="#999" r="0.8" />
      <circle cx="2" cy="10" fill="#999" r="0.8" />
    </svg>
  );
}

export function DotsVW() {
  return (
    <svg fill="none" height={12} viewBox="0 0 4 12" width={5}>
      <circle cx="2" cy="2" fill="white" r="1" />
      <circle cx="2" cy="6" fill="white" r="1" />
      <circle cx="2" cy="10" fill="white" r="1" />
    </svg>
  );
}

export function GripV() {
  return (
    <svg fill="none" height={10} viewBox="0 0 8 12" width={7}>
      <circle cx="3" cy="2" fill="#999" r="0.8" />
      <circle cx="5" cy="2" fill="#999" r="0.8" />
      <circle cx="3" cy="6" fill="#999" r="0.8" />
      <circle cx="5" cy="6" fill="#999" r="0.8" />
      <circle cx="3" cy="10" fill="#999" r="0.8" />
      <circle cx="5" cy="10" fill="#999" r="0.8" />
    </svg>
  );
}

export function PaintSvg() {
  return (
    <svg fill="none" height={12} viewBox="0 0 16 16" width={12}>
      <rect
        height="6"
        rx="1"
        stroke="white"
        strokeWidth={1.2}
        width="8"
        x="4"
        y="3"
      />
      <path
        d="M6 9v3a1 1 0 001 1h0a1 1 0 001-1V9"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function CheckSvg() {
  return (
    <svg fill="none" height={8} viewBox="0 0 16 16" width={8}>
      <path
        d="M3 8l4 4 6-8"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

export function ListSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h4M3 8h4M3 12h4M9 4h4M9 8h4M9 12h4"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function SparkSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z"
        stroke="#999"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function NewSecSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h10M3 8h5M3 12h10M12 8v4M10 10h4"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export function PlusSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 3v10M3 8h10"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
