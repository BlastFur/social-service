import { MonitorRunLog } from '../../db/models'
import Constant, { ConstantDataValue } from '../../db/models/Constant'
import { timeNumber } from '../../utils/time'

export type MonitorTaskType = 'test'

interface BaseMonitorTaskConstants {
  [key: string]: ConstantDataValue
}

export class BaseMonitorTask<T = any, R = any> {
  readonly type!: MonitorTaskType
  readonly runImmediately: boolean = false
  readonly interval: number = 1 * timeNumber.minute
  readonly needSaveLog: boolean = false
  protected handler: NodeJS.Timeout | null = null
  protected readonly initialTaskConstants!: BaseMonitorTaskConstants
  private readonly initialBaseConstants: BaseMonitorTaskConstants = {
    running: true,
  }

  protected get initialConstants(): BaseMonitorTaskConstants {
    return { ...this.initialBaseConstants, ...this.initialTaskConstants }
  }

  async start(): Promise<void> {
    if (this.handler) {
      throw new Error('Already running')
    }
    await this.init()
    const run = async (): Promise<void> => {
      const running = await this.getConstant<boolean>('running')
      if (!running) {
        return
      }
      const props = await this._generateRunProps()
      let log: MonitorRunLog | null = null
      if (this.needSaveLog) {
        log = await MonitorRunLog.create({
          type: this.type,
          data: props,
        })
      }
      let error = ''
      try {
        const result = await this.run(props)
        log?.setDataValue('result', result)
      } catch (e) {
        error = (e as Error).message
      }
      log?.setDataValue('finishedAt', new Date())
      if (error) {
        log?.setDataValue('error', error)
      }
      await log?.save()
    }
    this.handler = setInterval(() => {
      run().catch((e) => console.log(e))
    }, this.interval)
    process.once('SIGINT', () => {
      if (this.handler) {
        clearInterval(this.handler)
      }
    })
    process.once('SIGTERM', () => {
      if (this.handler) {
        clearInterval(this.handler)
      }
    })
    if (this.runImmediately) {
      await run()
    }
    console.log(`monitor task ${this.type} started`)
  }

  private async _initConstants(): Promise<void> {
    const keys = Object.keys(this.initialConstants)
    for (const key of keys) {
      const value = this.initialConstants[key]
      const name = `${this.type}_${key}`
      await Constant.findOrCreatePyName(name, value)
    }
  }

  protected async getConstant<T>(key: string): Promise<T> {
    const keys = Object.keys(this.initialConstants)
    if (!keys.includes(key)) {
      throw new Error(`Constant ${key} not found`)
    }
    const name = `${this.type}_${key}`
    return (await Constant.findValueByName(
      name,
      this.initialConstants[key]
    )) as T
  }

  protected async init(): Promise<void> {
    await this._initConstants()
  }

  protected async _generateRunProps(): Promise<T> {
    throw new Error('_generateRunProps must be implemented')
  }

  protected async run(props: T): Promise<R> {
    throw new Error('run must be implemented')
  }

  async stop(): Promise<void> {
    if (this.handler) {
      clearInterval(this.handler)
    }
    console.log(`monitor task ${this.type} stopped`)
  }
}
