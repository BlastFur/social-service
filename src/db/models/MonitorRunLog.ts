import { Table, Column, AllowNull, DataType, Model } from 'sequelize-typescript'

@Table({
  modelName: 'monitorRunLog',
  indexes: [
    {
      fields: ['type'],
    },
  ],
})
export default class MonitorRunLog extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(30))
  get type(): number {
    return this.getDataValue('type')
  }

  @AllowNull(true)
  @Column(DataType.DATE)
  get finishedAt(): Date {
    return this.getDataValue('finishedAt')
  }

  @AllowNull(true)
  @Column(DataType.JSON)
  get data(): object {
    return this.getDataValue('data')
  }

  @AllowNull(true)
  @Column(DataType.JSON)
  get result(): object {
    return this.getDataValue('result')
  }

  @AllowNull(true)
  @Column(DataType.TEXT)
  get error(): string {
    return this.getDataValue('error')
  }
}
