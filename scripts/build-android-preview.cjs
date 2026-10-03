const { spawnSync } = require('node:child_process');
const { copyFileSync, mkdirSync } = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

function run(command, args, cwd = projectRoot) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (process.platform === 'win32') {
  throw new Error(
    'Este comando usa o ambiente Linux/macOS. No Windows, use o EAS Build.',
  );
}

// Gera os arquivos nativos a partir do app.json, incluindo o splash.
run(process.execPath, [
  require.resolve('expo/bin/cli'),
  'prebuild',
  '--platform',
  'android',
  '--no-install',
]);

// A variante release inclui o JavaScript no APK e não inicia o servidor Expo.
run(
  './gradlew',
  ['assembleRelease', '--no-daemon', '--max-workers=2'],
  path.join(projectRoot, 'android'),
);

const outputDirectory = path.join(projectRoot, 'dist');
const apk = path.join(outputDirectory, 'cook-from-this-preview.apk');
mkdirSync(outputDirectory, { recursive: true });
copyFileSync(
  path.join(
    projectRoot,
    'android/app/build/outputs/apk/release/app-release.apk',
  ),
  apk,
);
console.log(`\nAPK de teste criado: ${apk}`);
console.log(
  'Instale o APK no Android e abra COOK FROM THIS pelo ícone do aplicativo.',
);
