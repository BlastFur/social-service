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
import invitationServices, {
  UserInvitationData,
} from '../../services/invitation.service'

export default class ApplicationController implements Controller {
  public path = '/api/v1/app'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      '/destroy',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.destroyAllData as RequestHandler
    )
  }

  private destroyAllData(
    request: Request,
    response: JsonResponse<boolean>,
    next: NextFunction
  ): void {
    const { authApplication } = request as unknown as ApplicationRequest
    Promise.all([
      walletService.destoryAllWallet(authApplication),
      twitterServices.destoryAllTwitter(authApplication),
      invitationServices.destoryAllInvitation(authApplication),
    ])
      .then(() => {
        response.jsonSuccess(true)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 3000)
      })
  }
}
