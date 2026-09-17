import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-porcelain">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-8 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
