import { NextFunction, Request, Response } from 'express'

const { DATACENTER } = process.env

function setHeaderMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  response.header('SB-DATACENTER', DATACENTER)
  next()
}

export default setHeaderMiddleware
