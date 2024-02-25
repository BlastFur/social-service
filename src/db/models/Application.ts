import {
  Table,
  Column,
  AllowNull,
  DataType,
  Model,
  Default,
} from 'sequelize-typescript'
import nanoid from '../../utils/uuid'

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
  @Default(false)
  @Column(DataType.BOOLEAN)
  get disabled(): boolean {
    return this.getDataValue('disabled')
  }
}
