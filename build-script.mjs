import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

export function buildScript() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

  const distDir = join(__dirname, 'dist');

  const mainJs =
    readFileSync(join(distDir, 'main.js'), 'utf8').replace('"use strict";', '"use strict";(function (){') + '})();';
  return `/*${version}*/${mainJs}`;
}
