import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const createUserInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required')
  }

  const role = context.auth.token.role
  if (role !== 'ADMIN') {
    throw new functions.https.HttpsError('permission-denied', 'Admin only')
  }

  const email = String(data.email || '').trim()
  const name = String(data.name || '').trim()
  const userRole = String(data.role || '').trim()

  if (!email.includes('@') || name.length < 2) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email or name')
  }
  if (!['CLERK', 'OFFICER', 'ACCOUNT_MANAGER', 'ADMIN'].includes(userRole)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role')
  }

  const userRecord = await admin.auth().createUser({ email, displayName: name })

  await admin.auth().setCustomUserClaims(userRecord.uid, { role: userRole })

  const now = Date.now()
  await admin.firestore().doc(`users/${userRecord.uid}`).set(
    {
      uid: userRecord.uid,
      email,
      name,
      role: userRole,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  )

  const link = await admin.auth().generatePasswordResetLink(email)

  return { uid: userRecord.uid, email, role: userRole, inviteLink: link }
})
