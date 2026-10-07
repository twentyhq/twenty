export const SKELETON_PROP_DESCRIPTIONS = {
  animated:
    'Animate the highlight by default. Reduced-motion preferences always disable animation.',
  width:
    'Placeholder width in pixels or a CSS length. Defaults to the available width.',
  height:
    'Placeholder height in pixels or a CSS length. Defaults to the inherited font height.',
  borderRadius:
    'Corner radius in pixels or a CSS length. Defaults to 0.25rem and inherits the surrounding corner shape.',
  baseColor:
    'Placeholder background color. Defaults to the theme tertiary background.',
  highlightColor:
    'Animated highlight color. Defaults to the theme lighter transparent background.',
  className: 'CSS class merged with the placeholder class.',
  style:
    'Native styles merged with the placeholder dimensions and colors. Explicit styles win.',
  ref: 'Ref to the placeholder span, or the element supplied through render.',
  render: 'Element or render callback composed through Base UI useRender.',
  'aria-hidden':
    'Placeholders are decorative and hidden from assistive technology by default. The host owns loading announcements.',
};
