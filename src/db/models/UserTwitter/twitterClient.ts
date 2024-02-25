import Client, { auth } from 'twitter-api-sdk'
import { TwitterToken } from './types'
import UserTwitter from '.'
import Application from '../Application'

export default class TwitterClient {
  protected readonly authClient: auth.OAuth2User
  protected readonly client: Client

  constructor(
    protected readonly application: Application,
    protected readonly callback: string,
    protected readonly scopes: auth.OAuth2Scopes[],
    protected readonly userTwitter?: UserTwitter,
    token?: TwitterToken
  ) {
    this.authClient = new auth.OAuth2User({
      client_id: application.twitterClientId,
      client_secret: application.twitterClientSecret,
      callback,
      scopes,
      token: userTwitter?.token ?? token,
    })
    this.client = new Client(this.authClient)
  }

  get token(): any {
    return this.authClient.token
  }

  generateAuthURL(state: string): string {
    return this.authClient.generateAuthURL({
      state,
      code_challenge_method: 's256',
      // code_challenge: "test",
    })
  }

  async requestAccessToken(code: string): Promise<void> {
    await this.authClient.requestAccessToken(code)
  }

  async getUserInfo(): Promise<any> {
    const user = await this.client.users.findMyUser()
    return user.data
  }

  protected async tryUpdateToken(): Promise<void> {
    const { token } = this
    if (!token) return
    if (!this.userTwitter) return
    if (token.expires_at < new Date().getTime()) {
      await this.authClient.refreshAccessToken()
      await this.userTwitter.refreshToken(this.token)
    }
  }

  async checkUserInTweetLikedList(
    tweetId: string,
    userId: string,
    depth = 5,
    paginationToken?: string
  ): Promise<boolean> {
    if (depth <= 0) return false
    await this.tryUpdateToken()
    try {
      const list = await this.client.users.tweetsIdLikingUsers(tweetId, {
        max_results: 100,
        pagination_token: paginationToken,
      })
      const { data, meta } = list
      if (!data) return false
      // console.log('--------------------------------')
      // console.log(data)
      // console.log('--------------------------------')
      const uid = userId.toLowerCase()
      const user = data.find((t) => t.id.toLowerCase() === uid)
      if (user) return true

      // try again with the next page
      const nextPaginationToken = meta?.next_token
      if (!nextPaginationToken) return false
      return await this.checkUserInTweetLikedList(
        tweetId,
        userId,
        depth - 1,
        nextPaginationToken
      )
    } catch (error: any) {
      if (error.statusText) {
        throw new Error(error.statusText)
      }
      throw error
    }
  }

  async checkTweetInUserLikedList(
    tweetId: string,
    userId: string,
    depth = 5,
    paginationToken?: string
  ): Promise<boolean> {
    if (depth <= 0) return false
    await this.tryUpdateToken()
    try {
      const list = await this.client.tweets.usersIdLikedTweets(userId, {
        max_results: 100,
        pagination_token: paginationToken,
      })
      const { data, meta } = list
      if (!data) return false
      // console.log('--------------------------------')
      // console.log(data)
      // console.log('--------------------------------')
      const tid = tweetId.toLowerCase()
      const tweet = data.find((t) => t.id.toLowerCase() === tid)
      if (tweet) return true

      // try again with the next page
      const nextPaginationToken = meta?.next_token
      if (!nextPaginationToken) return false
      return await this.checkTweetInUserLikedList(
        tweetId,
        userId,
        depth - 1,
        nextPaginationToken
      )
    } catch (error: any) {
      if (error.statusText) {
        throw new Error(error.statusText)
      }
      throw error
    }
  }

  async checkUserInTweetRetweetedList(
    tweetId: string,
    userId: string,
    depth = 5,
    paginationToken?: string
  ): Promise<boolean> {
    if (depth <= 0) return false
    await this.tryUpdateToken()
    try {
      const list = await this.client.users.tweetsIdRetweetingUsers(tweetId, {
        max_results: 100,
        pagination_token: paginationToken,
      })
      const { data, meta } = list
      if (!data) return false
      const uid = userId.toLowerCase()
      const user = data.find((t) => t.id.toLowerCase() === uid)
      if (user) return true

      // try again with the next page
      const nextPaginationToken = meta?.next_token
      if (!nextPaginationToken) return false
      return await this.checkUserInTweetRetweetedList(
        tweetId,
        userId,
        depth - 1,
        nextPaginationToken
      )
    } catch (error: any) {
      if (error.statusText) {
        throw new Error(error.statusText)
      }
      throw error
    }
  }

  async checkTweetInUserRetweetedList(
    tweetId: string,
    userId: string,
    depth = 5,
    paginationToken?: string
  ): Promise<boolean> {
    if (depth <= 0) return false
    await this.tryUpdateToken()
    try {
      const list = await this.client.tweets.usersIdTweets(userId, {
        max_results: 100,
        pagination_token: paginationToken,
        exclude: ['replies'],
        'tweet.fields': ['id', 'text', 'conversation_id', 'referenced_tweets'],
      })
      const { data, meta } = list
      if (!data) return false
      // console.log('--------------------------------')
      // console.log(data[0])
      // console.log(data[0].referenced_tweets)
      // console.log(data[1])
      // console.log(data[1].referenced_tweets)
      // console.log(data[2])
      // console.log(data[2].referenced_tweets)
      // console.log(data[3])
      // console.log(data[3].referenced_tweets)
      // console.log('--------------------------------')
      const haveReferencedTweetsData = data.filter(
        (d) => d.referenced_tweets && d.referenced_tweets.length > 0
      )
      const tid = tweetId.toLowerCase()
      const tweet = haveReferencedTweetsData.find((t) => {
        const referencedTweets = t.referenced_tweets
        if (!referencedTweets) return false
        return referencedTweets.find(
          (rt) => rt.type === 'retweeted' && rt.id.toLowerCase() === tid
        )
      })
      if (tweet) return true

      // try again with the next page
      const nextPaginationToken = meta?.next_token
      if (!nextPaginationToken) return false
      return await this.checkUserInTweetRetweetedList(
        tweetId,
        userId,
        depth - 1,
        nextPaginationToken
      )
    } catch (error: any) {
      if (error.statusText) {
        throw new Error(error.statusText)
      }
      throw error
    }
  }
}
