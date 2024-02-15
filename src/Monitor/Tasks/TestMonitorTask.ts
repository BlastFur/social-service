import { timeNumber } from '../../utils/time'
import { BaseMonitorTask, MonitorTaskType } from './types'

export default class TestMonitorTask extends BaseMonitorTask<string, string> {
  readonly type: MonitorTaskType = 'test'
  readonly interval = 5 * timeNumber.second
  readonly runImmediately = true
  readonly needSaveLog = true

  protected async _generateRunProps(): Promise<string> {
    return 'ping'
  }

  protected async run(props: string): Promise<string> {
    return 'pong'
  }
}
