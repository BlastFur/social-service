import { Sequelize } from 'sequelize-typescript'
import sequelize from '../db'
import { BaseMonitorTask } from './Tasks/types'
import tasks from './Tasks'

export default class Monitor {
  private db?: Sequelize
  private readonly tasks: Array<BaseMonitorTask<any, any>> = [
    tasks.test,
    // tasks.updateTradeTaskBalances,
  ]

  async init(): Promise<void> {
    this.db = await sequelize.sync()

    process.once('SIGINT', () => {
      this.db?.close().catch((e) => console.log(e))
    })
    process.once('SIGTERM', () => {
      this.db?.close().catch((e) => console.log(e))
    })
  }

  async start(): Promise<void> {
    for (const task of this.tasks) {
      await task.start()
    }
    console.log('monitor started')
  }

  async stop(): Promise<void> {
    for (const task of this.tasks) {
      await task.stop()
    }
    console.log('monitor stopped')
  }
}
