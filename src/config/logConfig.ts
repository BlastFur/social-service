import { Application } from 'express'
import log4js, { Logger } from 'log4js'

// 日志错误处理
log4js.configure({
  appenders: {
    ruleConsole: { type: 'console' },
    ruleFile: {
      type: 'dateFile',
      filename: 'logs/server-',
      pattern: 'yyyy-MM-dd.log',
      maxLogSize: 10 * 1000 * 1000,
      numBackups: 3,
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['ruleConsole', 'ruleFile'], level: 'error' },
  },
})

export const logger4js = log4js.getLogger('normal')

export function log(app: Application): void {
  // 页面请求日志
  app.use(
    log4js.connectLogger(logger4js, {
      level: 'debug',
      format: ':method :url',
    })
  )
}
