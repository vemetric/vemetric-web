import { buildScript } from '../../build-script.mjs';
import { writeFileSync } from 'fs';

const mainJs = buildScript();

writeFileSync('public/main.js', mainJs);
