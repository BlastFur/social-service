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

export default class WalletController implements Controller {
  public path = '/api/v1/wallet'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      '/sign/request',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.signRequest as RequestHandler
    )
    this.router.post(
      '/sign/verify',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.signVerify as RequestHandler
    )
    this.router.post(
      '/user/:userKey',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.upsertWallet as RequestHandler
    )
  }

  private signRequest(
    request: Request<any, any, WalletSignRequestPayload>,
    response: JsonResponse<WalletSignRequestData>,
    next: NextFunction
  ): void {
    const { authApplication } = request as ApplicationRequest
    walletService
      .requestWalletSign(request.body, authApplication.id)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1000)
      })
  }

  private signVerify(
    request: Request<any, any, WalletSignVerifyPayload>,
    response: JsonResponse<WalletSignVerifyResult>,
    next: NextFunction
  ): void {
    const { authApplication } = request as ApplicationRequest
    walletService
      .verfiyWalletSign(request.body, authApplication.id)
      .then((data) => {
        response.jsonSuccess(data)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1000)
      })
  }

  private upsertWallet(
    request: Request<
      { userKey: string },
      any,
      Omit<UserWalletData, 'applicationId' | 'userKey'>
    >,
    response: JsonResponse<UserWalletData>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    walletService
      .upsertWallet({
        userKey,
        applicationId: authApplication.id,
        ...request.body,
      })
      .then((data) => {
        response.jsonSuccess(data.getData())
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 1000)
      })
  }
}
