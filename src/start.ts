import APP from '.'
import Decimal from 'decimal.js-light'
import { PingpongController, WalletController } from './controllers'
import { PORT } from './constants'

Decimal.set({ toExpPos: 999, toExpNeg: -999, precision: 64 })

const app = new APP({
  port: PORT ? parseInt(PORT) : undefined,
  controllers: [new PingpongController(), new WalletController()],
})

app
  .init()
  .then(() => {
    app.listen()
  })
  .then(() => {
    console.log('server inited')
  })
  .catch(async (e) => {
    console.log(e)
    return await app.destory()
  })
  .catch((e) => {
    console.log(e)
  })
