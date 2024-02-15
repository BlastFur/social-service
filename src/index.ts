import sequelize from './db'
import { Sequelize } from 'sequelize-typescript'
import express, { Request } from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import helmet from 'helmet'
import { Controller } from './controllers'
import errorMiddleware from './middleware/error.middleware'
import setHeaderMiddleware from './middleware/setHeaders.middleware'
import { log, logger4js } from './config/logConfig'
import { Server } from 'http'
import 'moment-timezone'

const deleteRequestBodySaver = function (
  req: Request,
  res: any,
  buf: any,
  encoding: any
): void {
  if (buf?.length && req.method.toLocaleUpperCase() === 'DELETE') {
    try {
      const str = buf.toString(encoding || 'utf8')
      req.body = JSON.parse(str)
    } catch (error) {}
  }
}

export interface APPOtions {
  port: number
  controllers: Controller[]
}

const defaultOptions: APPOtions = {
  port: 9099,
  controllers: [],
}

export default class APP {
  private readonly option
  public app: express.Application
  private db?: Sequelize
  private server?: Server

  constructor(options: Partial<APPOtions>) {
    this.option = {
      ...defaultOptions,
      ...options,
    }
    this.app = express()

    process.once('SIGINT', () => {
      this.destory().catch((e) => console.log(e))
    })
    process.once('SIGTERM', () => {
      this.destory().catch((e) => console.log(e))
    })
  }

  public listen(): void {
    this.server = this.app.listen(this.option.port, () => {
      console.log(`App listening on the port ${this.option.port}`)
    })
  }

  public async destory(): Promise<void> {
    if (this.server) {
      this.server.close()
    }
    if (this.db) {
      await this.db.close()
    }
  }

  async init(): Promise<void> {
    this.initializeConfig()
    this.initializeMiddlewares()
    this.initializeControllers()
    this.initializeErrorHandling()
    await this.initializeDatabase()
    await this.initializeConstants()
  }

  private initializeConfig(): void {
    // 设置密钥
    this.app.set('jwtTokenSecret', process.env.JWT_SECRET ?? '666')
    // view engine setup
    this.app.set('views', path.join(__dirname, 'views'))
    this.app.set('view engine', 'ejs')
    // 设置日志记录器
    log(this.app)
  }

  private initializeMiddlewares(): void {
    this.app.use(
      helmet({
        contentSecurityPolicy: false,
      })
    )
    this.app.use(logger('dev'))
    this.app.use(cookieParser(process.env.COOKIE_SECRET))
    this.app.use(express.json({ verify: deleteRequestBodySaver }))
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(
      express.static(path.join(__dirname, '../public'), {
        setHeaders(res) {
          res.set('Access-Control-Allow-Origin', '*')
        },
      })
    )
    this.app.use(setHeaderMiddleware)
  }

  private initializeControllers(): void {
    const controllers = this.option.controllers
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router)
    })
  }

  private initializeErrorHandling(): void {
    this.app.use((_req, res) => {
      res.status(404)
      res.send('This api does not exist!')
    })
    this.app.use(errorMiddleware)
  }

  private async initializeDatabase(force = false): Promise<void> {
    // return await Promise.resolve()
    this.db = await sequelize.sync({ force })
  }

  private async initializeConstants(): Promise<void> {
    // const currentNodeVersion = await Constant.get('CurrentNodeVersion')
    // if (!currentNodeVersion) {
    //   throw new Error('CurrentNodeVersion not set')
    // }
    // const bootEndpoints = await Constant.get('BootEndpoints')
    // if (!bootEndpoints) {
    //   throw new Error('BootEndpoints not set')
    // }
  }
}
