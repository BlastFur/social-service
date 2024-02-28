import {
  Table,
  Column,
  AllowNull,
  DataType,
  Model,
  Default,
} from 'sequelize-typescript'
import nanoid from '../../utils/uuid'

export interface ApplicationUuidFormat {
  alphabet: string
  size: number
}

@Table({
  modelName: 'application',
  indexes: [
    {
      fields: ['name'],
    },
  ],
})
export default class Application extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(30))
  get name(): string {
    return this.getDataValue('name')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(16))
  get apikey(): string {
    return this.getDataValue('apikey')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(50))
  get twitterClientId(): string {
    return this.getDataValue('twitterClientId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(100))
  get twitterClientSecret(): string {
    return this.getDataValue('twitterClientSecret')
  }

  @AllowNull(true)
  @Column(DataType.JSON)
  get uuidFormat(): ApplicationUuidFormat {
    return this.getDataValue('uuidFormat')
  }

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  get disabled(): boolean {
    return this.getDataValue('disabled')
  }
}
