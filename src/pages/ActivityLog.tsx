import { fetchActivityThunk } from "@/features/activity/activitySlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/Button";
import { Table, Td, Th } from "@/components/Table";
import { useEffect } from "react";
import { fetchUsersThunk } from "@/features/users/usersSlice";
import { fetchMonthsThunk } from "@/features/records/recordsSlice";



export default function ActivityLog() {

  const dispatch = useAppDispatch()
  const activity = useAppSelector((state) => state.activity.items)

  useEffect(() => {
    dispatch(fetchUsersThunk())
    dispatch(fetchActivityThunk())
    dispatch(fetchMonthsThunk())
  }, [dispatch])


  return (
    <div>
        <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Activity log</div>
            <div className="mt-1 text-sm text-slate-600">You can see all user actions here.</div>
          </div>
          <Button variant="secondary" onClick={() => dispatch(fetchActivityThunk())}>Refresh</Button>
        </div>

        <div className="mt-4">
          <Table>
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Target</Th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a) => (
                <tr key={a.id}>
                  <Td>{new Date(a.createdAt).toLocaleString()}</Td>
                  <Td><span className="text-xs text-slate-500">{a.actorUid}</span></Td>
                  <Td>{a.action}</Td>
                  <Td><span className="text-xs text-slate-500">{a.targetId || '-'}</span></Td>
                </tr>
              ))}
              {activity.length === 0 ? (
                <tr><Td><span className="text-slate-500">No activity yet.</span></Td><Td /><Td /><Td /></tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}