import { col } from "@/firebase/firestore"
import type { SubAccount } from "@/types"
import { getDocs, query, orderBy } from "firebase/firestore"

export async function fetchSubAccounts(): Promise<SubAccount[]> {
  const snap = await getDocs(query(col('subAccounts'), orderBy('createdAt', 'desc')))
  return snap.docs.map((d) => d.data() as SubAccount)
}