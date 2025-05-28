import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const distDir = join(__dirname, 'dist');

const mainJs = readFileSync(join(distDir, 'main.js'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);
const mainMjs = readFileSync(join(distDir, 'main.mjs'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);

writeFileSync(join(distDir, 'main.js'), mainJs);
writeFileSync(join(distDir, 'main.mjs'), mainMjs);
