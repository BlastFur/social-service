import { nanoid } from 'nanoid'
import { Application } from '../db/models'

export async function createNewApplication(
  name: string,
  apikey: string = nanoid()
): Promise<Application> {
  return await Application.create({
    name: name,
    apikey,
  })
}

export async function verfiyApikey(
  apikey: string
): Promise<Application | null> {
  return await Application.findOne({
    where: {
      apikey,
    },
  })
}

const applicationServices = {
  createNewApplication,
  verfiyApikey,
}

export default applicationServices
