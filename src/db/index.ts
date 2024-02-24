import { Sequelize } from 'sequelize-typescript'
import * as Models from './models'
import { RPC } from '../utils/EVMHelper/dbModels'
import { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } from '../constants'
// import { promisify } from 'util'

const { Constant, MonitorRunLog, Application, UserWallet } = Models

const sequelize = new Sequelize({
  host: DB_HOST,
  port: DB_PORT ? Number.parseInt(DB_PORT) : 3306,
  database: DB_NAME,
  dialect: 'mariadb',
  username: DB_USER,
  password: DB_PASS,
  dialectOptions: {
    timezone: '+00:00',
    allowPublicKeyRetrieval: true,
  },
  logging: false,
  pool: {
    max: 25,
  },
  models: [Constant, MonitorRunLog, RPC, Application, UserWallet],
})

export default sequelize

export { Models }
