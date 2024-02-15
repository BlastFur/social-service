import { Op } from 'sequelize'
import {
  Table,
  Column,
  AllowNull,
  DataType,
  ForeignKey,
  BelongsTo,
  HasOne,
  Unique,
  BeforeUpdate,
  BeforeCreate,
  Is,
  Model,
  Default,
  BelongsToMany,
  BeforeFind,
  HasMany,
} from 'sequelize-typescript'
import { SupportedEVMHelperChains } from '../types'

@Table({
  modelName: 'evmh_rpc',
  indexes: [
    {
      fields: ['chainName'],
    },
    {
      fields: ['chainName', 'rpc'],
      unique: true,
    },
  ],
})
export default class RPC extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(32))
  get chainName(): SupportedEVMHelperChains {
    return this.getDataValue('chainName')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(128).BINARY)
  get rpc(): string {
    return this.getDataValue('rpc')
  }

  static async getRPCList(chainName: SupportedEVMHelperChains): Promise<RPC[]> {
    if (!this.sequelize) {
      return []
    }
    const r = await RPC.findAll({
      where: {
        chainName,
      },
    })
    return r
  }
}
