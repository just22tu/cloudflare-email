"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Inbox, 
  Send, 
  MailOpen,
  PenLine,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CreateAddressDialog } from "../settings/create-address-dialog"
import { useMailView } from "@/store/use-mail-view"
import { SettingsDialog } from "../settings/settings-dialog"

const navItems = [
  { id: 'inbox', icon: Inbox, label: "收件箱" },
  { id: 'sent', icon: Send, label: "发件箱", disabled: true },
]

interface SidebarNavProps {
  onMobileClose?: () => void
}

export function SidebarNav({ onMobileClose }: SidebarNavProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const { view, setView } = useMailView()

  const handleNavClick = (id: string) => {
    setView(id)
    // 移动端自动收起
    onMobileClose?.()
  }

  return (
    <div className="flex flex-col h-full">
      <Separator className="mb-2" />
      <nav className="flex-1 space-y-1 px-2 lg:px-3 overflow-y-auto">
        {/* 写邮件按钮 */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base relative"
          onClick={() => handleNavClick('compose')}
        >
          <PenLine className={cn(
            "h-4 w-4",
            view === 'compose' && "text-primary"
          )} />
          <span>写邮件</span>
          {view === 'compose' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
          )}
        </Button>

        <Separator className="my-2" />

        {/* 主要功能区 */}
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            disabled={item.disabled}
            className={cn(
              "w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base relative",
              item.disabled && "opacity-50 cursor-not-allowed",
              view === item.id && "bg-muted font-medium"
            )}
            onClick={() => handleNavClick(item.id)}
          >
            <item.icon className={cn(
              "h-4 w-4",
              view === item.id && "text-primary"
            )} />
            <span>{item.label}</span>
            {view === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}
          </Button>
        ))}
          
        {/* 新建邮箱按钮 */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base"
          onClick={() => {
            setShowCreateDialog(true)
            onMobileClose?.()
          }}
        >
          <MailOpen className="h-4 w-4" />
          <span>新建邮箱</span>
        </Button>
      </nav>

      {/* 底部设置按钮 */}
      <div className="px-2 lg:px-3 py-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base"
          onClick={() => {
            setShowSettingsDialog(true)
            onMobileClose?.()
          }}
          data-settings-trigger="true"
        >
          <Settings className="h-4 w-4" />
          <span>设置</span>
        </Button>
      </div>

      <CreateAddressDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
      />
    </div>
  )
} 