import multer from 'multer'
import fs from 'fs'
import { v4 } from 'uuid'
import moment from 'moment'
import { Request } from 'express'

const memoryUpload = multer()

const { UPLOAD_DIST } = process.env

function getToday(): string {
  return moment(new Date()).format('yyyyMMDD')
}

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = UPLOAD_DIST ?? ''
    cb(null, dir)
  },
  filename(req, file, cb) {
    const today = getToday()
    const dir = `${UPLOAD_DIST ?? ''}/${today}`
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    const { originalname } = file
    const fix: string[] = originalname.split('.')
    const newName = fix.length === 0 ? v4() : `${v4()}.${fix[fix.length - 1]}`
    cb(null, `${today}/${newName}`)
  },
})

const diskUpload = multer({ storage: diskStorage })

const uploadMiddleware = {
  memory: memoryUpload,
  disk: diskUpload,
}

export default uploadMiddleware

export interface FileRequest extends Request {
  file: Express.Multer.File
}
