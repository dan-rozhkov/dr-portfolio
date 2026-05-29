declare module "live-studio" {
  export function startStudio(): void;
}

declare module "live-studio/vite" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export function reactTracer(): any;
}
