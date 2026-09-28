import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { buildScript } from './build-script.mjs';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const s3Endpoint = process.env.S3_ENDPOINT;
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

if (!s3Endpoint || !s3AccessKeyId || !s3SecretAccessKey) {
  throw new Error('S3 Environment Variables are not specified.');
}

const bucket = 'vemetric-cdn';

const s3Client = new S3Client({
  endpoint: s3Endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: s3AccessKeyId,
    secretAccessKey: s3SecretAccessKey,
  },
  // Only send checksums when required, as Cloudflare R2 doesn't support the SDK's default CRC32 checksum headers on PutObject
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

async function uploadObject(params) {
  const { key, body } = params;
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'text/javascript',
      }),
    );
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

const mainJs = buildScript();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

await uploadObject({
  key: `main.js`,
  body: mainJs,
});
await uploadObject({
  key: `${version}/main.js`,
  body: mainJs,
});
