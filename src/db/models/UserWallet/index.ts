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
import { checkWalletAddress } from './utils'
import { Transaction } from 'sequelize'

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

  static async upsertWallet(
    payload: UserWalletData,
    transaction?: Transaction
  ): Promise<UserWallet> {
    if (!(await checkWalletAddress(payload.type, payload.address))) {
      throw new Error(`Invalid wallet address of type ${payload.type}`)
    }
    const exist = await UserWallet.findOne({
      where: {
        applicationId: payload.applicationId,
        userKey: payload.userKey,
        type: payload.type,
      },
      transaction,
    })
    if (exist) {
      await exist.update(
        {
          address: payload.address,
          isSignup: payload.isSignup,
          memo: payload.memo,
          extra: payload.extra,
        },
        { transaction }
      )
      return exist
    }
    return await UserWallet.create(
      {
        applicationId: payload.applicationId,
        userKey: payload.userKey,
        type: payload.type,
        address: payload.address,
        isSignup: payload.isSignup,
        memo: payload.memo,
        extra: payload.extra,
      },
      { transaction }
    )
  }

  static async getUserWallets(
    applicationId: number,
    userKey: string
  ): Promise<UserWallet[]> {
    return await UserWallet.findAll({
      where: {
        applicationId,
        userKey,
      },
    })
  }

  static async findByAddress(
    applicationId: number,
    address: string,
    type?: UserWalletType
  ): Promise<UserWallet | null> {
    const where: any = {
      applicationId,
      address,
    }
    if (type) {
      where.type = type
    }
    const wallet = await UserWallet.findOne({
      where,
    })
    if (!wallet) return null
    return wallet
  }
}
