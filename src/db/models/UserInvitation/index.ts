import {
  Table,
  Column,
  AllowNull,
  Unique,
  DataType,
  Default,
  Model,
  BeforeCreate,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import Application from '../Application'

@Table({
  modelName: 'userInvitation',
  indexes: [
    {
      fields: ['applicationId'],
    },
    {
      fields: ['applicationId', 'userKey'],
    },
    {
      fields: ['applicationId', 'fatherUserKey'],
    },
    {
      fields: ['applicationId', 'userKey'],
      unique: true,
    },
    {
      fields: ['applicationId', 'code'],
      unique: true,
    },
  ],
})
export default class UserInvitation extends Model {
  @AllowNull(false)
  @Column(DataType.INTEGER)
  @ForeignKey(() => Application)
  get applicationId(): number {
    return this.getDataValue('applicationId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(16))
  get userKey(): string {
    return this.getDataValue('userKey')
  }

  @BelongsTo(() => Application)
  get application(): Application | undefined {
    return this.getDataValue('application')
  }

  set application(application: Application | undefined) {
    //
  }

  @AllowNull(false)
  @Column(DataType.CHAR(32))
  get code(): string {
    return this.getDataValue('code')
  }

  @AllowNull(true)
  @Column(DataType.CHAR(16))
  get fatherUserKey(): string {
    return this.getDataValue('fatherUserKey')
  }
}
