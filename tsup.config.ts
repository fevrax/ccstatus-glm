import { defineConfig } from 'tsup';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  clean: true,
  dts: false,
  minify: false,
  splitting: false,
  shims: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // 将所有依赖打包进 bundle，使复制后的脚本完全自包含
  noExternal: [/\.*/],
  // 构建时注入版本号，避免运行时依赖 package.json
  define: {
    __CCSTATUS_VERSION__: JSON.stringify(pkg.version),
  },
});
