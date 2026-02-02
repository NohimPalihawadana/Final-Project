import type { AppUser, UserRole } from '@/types'
import { col, deleteDoc, getDocs, orderBy, query, ref, updateDoc, where } from '@/firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { secondaryAuth, db } from '@/firebase/firebase'
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

const DEFAULT_PASSWORD = 'ChangeMe@123' // You can change this

export async function fetchUsers(): Promise<AppUser[]> {
  const snap = await getDocs(query(col('users'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as AppUser)
}

export async function updateUserProfile(uid: string, patch: Partial<Pick<AppUser, 'name' | 'role'>>) {
  await updateDoc(ref(`users/${uid}`), { ...patch, updatedAt: Date.now() })
}

export async function deleteUser(uid: string) {
  // Note: Deleting Auth user requires Admin SDK (Cloud Function). Here we delete Firestore profile only.
  await deleteDoc(ref(`users/${uid}`))
}

export async function inviteUser(args: { email: string; role: UserRole; name: string }) {
  const email = args.email.trim()
  const name = args.name.trim()
  const role = args.role

  if (!email.includes('@') || name.length < 2) {
    throw new Error('Invalid email or name')
  }

  // 1) Create Auth user using SECONDARY auth (won’t log out admin)
  const cred = await createUserWithEmailAndPassword(secondaryAuth, email, DEFAULT_PASSWORD)
  const newUser = cred.user

  // 2) Set displayName
  await updateProfile(newUser, { displayName: name })

  // 3) Create Firestore user profile (this is what your app uses for role routing/permissions)
  await setDoc(
    doc(db, 'users', newUser.uid),
    {
      uid: newUser.uid,
      email,
      name,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )

  // 4) Sign out secondary auth so it doesn't keep a session
  await signOut(secondaryAuth)

  // Return temp password so Admin can share it
  return {
    uid: newUser.uid,
    email,
    role,
    temporaryPassword: DEFAULT_PASSWORD,
  }
}


export async function upsertSelfProfile(user: { uid: string; email: string | null }, name: string) {
  const now = Date.now()
  await setDoc(
    ref(`users/${user.uid}`),
    {
      uid: user.uid,
      email: user.email ?? '',
      name,
      role: 'CLERK',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  )
}

export type UserListItem = { uid: string; name: string; email: string; role: string }

export async function fetchOfficers(): Promise<UserListItem[]> {
  const q = query(col('users'), where('role', '==', 'OFFICER'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as any
    return {
      uid: data.uid || d.id,
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'OFFICER',
    }
  })
}
