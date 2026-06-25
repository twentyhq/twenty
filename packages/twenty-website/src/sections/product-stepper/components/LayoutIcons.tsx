import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const inks = PRODUCT_STEPPER_SCENE.layout;

export type LayoutFieldIconType =
  | 'calendar'
  | 'link'
  | 'map'
  | 'money'
  | 'target'
  | 'user'
  | 'users';

export type LayoutNavIconType =
  | 'ai'
  | 'automation'
  | 'building'
  | 'checkbox'
  | 'letterS'
  | 'notes'
  | 'play'
  | 'stripeS'
  | 'target'
  | 'user'
  | 'versions';

function FieldGlyph({ type }: { type: LayoutFieldIconType }) {
  const ink = inks.fieldInk;
  const size = 10;
  switch (type) {
    case 'link':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M7 9a3.5 3.5 0 005 0l2-2a3.536 3.536 0 00-5-5L8 3m1 4a3.5 3.5 0 00-5 0L2 9a3.536 3.536 0 005 5l1-1"
            stroke={ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="8" cy="5.5" r="2.5" stroke={ink} strokeWidth={1.2} />
          <path
            d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={ink}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'money':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M8 2v12M5 4.5h4.5a1.5 1.5 0 010 3H5.5a1.5 1.5 0 000 3H11"
            stroke={ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="8" cy="8" r="6" stroke={ink} strokeWidth={1.2} />
          <circle cx="8" cy="8" r="3" stroke={ink} strokeWidth={1.2} />
          <circle cx="8" cy="8" fill={ink} r="1" />
        </svg>
      );
    case 'users':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="6" cy="5" r="2" stroke={ink} strokeWidth={1.2} />
          <path
            d="M2 13c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5"
            stroke={ink}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
          <circle cx="11" cy="5.5" r="1.5" stroke={ink} strokeWidth={1.2} />
          <path
            d="M12 9.5c1.5.5 2.5 1.5 2.5 3"
            stroke={ink}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'map':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M3 4l3.5-1.5 3 1.5L13 2.5v9.5l-3.5 1.5-3-1.5L3 13.5V4z"
            stroke={ink}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
          <path d="M6.5 2.5v9M9.5 4v9" stroke={ink} strokeWidth={1.2} />
        </svg>
      );
    case 'calendar':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <rect
            height="10"
            rx="1.5"
            stroke={ink}
            strokeWidth={1.2}
            width="10"
            x="3"
            y="3.5"
          />
          <path d="M3 7h10M6 2v2M10 2v2" stroke={ink} strokeWidth={1.2} />
        </svg>
      );
  }
}

function NavGlyph({ type }: { type: LayoutNavIconType }) {
  const ink = inks.navInk;
  const size = 7;
  switch (type) {
    case 'building':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M5 14V3l6 2v9M5 6H3v8h12V7h-4"
            stroke={ink}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="8" cy="5" r="2.5" stroke={ink} strokeWidth={1.4} />
          <path
            d="M3.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={ink}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="8" cy="8" r="5" stroke={ink} strokeWidth={1.4} />
          <circle cx="8" cy="8" r="2" stroke={ink} strokeWidth={1.4} />
          <path d="M8 3v2M13 8h-2" stroke={ink} strokeWidth={1.4} />
        </svg>
      );
    case 'checkbox':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <rect
            height="10"
            rx="2"
            stroke={ink}
            strokeWidth={1.4}
            width="10"
            x="3"
            y="3"
          />
          <path
            d="M6 8l1.5 1.5L10 6"
            stroke={ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'notes':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <rect
            height="10"
            rx="1.5"
            stroke={ink}
            strokeWidth={1.4}
            width="8"
            x="4"
            y="3"
          />
          <path
            d="M6.5 6h3M6.5 8.5h3"
            stroke={ink}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'automation':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <circle cx="8" cy="8" r="5" stroke={ink} strokeWidth={1.4} />
          <path
            d="M8 5v3l2 1"
            stroke={ink}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'play':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M5 3.5l8 4.5-8 4.5V3.5z"
            stroke={ink}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'versions':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <rect
            height="8"
            rx="1"
            stroke={ink}
            strokeWidth={1.4}
            width="6"
            x="5"
            y="4"
          />
          <path d="M3 6v6a1 1 0 001 1h6" stroke={ink} strokeWidth={1.4} />
        </svg>
      );
    case 'ai':
      return (
        <svg fill="none" height={size} viewBox="0 0 16 16" width={size}>
          <path
            d="M8 2l1.5 4L14 8l-4.5 2L8 14l-1.5-4L2 8l4.5-2L8 2z"
            stroke={ink}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'letterS':
      return (
        <svg height={size} viewBox="0 0 16 16" width={size}>
          <text
            fill={inks.letterSInk}
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
    case 'stripeS':
      return (
        <svg height={size} viewBox="0 0 16 16" width={size}>
          <text
            fill={inks.stripeSInk}
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
  }
}

function EyeGlyph({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
        <path
          d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
          stroke={inks.eyeInk}
          strokeLinejoin="round"
          strokeWidth={1.2}
        />
        <circle cx="8" cy="8" r="1.5" stroke={inks.eyeInk} strokeWidth={1.2} />
      </svg>
    );
  }
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
        stroke={inks.eyeHiddenInk}
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
      <path
        d="M3 3l10 10"
        stroke={inks.eyeHiddenInk}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function ChevronLeftGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M10 4l-4 4 4 4"
        stroke={inks.eyeInk}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function DotsGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 4 12" width={5}>
      <circle cx="2" cy="2" fill={inks.eyeInk} r="0.8" />
      <circle cx="2" cy="6" fill={inks.eyeInk} r="0.8" />
      <circle cx="2" cy="10" fill={inks.eyeInk} r="0.8" />
    </svg>
  );
}

function GripGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 8 12" width={7}>
      <circle cx="3" cy="2" fill={inks.eyeInk} r="0.8" />
      <circle cx="5" cy="2" fill={inks.eyeInk} r="0.8" />
      <circle cx="3" cy="6" fill={inks.eyeInk} r="0.8" />
      <circle cx="5" cy="6" fill={inks.eyeInk} r="0.8" />
      <circle cx="3" cy="10" fill={inks.eyeInk} r="0.8" />
      <circle cx="5" cy="10" fill={inks.eyeInk} r="0.8" />
    </svg>
  );
}

function ListGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h4M3 8h4M3 12h4M9 4h4M9 8h4M9 12h4"
        stroke={inks.fieldInk}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function SparkGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z"
        stroke={inks.eyeInk}
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function NewSectionGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h10M3 8h5M3 12h10M12 8v4M10 10h4"
        stroke={inks.fieldInk}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 3v10M3 8h10"
        stroke={inks.fieldInk}
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

export const LAYOUT_GLYPHS = {
  ChevronLeft: ChevronLeftGlyph,
  Dots: DotsGlyph,
  Eye: EyeGlyph,
  Field: FieldGlyph,
  Grip: GripGlyph,
  List: ListGlyph,
  Nav: NavGlyph,
  NewSection: NewSectionGlyph,
  Plus: PlusGlyph,
  Spark: SparkGlyph,
};
