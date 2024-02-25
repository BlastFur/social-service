import Client, { auth } from 'twitter-api-sdk'
import { TwitterToken, TwitterUserInfo } from '../db/models/UserTwitter/types'
import { Application } from '../db/models'
import TwitterClient from '../db/models/UserTwitter/twitterClient'
import UserTwitter from '../db/models/UserTwitter'
import { addTime, timeNumber } from '../utils/time'

const scopes: auth.OAuth2Scopes[] = [
  'tweet.read',
  'users.read',
  'follows.read',
  'like.read',
  'offline.access',
]

function stringifyTwitterCallbackState(
  application: Application,
  userKey: string
): string {
  return `${application.id as number}_${userKey}`
}

interface ParsedTwitterCallbackState {
  application: Application
  userKey: string
}

async function parseTwitterCallbackState(
  state: string
): Promise<ParsedTwitterCallbackState> {
  const [applicationId, userKey] = state.split('_')
  const application = await Application.findByPk(applicationId)
  if (!application) {
    throw new Error('Application not found')
  }
  return {
    application,
    userKey,
  }
}

export async function upsertUserTwitter(
  application: Application,
  userKey: string,
  twitterInfo: TwitterUserInfo,
  token: TwitterToken,
  scopes: auth.OAuth2Scopes[],
  callbackURL: string
): Promise<UserTwitter> {
  const [userTwitter, created] = await UserTwitter.findOrCreate({
    where: {
      applicationId: application.id,
      userKey,
    },
    defaults: {
      applicationId: application.id,
      userKey,
      twitterId: twitterInfo.id,
      twitterName: UserTwitter.stringifyName(twitterInfo.name),
      twitterUsername: twitterInfo.username,
      token,
      tokenExpiresAt: new Date(token.expires_at),
      scopes,
      callbackURL,
    },
  })
  if (!created) {
    userTwitter.setDataValue('twitterId', twitterInfo.id)
    userTwitter.setDataValue(
      'twitterName',
      UserTwitter.stringifyName(twitterInfo.name)
    )
    userTwitter.setDataValue('twitterUsername', twitterInfo.username)
    userTwitter.setDataValue('token', token)
    userTwitter.setDataValue('tokenExpiresAt', new Date(token.expires_at))
    userTwitter.setDataValue('scopes', scopes)
    userTwitter.setDataValue('callbackURL', callbackURL)
    await userTwitter.save()
  }
  return userTwitter
}

interface TwitterClientCacheItem {
  expiresAt: Date
  client: TwitterClient
}

class TwitterClientCache {
  clientMap: Record<string, TwitterClientCacheItem> = {}

  pushClient(key: string, client: TwitterClient): void {
    if (!this.clientMap[key]) {
      this.clientMap[key] = {
        expiresAt: addTime(new Date(), timeNumber.minute * 10),
        client,
      }
    }
  }

  getClient(key: string): TwitterClient | null {
    const item = this.clientMap[key]
    if (item) {
      if (item.expiresAt > new Date()) {
        return item.client
      }
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.clientMap[key]
    }
    return null
  }

  deleteClient(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.clientMap[key]
  }

  // TODO: clean cache
}

const clientCache = new TwitterClientCache()

export async function getUserAuthURL(
  application: Application,
  callback: string,
  userKey: string,
  userMustExsit = false
): Promise<string> {
  if (userMustExsit) {
    const user = await UserTwitter.findOne({
      where: {
        applicationId: application.id,
        userKey,
      },
    })
    if (!user) {
      throw new Error('user not found')
    }
  }
  const state = stringifyTwitterCallbackState(application, userKey)
  const twitterClient = new TwitterClient(application, callback, scopes)
  clientCache.pushClient(state, twitterClient)
  return twitterClient.generateAuthURL(state)
}

export async function bindTwitterCallback(
  state: string,
  code: string,
  applicationCheck: Application
): Promise<UserTwitter> {
  const { application, userKey } = await parseTwitterCallbackState(state)
  if (application.id !== applicationCheck.id) {
    throw new Error('Application mismatch')
  }
  const twitterClient = clientCache.getClient(state)
  if (!twitterClient) {
    throw new Error('Client not found or expired')
  }
  await twitterClient.requestAccessToken(code)

  const twitterInfo = await twitterClient.getUserInfo()

  clientCache.deleteClient(state)

  return await upsertUserTwitter(
    application,
    userKey,
    twitterInfo,
    twitterClient.token,
    scopes,
    state
  )
}

const twitterServices = {
  getUserAuthURL,
  bindTwitterCallback,
}

export default twitterServices
