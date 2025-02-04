import { EmailSwitcher } from "./email-switcher"
import { SidebarNav } from "./sidebar-nav"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useSidebar } from "@/store/use-sidebar"
import Image from "next/image"

interface SidebarProps {
  showHeader?: boolean
}

export function Sidebar({ showHeader }: SidebarProps) {
  const { toggle } = useSidebar()

  return (
    <div className="flex flex-col h-full">
      {/* 移动端显示的顶部 */}
      {showHeader && (
        <div className="h-14 lg:hidden border-b flex items-center px-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold">CloudFlare邮件系统</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* 邮箱切换器 */}
      <div className="p-3 border-b">
        <EmailSwitcher />
      </div>

      {/* 导航菜单和设置按钮的容器 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 导航菜单（可滚动区域） */}
        <div className="flex-1 overflow-y-auto">
          <SidebarNav onMobileClose={toggle} />
        </div>
      </div>
    </div>
  )
} 