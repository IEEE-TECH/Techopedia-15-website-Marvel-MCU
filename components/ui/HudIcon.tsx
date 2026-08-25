"use client";

/**
 * Minimal geometric glyphs standing in for emoji on icon-only controls
 * (modal close buttons, success/error markers). Pure stroke SVG on
 * currentColor so they inherit each button's existing hover states.
 */

type IconProps = {
  size?: number;
  className?: string;
};

export function CloseIcon({ size = 14, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ size = 32, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 12.5L9 18.5L21 5.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
