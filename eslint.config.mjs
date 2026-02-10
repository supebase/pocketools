// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // 这里只放自定义的校验规则或需要忽略的文件
  ignores: ['dist', '.nuxt', 'node_modules'],
})
