declare module "react" {
  export type ReactElement = any;
  export type ReactNode = any;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useState<T>(value: T): [T, (value: T) => void];
  export function useRef<T>(value: T): { current: T };
  const React: any;
  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "ink" {
  export const Box: any;
  export const Text: any;
  export const Newline: any;
  export function render(node: any): { unmount: () => void };
  export function useApp(): { exit: () => void };
  export function useInput(handler: (input: string, key: { return?: boolean; space?: boolean; upArrow?: boolean; downArrow?: boolean; leftArrow?: boolean; rightArrow?: boolean }) => void): void;
}
