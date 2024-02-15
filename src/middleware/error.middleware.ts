import { NextFunction, Request, Response } from 'express'
import HttpException from '../exceptions/HttpException'

function errorMiddleware(
  error: HttpException,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  const status = error.status || 500
  const message = error.message || 'Something went wrong'
  response.status(status).send({
    success: false,
    error: {
      message,
      code: status,
    },
  })
}

export default errorMiddleware
