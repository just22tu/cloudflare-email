"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Inbox, 
  Send, 
  MailOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { CreateAddressDialog } from "../settings/create-address-dialog"

const navItems = [
  { id: 'inbox', icon: Inbox, label: "收件箱" },
  { id: 'sent', icon: Send, label: "发件箱", disabled: true },
]

export function SidebarNav() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  // 默认选中收件箱
  const [selectedItem, setSelectedItem] = useState('inbox')

  return (
    <div className="h-full flex flex-col">
      {/* 主导航菜单 */}
      <Separator className="mb-2" />
      <nav className="flex-1 space-y-1 px-2 lg:px-3">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            disabled={item.disabled}
            className={cn(
              "w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base relative",
              item.disabled && "opacity-50 cursor-not-allowed",
              selectedItem === item.id && "bg-muted font-medium"
            )}
            onClick={() => setSelectedItem(item.id)}
          >
            <item.icon className={cn(
              "h-4 w-4",
              selectedItem === item.id && "text-primary"
            )} />
            <span>{item.label}</span>
            {selectedItem === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
            )}
          </Button>
        ))}
      </nav>

      {/* 新建邮箱按钮（固定在底部） */}
      <div className="mt-auto">
        <Separator className="mb-2" />
        <div className="px-2 lg:px-3 pb-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 lg:gap-3 h-9 lg:h-10 rounded-lg font-normal text-sm lg:text-base"
            onClick={() => setShowCreateDialog(true)}
          >
            <MailOpen className="h-4 w-4" />
            <span>新建邮箱</span>
          </Button>
        </div>
      </div>

      <CreateAddressDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
      />
    </div>
  )
} 