import { Request, RequestHandler, NextFunction, Router } from 'express'
import { Controller } from '../types'
import NotFoundException from '../../exceptions/NotFoundException'
import jsonResponseMiddleware, {
  JsonResponse,
} from '../../middleware/jsonResponse.middleware'

export default class PingpongController implements Controller {
  public path = '/api/v1/pingpong'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.get(
      '/:type',
      jsonResponseMiddleware,
      this.ping as RequestHandler
    )
  }

  private ping(
    request: Request,
    response: JsonResponse<{ type: string }>,
    next: NextFunction
  ): void {
    const type = request.params.type
    if (type === 'ping') {
      response.jsonSuccess({ type })
    } else if (type.startsWith('ping-')) {
      response.jsonSuccess({ type })
    } else {
      next(new NotFoundException('Type'))
    }
  }
}
