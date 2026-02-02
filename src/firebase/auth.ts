import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  sendPasswordResetEmail,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

export const authApi = {
  register: (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password),
  login: (email: string, password: string) => signInWithEmailAndPassword(auth, email, password),
  logout: () => signOut(auth),

  updateEmail: (user: User, email: string) => updateEmail(user, email),
  updatePassword: (user: User, password: string) => updatePassword(user, password),
  resetPasswordEmail: (email: string) => sendPasswordResetEmail(auth, email),
}
