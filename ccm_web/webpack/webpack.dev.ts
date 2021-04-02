import * as webpack from 'webpack'
import { merge } from 'webpack-merge'

import commonConfig from './webpack.common'

const devConfig: webpack.Configuration = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    // https://github.com/webpack/webpack-dev-server/issues/147
    host: '0.0.0.0',
    port: 4010,
    open: false,
    disableHostCheck: true,
    writeToDisk: true,
    proxy: {
      // Backend API
      '/api': 'http://localhost:4000',
      // ltijs internals
      '/lti': 'http://localhost:4000',
      '/login': 'http://localhost:4000',
      '/keys': 'http://localhost:4000'
    }
  }
})

export default devConfig
