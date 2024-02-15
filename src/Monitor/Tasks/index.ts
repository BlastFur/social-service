import { BaseMonitorTask, MonitorTaskType } from './types'
import TestMonitorTask from './TestMonitorTask'

const tasks: Record<MonitorTaskType, BaseMonitorTask> = {
  test: new TestMonitorTask(),
}

export default tasks
