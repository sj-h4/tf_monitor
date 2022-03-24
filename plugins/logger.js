import * as log from 'loglevel'

// 出力を許可するログのレベルを以下5段階から設定
// trace → debug → info → warn → error
if (process.env.NODE_ENV === 'development') {
  // 開発環境ならすべて出力
  log.setLevel('trace')
} else {
  // 本番環境ならinfo以降を出力
  log.setLevel('info')
}

export default (context, inject) => {
  inject('log', log)
}