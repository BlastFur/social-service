import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import apiKeyMiddleware, {
  ApplicationRequest,
} from '../../middleware/apikey.middleware'
import walletService, {
  WalletSignRequestData,
  WalletSignRequestPayload,
  WalletSignVerifyPayload,
  WalletSignVerifyResult,
} from '../../services/wallet.service'
import { UserWalletData } from '../../db/models/UserWallet/types'
import { TwitterUserInfo } from '../../db/models/UserTwitter/types'
import twitterServices from '../../services/twitter.service'

interface UserAllData {
  wallets: UserWalletData[]
  twitter: TwitterUserInfo | null
}

export default class WalletController implements Controller {
  public path = '/api/v1/user'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(
      '/:userKey',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.allData as RequestHandler
    )
    this.router.get(
      '/:userKey/wallets',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.wallets as RequestHandler
    )
    this.router.get(
      '/:userKey/twitter',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.twitter as RequestHandler
    )
  }

  private allData(
    request: Request<{ userKey: string }>,
    response: JsonResponse<UserAllData>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    Promise.all([
      walletService.getUserWallets(authApplication.id, userKey),
      twitterServices.getUserTwitterInfo(authApplication.id, userKey),
    ])
      .then(([wallets, twitter]) => {
        response.jsonSuccess({
          wallets: wallets.map((wallet) => wallet.getData()),
          twitter,
        })
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 3000)
      })
  }

  private wallets(
    request: Request<{ userKey: string }>,
    response: JsonResponse<UserWalletData[]>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    walletService
      .getUserWallets(authApplication.id, userKey)
      .then((data) => {
        response.jsonSuccess(data.map((wallet) => wallet.getData()))
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 3001)
      })
  }

  private twitter(
    request: Request<{ userKey: string }>,
    response: JsonResponse<TwitterUserInfo | null>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    twitterServices
      .getUserTwitterInfo(authApplication.id, userKey)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 3002)
      })
  }
}
