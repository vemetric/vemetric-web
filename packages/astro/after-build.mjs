import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const distDir = join(__dirname, 'dist');

const vemetricJs = readFileSync(join(distDir, 'vemetric.js'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);
const vemetricMjs = readFileSync(join(distDir, 'vemetric.mjs'), 'utf8').replace('%VEMETRIC_SDK_VERSION%', version);

writeFileSync(join(distDir, 'vemetric.js'), vemetricJs);
writeFileSync(join(distDir, 'vemetric.mjs'), vemetricMjs);
