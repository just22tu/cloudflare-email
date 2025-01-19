"use client"

import { Sidebar } from "@/components/sidebar/sidebar"
import { MenuIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/store/use-sidebar"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface EmailLayoutProps {
  children: React.ReactNode
}

export default function EmailLayout({ children }: EmailLayoutProps) {
  const { isOpen, toggle } = useSidebar()

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 统一的顶部区域 */}
      <div className="h-14 lg:h-16 border-b flex items-center px-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={toggle}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold hidden sm:block">CloudFlare邮件系统</h1>
        </div>
      </div>

      {/* 主体内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 侧边栏 */}
        <div
          className={cn(
            "fixed top-0 left-0 h-full w-80 -translate-x-full transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72 lg:h-auto border-r bg-background z-30",
            isOpen && "translate-x-0"
          )}
        >
          <Sidebar showHeader />
        </div>

        {/* 遮罩层 */}
        {isOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
            onClick={toggle}
          />
        )}

        {/* 主内容区 */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
} 