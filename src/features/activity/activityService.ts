import type { ActivityLog } from '@/types'
import { addDoc, col, getDocs, orderBy, query, limit } from '@/firebase/firestore'

export async function logActivity(actorUid: string, action: string, targetId?: string, metadata?: Record<string, unknown>) {
  await addDoc(col('activity-logs'), {
    actorUid,
    action,
    targetId: targetId || null,
    metadata: metadata || null,
    createdAt: Date.now(),
  })
}

export async function fetchLatestActivity(): Promise<ActivityLog[]> {
  const q = query(col('activity-logs'), orderBy('createdAt', 'desc'), limit(200))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ActivityLog, 'id'>) }))
}
