import { BrowserRouter } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <AppRoutes />
    </BrowserRouter>
  )
}
