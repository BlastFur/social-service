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
import { UserWalletData, UserWalletType } from './types'

@Table({
  modelName: 'userWallet',
  indexes: [
    {
      fields: ['applicationId'],
    },
    {
      fields: ['userKey'],
    },
    {
      fields: ['applicationId', 'userKey', 'type'],
      unique: true,
    },
    {
      fields: ['type'],
    },
    {
      fields: ['applicationId', 'address'],
      unique: true,
    },
  ],
})
export default class UserWallet extends Model {
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
  @Column(DataType.CHAR(16))
  get type(): UserWalletType {
    return this.getDataValue('type')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(128))
  get address(): UserWalletType {
    return this.getDataValue('address')
  }

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  get isSignup(): boolean {
    return this.getDataValue('isSignup')
  }

  @AllowNull(true)
  @Column(DataType.CHAR(64))
  get memo(): string | null {
    return this.getDataValue('memo')
  }

  @AllowNull(true)
  @Column(DataType.JSON)
  get extra(): any | null {
    return this.getDataValue('extra')
  }

  getData(): UserWalletData {
    return {
      applicationId: this.applicationId,
      userKey: this.userKey,
      type: this.type,
      address: this.address,
      isSignup: this.isSignup,
      memo: this.memo,
      extra: this.extra,
    }
  }
}
