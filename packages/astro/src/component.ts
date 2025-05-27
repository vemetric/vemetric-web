// eslint-disable-next-line no-useless-rename
export { default as default } from './index.astro';
export type { Options } from './vemetric.d.ts';
// @ts-expect-error we export the vemetric object from the dist folder
export { vemetric } from './vemetric.mjs';
