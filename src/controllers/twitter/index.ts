import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import apiKeyMiddleware, {
  ApplicationRequest,
} from '../../middleware/apikey.middleware'
import twitterServices from '../../services/twitter.service'
import { UserWalletData } from '../../db/models/UserWallet/types'
import { TwitterUserInfo } from '../../db/models/UserTwitter/types'

interface BindCallbackPayload {
  code: string
  state: string
}

interface CheckTweetParams {
  userKey: string
  tweetId: string
}

export default class WalletController implements Controller {
  public path = '/api/v1/twitter'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      '/bind/callback',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.bindCallback as RequestHandler
    )
    this.router.get(
      '/user/:userKey/authurl',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.userAuthUrl as RequestHandler
    )
    this.router.get(
      '/check_tweet_like/:userKey/:tweetId',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.checkTweetLike as unknown as RequestHandler
    )
    this.router.get(
      '/check_tweet_retweet/:userKey/:tweetId',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.checkTweetRetweet as unknown as RequestHandler
    )
  }

  private bindCallback(
    request: Request<any, any, BindCallbackPayload>,
    response: JsonResponse<TwitterUserInfo>,
    next: NextFunction
  ): void {
    const { authApplication } = request as ApplicationRequest
    twitterServices
      .bindTwitterCallback(
        request.body.state,
        request.body.code,
        authApplication
      )
      .then((row) => {
        response.jsonSuccess(row.twitterUserInfo)
      })
      .catch((error) => {
        console.log(error)
        response.status(500).jsonError(error.message, 2001)
      })
  }

  private userAuthUrl(
    request: Request<{ userKey: string }, any, any, { callback: string }>,
    response: JsonResponse<string>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { callback } = request.query
    const { authApplication } = request as unknown as ApplicationRequest
    twitterServices
      .getUserAuthURL(authApplication, callback, userKey)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 2002)
      })
  }

  private checkTweetLike(
    request: Request<CheckTweetParams>,
    response: JsonResponse<number>,
    next: NextFunction
  ): void {
    const { tweetId, userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    twitterServices
      .checkUserInTweetLikedList(authApplication, userKey, tweetId)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 2003)
      })
  }

  private checkTweetRetweet(
    request: Request<CheckTweetParams>,
    response: JsonResponse<number>,
    next: NextFunction
  ): void {
    const { tweetId, userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    twitterServices
      .checkUserInTweetRetweetedList(authApplication, userKey, tweetId)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 2004)
      })
  }
}
