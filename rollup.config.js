import replace from 'rollup-plugin-replace'
import json from 'rollup-plugin-json'
import eslint from 'rollup-plugin-eslint'
import babel from 'rollup-plugin-babel'
import { name, author, homepage, version } from './package.json'

export default {
  entry: './index.js',
  dest: './dist/happy-bus.js',
  format: 'umd',
  moduleName: 'happy-bus',
  sourceMap: true,
  external: ['vue'],
  banner: `/*!
  name: ${name}
  version: ${version}
  author: ${author}
  github: ${homepage}
  */`,
  plugins: [
    replace({
      'process.env.NODE_ENV': '"production"'
    }),
    json(),
    eslint(),
    // resolve(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
}
