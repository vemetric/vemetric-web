import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

export function buildScript() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

  const distDir = join(__dirname, 'dist');

  // wrap the code in an IIFE, so that it doesn't leak any variables into the global scope
  // "use strict" is placed inside the IIFE, so it doesn't affect other scripts if our script gets concatenated with them
  const mainJs = readFileSync(join(distDir, 'main.js'), 'utf8').replace(/^"use strict";/, '');
  return `/*${version}*/(function (){"use strict";${mainJs}})();`;
}
