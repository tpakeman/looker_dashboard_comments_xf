module.exports = api => {
  var isTest = api.cache(() => process.env.NODE_ENV === "test")

  return {
    ignore: ['node_modules'],
    env: {
      build: {
        ignore: [
          '**/*.d.ts',
          '**/*.test.js',
          '**/*.test.jsx',
          '**/*.test.ts',
          '**/*.test.tsx',
          '__snapshots__',
          '__tests__',
        ],
      },
    },
    presets: [
      ['@babel/preset-env',
        {modules: false,
          targets: {
            browsers: 'Last 2 Chrome versions, Firefox ESR',
            node: '8.9'}}],
      ['@babel/preset-react', {development: process.env.BABEL_ENV !== 'build'}],
      '@babel/preset-typescript'
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      'babel-plugin-styled-components',
      'react-hot-loader/babel'
    ],
  }
}
