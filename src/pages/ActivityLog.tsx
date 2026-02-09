import { fetchActivityThunk } from "@/features/activity/activitySlice"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { Button } from "@/components/Button"
import { Table, Td, Th } from "@/components/Table"
import { useEffect, useMemo, useState } from "react"
import { fetchUsersThunk } from "@/features/users/usersSlice"
import { fetchMonthsThunk } from "@/features/records/recordsSlice"


export default function ActivityLog() {

  const users = useAppSelector((state) => state.users.items)

  const userNameByUid = useMemo(() => {
    const map: Record<string, string> = {}
    users.forEach((u) => {
      map[u.uid] = u.name
    })
    return map
  }, [users])


  const dispatch = useAppDispatch()
  const activity = useAppSelector((state) => state.activity.items)

  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchUsersThunk())
    dispatch(fetchActivityThunk())
    dispatch(fetchMonthsThunk())
  }, [dispatch])

  // Last 14 days filter (by createdAt milliseconds)
  const twoWeeksAgoMs = useMemo(() => Date.now() - 14 * 24 * 60 * 60 * 1000, [])
  const lastTwoWeeks = useMemo(() => {
    return activity
      .filter((a) => (a.createdAt ?? 0) >= twoWeeksAgoMs)
      .slice()
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)) // newest first
  }, [activity, twoWeeksAgoMs])

  const handleDownloadPdfLastTwoWeeks = async () => {
    try {
      setPdfLoading(true)

      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ])

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })

      const from = new Date(twoWeeksAgoMs)
      const to = new Date()

      const title = "Activity Log Report (Last 2 Weeks)"
      const period = `Period: ${from.toLocaleDateString()} → ${to.toLocaleDateString()}`
      const generated = `Generated: ${new Date().toLocaleString()}`
      const total = `Total records: ${lastTwoWeeks.length}`

      // Header text
      doc.setFontSize(14)
      doc.text(title, 40, 45)
      doc.setFontSize(10)
      doc.text(period, 40, 65)
      doc.text(generated, 40, 80)
      doc.text(total, 40, 95)

      // Prepare table data
      const head = [["Time", "Actor UID", "Action", "Target"]]
      const body = lastTwoWeeks.map((a) => [
        new Date(a.createdAt).toLocaleString(),
        userNameByUid[a.actorUid] ?? "Unknown user",
        a.action || "-",
        a.targetId || "-",
      ])


      // Use whichever export exists
      const autoTable =
        (autoTableMod as any).default || (autoTableMod as any)

      autoTable(doc, {
        head,
        body,
        startY: 115,
        styles: {
          fontSize: 9,
          cellPadding: 6,
          overflow: "linebreak",
          valign: "top",
        },
        headStyles: {
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 140 }, // Time
          1: { cellWidth: 120 }, // Actor UID
          2: { cellWidth: 160 }, // Action
          3: { cellWidth: 120 }, // Target
        },
        didDrawPage: (data: any) => {
          // Footer: page numbers
          const pageCount = doc.getNumberOfPages()
          const pageCurrent = doc.getCurrentPageInfo().pageNumber
          doc.setFontSize(9)
          doc.text(
            `Page ${pageCurrent} / ${pageCount}`,
            doc.internal.pageSize.getWidth() - 90,
            doc.internal.pageSize.getHeight() - 25
          )
        },
      })

      // Download
      doc.save(`activity-log-last-2-weeks-${to.toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error(err)
      alert("PDF generation failed. Check console for details.")
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div>
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Activity log</div>
            <div className="mt-1 text-sm text-slate-600">You can see all user actions here.</div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => dispatch(fetchActivityThunk())}>
              Refresh
            </Button>

            <Button
              variant="secondary"
              onClick={handleDownloadPdfLastTwoWeeks}
              loading={pdfLoading}
              disabled={pdfLoading}
            >
              Download PDF (Last 2 Weeks)
            </Button>
          </div>
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
                  <Td>
                    <span className="text-sm">
                      {userNameByUid[a.actorUid] ?? "Unknown user"}
                    </span>
                  </Td>

                  <Td>{a.action}</Td>
                  <Td>
                    <span className="text-xs text-slate-500">{a.targetId || "-"}</span>
                  </Td>
                </tr>
              ))}
              {activity.length === 0 ? (
                <tr>
                  <Td>
                    <span className="text-slate-500">No activity yet.</span>
                  </Td>
                  <Td />
                  <Td />
                  <Td />
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  )
}
