export const APP_WIDTH = 80;
export const APP_COMPACT_WIDTH = 70;
export const PANEL_PADDING_X = 1;
export const APP_OUTER_PADDING_X = 1;

interface AppLayout {
  width: number;
  compact: boolean;
}

export function getAppLayout(stdoutWidth: number): AppLayout {
  const available = Math.max(1, stdoutWidth - APP_OUTER_PADDING_X * 2);
  const width = Math.min(APP_WIDTH, available);
  return {
    width,
    compact: width < APP_COMPACT_WIDTH
  };
}
