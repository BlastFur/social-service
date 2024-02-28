import { Application, UserInvitation } from '../db/models'
import { ApplicationUuidFormat } from '../db/models/Application'
import { customUUid } from '../utils/uuid'

const defaultApplicationUuidFormat: ApplicationUuidFormat = {
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  size: 6,
}

async function generateNewCode(
  application: Application,
  depth = 5
): Promise<string> {
  if (depth === 0) {
    throw new Error('Cannot generate new code with max depth of 5')
  }

  const format = application.uuidFormat || defaultApplicationUuidFormat
  const code = customUUid(format.alphabet, format.size)()
  const exsit = await UserInvitation.findOne({
    where: {
      applicationId: application.id,
      code,
    },
  })
  if (exsit) {
    return await generateNewCode(application, depth - 1)
  }
  return code
}

export async function getUserInvitationCode(
  application: Application,
  userKey: string,
  createWhenNotFound = true
): Promise<string> {
  const invitation = await UserInvitation.findOne({
    where: {
      applicationId: application.id,
      userKey,
    },
  })
  if (!invitation) {
    if (createWhenNotFound) {
      return await createUserInvitation(application, userKey)
    } else {
      throw new Error('Invitation not found')
    }
  }
  return invitation.code
}

export async function createUserInvitation(
  application: Application,
  userKey: string,
  referralCode?: string
): Promise<string> {
  const invitation = await UserInvitation.findOne({
    where: {
      applicationId: application.id,
      userKey,
    },
  })
  if (invitation) {
    throw new Error('Invitation already exists')
  }
  const code = await generateNewCode(application)
  let fatherUserKey: string | undefined
  if (referralCode) {
    const father = await UserInvitation.findOne({
      where: {
        applicationId: application.id,
        code: referralCode,
      },
    })
    if (!father) {
      throw new Error('Invalid referral code')
    }
    fatherUserKey = father.userKey
  }
  await UserInvitation.create({
    applicationId: application.id,
    userKey,
    code,
    fatherUserKey: fatherUserKey ?? null,
  })
  return code
}

export async function destoryInvitation(
  application: Application,
  userKey: string
): Promise<void> {
  await UserInvitation.destroy({
    where: {
      applicationId: application.id,
      userKey,
    },
  })
}

const invitationServices = {
  getUserInvitationCode,
  createUserInvitation,
  destoryInvitation,
}

export default invitationServices
