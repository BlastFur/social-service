import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'
import apiKeyMiddleware, {
  ApplicationRequest,
} from '../../middleware/apikey.middleware'
import invitationServices from '../../services/invitation.service'

export default class InvitationController implements Controller {
  public path = '/api/v1/invitation'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post(
      '/create/:userKey',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.createCode as RequestHandler
    )
    this.router.get(
      '/user/:userKey/code',
      apiKeyMiddleware(),
      jsonResponseMiddleware,
      this.getCode as RequestHandler
    )
  }

  private getCode(
    request: Request<{ userKey: string }>,
    response: JsonResponse<string>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { authApplication } = request as unknown as ApplicationRequest
    invitationServices
      .getUserInvitationCode(authApplication, userKey)
      .then((code) => {
        response.jsonSuccess(code)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 4000)
      })
  }

  private createCode(
    request: Request<{ userKey: string }, any, { referralCode?: string }>,
    response: JsonResponse<string>,
    next: NextFunction
  ): void {
    const { userKey } = request.params
    const { referralCode } = request.body
    const { authApplication } = request as unknown as ApplicationRequest
    invitationServices
      .createUserInvitation(authApplication, userKey, referralCode)
      .then((code) => {
        response.jsonSuccess(code)
      })
      .catch((error) => {
        response.status(500).jsonError(error.message, 4001)
      })
  }
}
