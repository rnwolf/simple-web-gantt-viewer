//write-build-info.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const git = (cmd) => {
    try { return execSync(cmd, { encoding: 'utf8' }).trim(); } catch { return null; }
};

const buildInfo = {
    name: pkg.name,
    version: pkg.version,
    buildTimeUtc: new Date().toISOString(),
    commit: git('git rev-parse --short HEAD'),
    branch: git('git rev-parse --abbrev-ref HEAD'),
};

// Adjust the output path to match what your build copies to dist (e.g., "public" or "static")
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync(path.join('public', 'version.json'), JSON.stringify(buildInfo, null, 2));