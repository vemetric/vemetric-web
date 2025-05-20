import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const distDir = join(__dirname, 'dist');

const indexJs = readFileSync(join(distDir, 'index.js'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);
const indexMjs = readFileSync(join(distDir, 'index.mjs'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);

writeFileSync(join(distDir, 'index.js'), indexJs);
writeFileSync(join(distDir, 'index.mjs'), indexMjs);
