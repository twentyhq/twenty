export function lineHeight(multiplier: number): string {
    return `calc(var(--line-height-base) * ${multiplier})`;
}