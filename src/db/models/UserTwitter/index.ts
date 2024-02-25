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
import { TwitterToken, TwitterUserInfo } from './types'
import { auth } from 'twitter-api-sdk'
import TwitterClient from './twitterClient'
import { timeNumber } from '../../../utils/time'
import Constant from '../Constant'

@Table({
  modelName: 'userTwitter',
  indexes: [
    {
      fields: ['applicationId'],
    },
    {
      fields: ['userKey'],
    },
    {
      fields: ['applicationId', 'twitterId'],
      unique: true,
    },
    {
      fields: ['applicationId', 'twitterUsername'],
      unique: true,
    },
  ],
})
export default class UserTwitter extends Model {
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
  get twitterId(): string {
    return this.getDataValue('twitterId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(255))
  get twitterName(): string {
    return this.getDataValue('twitterName')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(255))
  get twitterUsername(): string {
    return this.getDataValue('twitterUsername')
  }

  get twitterUserInfo(): TwitterUserInfo {
    return {
      id: this.twitterId,
      name: UserTwitter.parseName(this.twitterName),
      username: this.twitterUsername,
    }
  }

  @AllowNull(false)
  @Column(DataType.JSON)
  get token(): TwitterToken {
    return this.getDataValue('token')
  }

  @AllowNull(false)
  @Column(DataType.JSON)
  get scopes(): auth.OAuth2Scopes[] {
    return this.getDataValue('scopes')
  }

  @AllowNull(false)
  @Column(DataType.TEXT)
  get callbackURL(): string {
    return this.getDataValue('callbackURL')
  }

  @AllowNull(false)
  @Column(DataType.DATE)
  get tokenExpiresAt(): Date {
    return this.getDataValue('tokenExpiresAt')
  }

  get tokenExpired(): boolean {
    return this.tokenExpiresAt < new Date()
  }

  static stringifyName(name: string): string {
    return Buffer.from(name).toString('base64')
  }

  static parseName(name: string): string {
    return Buffer.from(name, 'base64').toString('utf8')
  }

  // static async upsertUserTwitter(
  //   user: User,
  //   twitterInfo: TwitterUserInfo,
  //   token: TwitterToken,
  //   scopes: auth.OAuth2Scopes[],
  //   callbackURL: string
  // ): Promise<UserTwitter> {
  //   const [userTwitter, created] = await UserTwitter.findOrCreate({
  //     where: {
  //       userId: user.id,
  //     },
  //     defaults: {
  //       userId: user.id,
  //       twitterId: twitterInfo.id,
  //       twitterName: UserTwitter.stringifyName(twitterInfo.name),
  //       twitterUsername: twitterInfo.username,
  //       token: token,
  //       tokenExpiresAt: new Date(token.expires_at),
  //       scopes: scopes,
  //       callbackURL,
  //     },
  //   })
  //   if (created) {
  //     await user.pushEvent({
  //       tag: 'bindTwitter',
  //     })
  //     return userTwitter
  //   }
  //   userTwitter.setDataValue('userId', user.id)
  //   userTwitter.setDataValue('twitterId', twitterInfo.id)
  //   userTwitter.setDataValue(
  //     'twitterName',
  //     UserTwitter.stringifyName(twitterInfo.name)
  //   )
  //   userTwitter.setDataValue('twitterUsername', twitterInfo.username)
  //   userTwitter.setDataValue('token', token)
  //   userTwitter.setDataValue('tokenExpiresAt', new Date(token.expires_at))
  //   userTwitter.setDataValue('scopes', scopes)
  //   userTwitter.setDataValue('callbackURL', callbackURL)
  //   await userTwitter.save()
  //   await user.pushEvent({
  //     tag: 'bindTwitter',
  //   })
  //   return userTwitter
  // }

  async refreshToken(token: TwitterToken): Promise<void> {
    this.setDataValue('token', token)
    this.setDataValue('tokenExpiresAt', new Date(token.expires_at))
    await this.save()
  }

  // async getTwitterClient(): Promise<TwitterClient> {
  //   const user = await User.findByPk(this.userId)
  //   return new TwitterClient(user!, this.callbackURL, this.scopes, this.token!)
  // }

  // async checkUserInTweetLikedList(tweetId: string): Promise<number> {
  //   const fakeXVerify = (await Constant.get('fakeXVerify')) ?? false
  //   let result = false
  //   if (fakeXVerify) {
  //     result = true
  //   } else {
  //     const cache = await UserTwitterLikeCache.findOne({
  //       where: {
  //         twitterId: this.twitterId,
  //         tweetId,
  //       },
  //     })
  //     if (cache && cache.expiresAt > new Date()) {
  //       if (cache.result) return cache.id
  //       return -1
  //     }
  //     const client = await this.getTwitterClient()
  //     result = await client.checkUserInTweetLikedList(tweetId, this.twitterId)
  //   }
  //   const row = await UserTwitterLikeCache.upsertCache(
  //     this.twitterId,
  //     tweetId,
  //     result,
  //     fakeXVerify
  //   )
  //   if (result) {
  //     return row.id
  //   }
  //   return -1
  // }

  // async checkTweetInUserLikedList(tweetId: string): Promise<number> {
  //   const fakeXVerify = (await Constant.get('fakeXVerify')) ?? false
  //   let result = false
  //   if (fakeXVerify) {
  //     result = true
  //   } else {
  //     const cache = await UserTwitterLikeCache.findOne({
  //       where: {
  //         twitterId: this.twitterId,
  //         tweetId,
  //       },
  //     })
  //     if (cache && cache.expiresAt > new Date()) {
  //       if (cache.result) return cache.id
  //       return -1
  //     }
  //     const client = await this.getTwitterClient()
  //     result = await client.checkTweetInUserLikedList(tweetId, this.twitterId)
  //   }
  //   const row = await UserTwitterLikeCache.upsertCache(
  //     this.twitterId,
  //     tweetId,
  //     result,
  //     fakeXVerify
  //   )
  //   if (result) {
  //     return row.id
  //   }
  //   return -1
  // }

  // async checkUserInTweetRetweetedList(tweetId: string): Promise<number> {
  //   const fakeXVerify = (await Constant.get('fakeXVerify')) ?? false
  //   let result = false
  //   if (fakeXVerify) {
  //     result = true
  //   } else {
  //     const cache = await UserTwitterRetweetCache.findOne({
  //       where: {
  //         twitterId: this.twitterId,
  //         tweetId,
  //       },
  //     })
  //     if (cache && cache.expiresAt > new Date()) {
  //       if (cache.result) return cache.id
  //       return -1
  //     }
  //     const client = await this.getTwitterClient()
  //     result = await client.checkUserInTweetRetweetedList(
  //       tweetId,
  //       this.twitterId
  //     )
  //   }
  //   const row = await UserTwitterRetweetCache.upsertCache(
  //     this.twitterId,
  //     tweetId,
  //     result,
  //     fakeXVerify
  //   )
  //   if (result) {
  //     return row.id
  //   }
  //   return -1
  // }

  // async checkTweetInUserRetweetedList(tweetId: string): Promise<number> {
  //   const fakeXVerify = (await Constant.get('fakeXVerify')) ?? false
  //   let result = false
  //   if (fakeXVerify) {
  //     result = true
  //   } else {
  //     const cache = await UserTwitterRetweetCache.findOne({
  //       where: {
  //         twitterId: this.twitterId,
  //         tweetId,
  //       },
  //     })
  //     if (cache && cache.expiresAt > new Date()) {
  //       if (cache.result) return cache.id
  //       return -1
  //     }
  //     const client = await this.getTwitterClient()
  //     result = await client.checkTweetInUserRetweetedList(
  //       tweetId,
  //       this.twitterId
  //     )
  //   }
  //   const row = await UserTwitterRetweetCache.upsertCache(
  //     this.twitterId,
  //     tweetId,
  //     result,
  //     fakeXVerify
  //   )
  //   if (result) {
  //     return row.id
  //   }
  //   return -1
  // }
}

@Table({
  modelName: 'userTwitterLikeCache',
  indexes: [
    {
      fields: ['twitterId', 'tweetId'],
      unique: true,
    },
  ],
})
export class UserTwitterLikeCache extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(32))
  get twitterId(): string {
    return this.getDataValue('twitterId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(100))
  get tweetId(): string {
    return this.getDataValue('tweetId')
  }

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  get result(): boolean {
    return this.getDataValue('result')
  }

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  get fake(): boolean {
    return this.getDataValue('fake')
  }

  @AllowNull(false)
  @Column(DataType.DATE)
  get expiresAt(): Date {
    return this.getDataValue('expiresAt')
  }

  static async upsertCache(
    twitterId: string,
    tweetId: string,
    result: boolean,
    fake = false
  ): Promise<UserTwitterLikeCache> {
    const [row, created] = await UserTwitterLikeCache.findOrCreate({
      where: {
        twitterId,
        tweetId,
      },
      defaults: {
        twitterId,
        tweetId,
        result,
        fake,
        expiresAt: new Date(Date.now() + timeNumber.minute * 20),
      },
    })
    if (!created) {
      row.setDataValue('result', result)
      row.setDataValue('fake', fake)
      row.setDataValue(
        'expiresAt',
        new Date(Date.now() + timeNumber.minute * 20)
      )
      await row.save()
    }
    return row
  }
}

@Table({
  modelName: 'userTwitterRetweetCache',
  indexes: [
    {
      fields: ['twitterId', 'tweetId'],
      unique: true,
    },
  ],
})
export class UserTwitterRetweetCache extends Model {
  @AllowNull(false)
  @Column(DataType.CHAR(32))
  get twitterId(): string {
    return this.getDataValue('twitterId')
  }

  @AllowNull(false)
  @Column(DataType.CHAR(100))
  get tweetId(): string {
    return this.getDataValue('tweetId')
  }

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  get result(): boolean {
    return this.getDataValue('result')
  }

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  get fake(): boolean {
    return this.getDataValue('fake')
  }

  @AllowNull(false)
  @Column(DataType.DATE)
  get expiresAt(): Date {
    return this.getDataValue('expiresAt')
  }

  static async upsertCache(
    twitterId: string,
    tweetId: string,
    result: boolean,
    fake = false
  ): Promise<UserTwitterRetweetCache> {
    const [row, created] = await UserTwitterRetweetCache.findOrCreate({
      where: {
        twitterId,
        tweetId,
      },
      defaults: {
        twitterId,
        tweetId,
        result,
        fake,
        expiresAt: new Date(Date.now() + timeNumber.minute * 20),
      },
    })
    if (!created) {
      row.setDataValue('result', result)
      row.setDataValue('fake', fake)
      row.setDataValue(
        'expiresAt',
        new Date(Date.now() + timeNumber.minute * 20)
      )
      await row.save()
    }
    return row
  }
}
