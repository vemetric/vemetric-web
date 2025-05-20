import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`Current version: ${packageJson.version}`);

rl.question('What should the new version be? ', (newVersion) => {
  packageJson.version = newVersion;
  writeFileSync(join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated version to ${newVersion}`);

  // Update version in all package.json files in packages/ directory
  const packagesDir = join(__dirname, 'packages');
  try {
    const packages = readdirSync(packagesDir);
    for (const pkg of packages) {
      const pkgJsonPath = join(packagesDir, pkg, 'package.json');
      try {
        const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
        pkgJson.version = newVersion;
        writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');
        console.log(`Updated version in packages/${pkg}/package.json`);
      } catch (err) {
        // Skip if package.json doesn't exist
        continue;
      }
    }
  } catch (err) {
    // Skip if packages directory doesn't exist
    console.log('No packages directory found');
  }

  rl.close();
});
