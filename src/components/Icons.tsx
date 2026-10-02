import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
} as const;

export const SendIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 12h13M12 5l7 7-7 7" />
  </svg>
);

export const PlusIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const LogoutIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
  </svg>
);

export const BackIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const CloseIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" width={14} height={14} {...props}>
    <path d="M3 8.5l3 3 7-7" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" width={14} height={14} strokeWidth={1.6} {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3l2 1.5" />
  </svg>
);

export const AlertIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" width={14} height={14} {...props}>
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.5v4M8 11.2v.1" />
  </svg>
);

export const ChatBubbleIcon = (props: IconProps) => (
  <svg {...base} strokeWidth={1.5} {...props}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z" />
  </svg>
);
