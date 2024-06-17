export default {
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
  dev: {
    writeToDisk: true,
  },
  output: {
    externals: {
      vscode: 'vscode',
    },
    targets: ['node'],
    distPath: {
      root: 'dist',
      server: '',
    },
  },
}
