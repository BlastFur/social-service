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

  static async createNewApplication(
    name: string,
    apikey: string = nanoid()
  ): Promise<Application> {
    return await Application.create({
      name: name,
      apikey,
    })
  }

  static async verfiyApikey(apikey: string): Promise<Application | null> {
    return await Application.findOne({
      where: {
        apikey,
      },
    })
  }
}