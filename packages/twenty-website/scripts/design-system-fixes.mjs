// The ways to fix one finding, each with what it changes on screen, computed
// from the token values (never written by hand). The first one is the
// recommended fix: the one that changes nothing visible when there is one.
const toMs = (value) =>
  String(value).endsWith('ms')
    ? Number.parseFloat(value)
    : Number.parseFloat(value) * 1000;

const px = (value) => `${Math.round(value * 100) / 100}px`;

const lineHeightOf = (ramp, step, scales) =>
  ramp[step].lineHeight === null
    ? Number(scales.runningLineHeight)
    : Math.round((ramp[step].lineHeight / ramp[step].size) * 100) / 100;

const hexToRgb = (hex) =>
  [0, 2, 4].map((at) =>
    Number.parseInt(hex.replace('#', '').slice(at, at + 2), 16),
  );

export const solutionsFor = (finding, detail, scales) => {
  const fontBasePx = scales.units.fontBaseRem * scales.rootFontSizePx;
  const declared = (property) =>
    detail?.declarations.find(
      (declaration) => declaration.property === property,
    );
  const sizePx =
    detail?.fontSizeStep != null ? detail.fontSizeStep * fontBasePx : null;
  const rampSize = (ramp, step) =>
    scales.typeScale[ramp][step].size * fontBasePx;

  switch (finding.rule) {
    case 'Heading styled by hand': {
      const options = [];
      const headings = Object.entries(scales.headingSizes).map(
        ([size, ramp]) => ({
          size,
          ramp,
          base: rampSize(ramp, 'base'),
          md: rampSize(ramp, 'md'),
        }),
      );
      const lineHeight = declared('line-height')?.value ?? 'inherited';
      const sameRamps = Object.keys(scales.typeScale).filter(
        (ramp) =>
          sizePx !== null &&
          rampSize(ramp, 'base') === sizePx &&
          rampSize(ramp, 'md') === sizePx,
      );
      const exact = headings.find(
        (heading) => heading.base === sizePx && heading.md === sizePx,
      );
      if (exact)
        options.push({
          label: `<Heading size="${exact.size}">`,
          effect: 'No visible change.',
        });
      for (const ramp of sameRamps.slice(0, 1))
        options.push({
          label: `Keep the ${detail.tag.replace('styled.', '')} and take its type from typeRampDeclarations('${ramp}')`,
          effect: `Same size (${px(sizePx)}). Line height goes from ${lineHeight} to ${lineHeightOf(scales.typeScale[ramp], 'base', scales)}.`,
        });
      const nearest = headings.toSorted(
        (a, b) =>
          Math.abs(a.base - (sizePx ?? 0)) - Math.abs(b.base - (sizePx ?? 0)),
      )[0];
      if (!exact && nearest)
        options.push({
          label: `<Heading size="${nearest.size}">, the closest Heading`,
          effect:
            sizePx === null
              ? `Size becomes ${px(nearest.base)} on mobile, ${px(nearest.md)} on desktop.`
              : `Text goes from ${px(sizePx)} to ${px(nearest.base)} on mobile and ${px(nearest.md)} on desktop.`,
        });
      if (!exact && sizePx !== null)
        options.push({
          label: `Add a ${px(sizePx)} size to Heading`,
          effect:
            'No visible change, but a new variant: the design owner decides.',
        });
      return options;
    }
    case 'Duration written by hand':
      return [
        {
          label: `Replace with ${finding.fix}`,
          effect: 'No visible change: same value.',
        },
      ];
    case 'Duration outside DURATION': {
      const times = [
        ...finding.value.matchAll(/(?<![\w$-])(\d*\.?\d+)(ms|s)\b/g),
      ].map((match) => toMs(`${match[1]}${match[2]}`));
      const tokens = Object.entries(scales.durations).map(([key, value]) => ({
        key,
        ms: toMs(value),
      }));
      const off = times.filter(
        (ms) => !tokens.some((token) => token.ms === ms),
      );
      return [
        ...off.map((ms) => {
          const near = tokens.toSorted(
            (a, b) => Math.abs(a.ms - ms) - Math.abs(b.ms - ms),
          )[0];
          const delta = near.ms - ms;
          return {
            label: `Use DURATION.${near.key} (${near.ms}ms) instead of ${ms}ms`,
            effect: `${Math.abs(delta)}ms ${delta > 0 ? 'slower' : 'faster'}: hard to see.`,
          };
        }),
        {
          label: `Add ${off.join(', ')}ms to DURATION`,
          effect:
            'No visible change, but a new token: the design owner decides.',
        },
      ];
    }
    case 'Spacing written by hand':
    case 'Radius written by hand':
    case 'Weight written by hand':
    case 'Easing written by hand':
      return [
        {
          label: `Replace with ${finding.fix}`,
          effect: 'No visible change: same value.',
        },
      ];
    case 'line-height by hand, outside the type ramps':
    case 'letter-spacing by hand, outside the type ramps': {
      const ramps = Object.keys(scales.typeScale).filter(
        (ramp) =>
          sizePx !== null &&
          rampSize(ramp, 'base') === sizePx &&
          rampSize(ramp, 'md') === sizePx,
      );
      if (ramps.length === 0)
        return [
          {
            label: 'No type ramp has this size',
            effect:
              sizePx === null
                ? 'Its size is not a plain fontSize() step (a clamp() or an inherited size): open it in Inspect to read the whole style.'
                : `No ramp is ${px(sizePx)}: keep it, or add a line-height token (the design owner decides).`,
          },
        ];
      return ramps.slice(0, 2).map((ramp) => ({
        label: `Take the type from typeRampDeclarations('${ramp}')`,
        effect: `Same size (${px(sizePx)}). Line height becomes ${lineHeightOf(scales.typeScale[ramp], 'base', scales)}${finding.property === 'letter-spacing' ? ', letter spacing the ramp default' : ''}.`,
      }));
    }
    case 'Color written by hand':
    case 'Color written by hand (number)': {
      const hex =
        finding.value.match(/#?([0-9a-fA-F]{6})\b/)?.[1] ??
        finding.value.match(/0x([0-9a-f]{6})/i)?.[1];
      if (!hex)
        return [
          {
            label: finding.fix,
            effect: 'Pick the palette color it should be.',
          },
        ];
      const rgb = hexToRgb(hex);
      const nearest = Object.entries(scales.palette)
        .map(([key, value]) => ({
          key,
          value,
          distance: hexToRgb(value).reduce(
            (sum, channel, index) => sum + (channel - rgb[index]) ** 2,
            0,
          ),
        }))
        .toSorted((a, b) => a.distance - b.distance)[0];
      return nearest.distance === 0
        ? [
            {
              label: `color('${nearest.key}')`,
              effect: 'No visible change: same color.',
            },
          ]
        : [
            {
              label: `color('${nearest.key}') (${nearest.value}), the closest palette color`,
              effect: `Slightly different from #${hex}.`,
            },
            {
              label: `Add #${hex} to the palette`,
              effect:
                'No visible change, but a new token: the design owner decides.',
            },
          ];
    }
    case 'Typeface written by hand':
      return [
        {
          label: finding.fix,
          effect: 'The text switches to the site typeface.',
        },
      ];
    case 'Text not translated':
      return [
        {
          label: `Wrap it in ${finding.fix}`,
          effect:
            'No visible change in English; translated in the other languages.',
        },
      ];
    case 'Layer written by hand':
      return [
        {
          label: `Use ${finding.fix}`,
          effect: 'Check the layer still sits above what it must cover.',
        },
      ];
    case 'Weight outside FONT_WEIGHT':
      return [
        {
          label: `Use ${finding.fix}`,
          effect: 'The weight shifts to the nearest one the fonts load.',
        },
      ];
    default:
      return [];
  }
};

const pixelsIn = (value) =>
  [...value.matchAll(/(?<![\w.$-])(-?\d*\.?\d+)px/g)].map((match) =>
    Number(match[1]),
  );

// Layout geometry: proportions and viewport units, never a token value.
const isGeometry = (property, value) =>
  property === 'flex' ||
  property.startsWith('grid-template') ||
  /^-?\d*\.?\d+(%|vh|vw|dvh|svh)$/.test(value) ||
  (/^translate[XY]?\(/.test(value) && !/px/.test(value)) ||
  (/^(calc|min|max)\(/.test(value) && !/\d+px/.test(value));

// What to do with one value written by hand: a verdict (fix, decide, keep),
// the action, and what it changes on screen. Uses the audit's own solutions
// when it has some; otherwise derives the step from the token scales.
export const adviceFor = (declaration, finding, scales, repeats) => {
  const { property, value } = declaration;
  const spacingBase = scales.units?.spacingBasePx;
  const elsewhere =
    repeats > 1 ? `Written ${repeats} times across src/ui.` : 'Only here.';
  if (finding?.solutions?.length)
    return {
      verdict: finding.severity === 'error' ? 'fix' : 'decide',
      action: finding.solutions[0].label,
      effect: finding.solutions[0].effect,
      options: finding.solutions.slice(1),
    };
  if (finding?.severity === 'error')
    return {
      verdict: 'fix',
      action: `Use ${finding.fix}`,
      effect: 'Same value, now from the token.',
      options: [],
    };
  const pixels = pixelsIn(value);
  const halfSteps =
    spacingBase && pixels.length
      ? pixels.map((pixel) => pixel / spacingBase)
      : [];
  const onHalfStep =
    halfSteps.length > 0 &&
    halfSteps.every((step) => Number.isInteger(step * 2));
  switch (finding?.rule) {
    case 'Local stacking order':
      return {
        verdict: 'keep',
        action: 'Keep: a stacking order inside the component only.',
        effect: 'Z_INDEX is for layers across the page; this one is local.',
        options: [],
      };
    // Line widths are a design choice: the site writes 1px in borders and
    // outlines across most of its files, and neither it nor twenty-ui has a
    // width token (their border tokens hold colors and radii only).
    case '1px rule':
      return {
        verdict: 'decide',
        action:
          'No line-width token on the site or in the app: propose one to the design owner, or keep.',
        effect: elsewhere,
        options: [],
      };
    case 'Raw value, no exact token':
      if (/^(border|outline)/.test(property))
        return {
          verdict: 'decide',
          action:
            'No line-width token on the site or in the app: propose one to the design owner, or keep.',
          effect: elsewhere,
          options: [],
        };
      if (onHalfStep)
        return {
          verdict: 'fix',
          action: `Use ${halfSteps.map((step) => `spacing(${step})`).join(' ')}`,
          effect: `Same ${pixels.map(px).join(' ')}, now from the spacing scale.`,
          options: [],
        };
      return {
        verdict: 'decide',
        action: 'Round to the nearest spacing step, or keep.',
        effect: elsewhere,
        options: [],
      };
    case 'Size, no token':
      return {
        verdict: 'decide',
        action: onHalfStep
          ? `Write it as ${halfSteps.map((step) => `spacing(${step})`).join(' ')}, or keep a fixed size.`
          : 'Keep a fixed size, or add a size token if it repeats.',
        effect: onHalfStep
          ? `Same ${pixels.map(px).join(' ')}. ${elsewhere}`
          : elsewhere,
        options: [],
      };
    default:
      break;
  }
  if (finding)
    return {
      verdict: 'decide',
      action: finding.fix
        ? `Consider ${finding.fix}`
        : 'Keep, or make it a token.',
      effect: elsewhere,
      options: [],
    };
  // A fractional opacity is a wash: ALPHA_SCALE holds the same steps as
  // colors (black-5, white-10…), so a matching step can carry it.
  if (/opacity/.test(property) && Number(value) > 0 && Number(value) < 1) {
    const percent = Math.round(Number(value) * 100);
    const steps = Object.keys(scales.alpha?.stepHex ?? {})
      .map(Number)
      .sort((first, second) => first - second);
    const colors = scales.alpha?.colors ?? [];
    if (steps.includes(percent))
      return {
        verdict: 'fix',
        action: `Use the alpha scale: ${colors.map((name) => `${name}-${percent}`).join(' or ')}, as the fill color instead of an opacity.`,
        effect: `Same ${percent}% wash, now from ALPHA_SCALE. ${elsewhere}`,
        options: [],
      };
    const below = steps.filter((step) => step < percent).at(-1);
    const above = steps.find((step) => step > percent);
    return {
      verdict: 'decide',
      action: `No ${percent}% step in ALPHA_SCALE (nearest: ${[below, above].filter((step) => step !== undefined).join(' and ')}). An opacity on the whole element: add a step, or keep.`,
      effect: elsewhere,
      options: [],
    };
  }
  if (/opacity/.test(property) && (value === '0' || value === '1'))
    return {
      verdict: 'keep',
      action: 'Keep: fully opaque or fully transparent.',
      effect: 'An on or off value, no token is expected.',
      options: [],
    };
  if (isGeometry(property, value) || value.startsWith('scale('))
    return {
      verdict: 'keep',
      action: 'Keep: layout geometry, no token is expected.',
      effect: 'Proportions and viewport units are not design values.',
      options: [],
    };
  return {
    verdict: 'decide',
    action: 'Keep, or make it a token if it repeats.',
    effect: elsewhere,
    options: [],
  };
};
