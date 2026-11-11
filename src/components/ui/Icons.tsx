const paths = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  bag: "M6 7h12l1 13H5L6 7Zm3 0a3 3 0 0 1 6 0",
  home: "M3 11 12 3l9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z",
  grid: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0",
  check: "m5 12 5 5 9-10",
  truck:
    "M2 6h12v10H2V6Zm12 4h4l3 3v3h-7v-6ZM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  shield: "M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4",
  return: "M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  leaf: "M5 19C5 9 11 4 20 4c0 9-5 15-15 15Zm0 0 8-8",
  chevron: "m9 6 6 6-6 6",
  plus: "M12 5v14M5 12h14",
  chart: "M4 20V11m6 9V4m6 16v-6m4 6H3",
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  className = "size-6",
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
