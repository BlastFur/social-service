import { NextFunction, Request, Response } from 'express'
import jwt from 'jwt-simple'
import User from '../db/models/User'
import { SacteTokenInfo, getTobotoToken } from './utils'

export interface JWTContent {
  exp: number
  uuid: string
}

export interface JWTRequest extends Request {
  jwtData: JWTContent
  authUser: User
  tobotoToken: SacteTokenInfo
}

export interface jwtMiddlewareOptions {
  needVip: boolean
  needAdmin: boolean
}

const defaultOptions: jwtMiddlewareOptions = {
  needVip: false,
  needAdmin: false,
}

const jwtMiddleware = (
  options: Partial<jwtMiddlewareOptions> = {}
): ((request: Request, response: Response, next: NextFunction) => void) => {
  const useOptions = { ...defaultOptions, ...options }

  return (request: Request, response: Response, next: NextFunction) => {
    const token = getTobotoToken(request)

    if (!token || token.jwt.length < 10) {
      response.status(401).end('Access token needed')
      return
    }
    // 解析
    const { app } = request
    try {
      const decoded = jwt.decode(
        token.jwt,
        app.get('jwtTokenSecret')
      ) as JWTContent
      // todo  handle token here
      if (decoded.exp <= Date.now()) {
        response.status(401).end('Access token has expired')
        return
      }
      User.findByUuid(decoded.uuid)
        .then((user) => {
          if (!user) {
            response.status(401).end('Access token user not exsit')
            return
          }
          // vip check
          if (useOptions.needVip) {
            if (!user.isVip()) {
              response.status(401).end('Access token need vip')
              return
            }
          }

          // admin check
          if (useOptions.needAdmin) {
            if (!user.isAdmin) {
              response.status(401).end('Access token need admin')
              return
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(request as JWTRequest).jwtData = decoded
          ;(request as JWTRequest).authUser = user
          ;(request as JWTRequest).tobotoToken = token

          user.updateUserSacteTokenInfo(token).catch((e) => console.log(e))
          next()
        })
        .catch(() => {
          response.status(401).end('Find access token user failed')
        })
    } catch (err) {
      response.status(401).end('Access token parse failed')
    }
  }
}

const jwtAllowNullMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  const token = getTobotoToken(request)

  if (!token || token.jwt.length < 10) {
    next()
    return
  }
  // 解析
  const { app } = request
  try {
    const decoded = jwt.decode(
      token.jwt,
      app.get('jwtTokenSecret')
    ) as JWTContent
    // todo  handle token here
    if (decoded.exp <= Date.now()) {
      next()
      return
    }
    User.findByUuid(decoded.uuid)
      .then((user) => {
        if (!user) {
          next()
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;(request as JWTRequest).jwtData = decoded
        ;(request as JWTRequest).authUser = user
        ;(request as JWTRequest).tobotoToken = token

        user.updateUserSacteTokenInfo(token).catch((e) => console.log(e))
        next()
      })
      .catch(() => {
        next()
      })
  } catch (err) {
    next()
  }
}

jwtMiddleware.allowNull = jwtAllowNullMiddleware

export default jwtMiddleware
