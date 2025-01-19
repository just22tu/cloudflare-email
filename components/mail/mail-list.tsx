"use client"

import { Mail, HttpClient } from "@/lib/http-client"
import { formatDistanceToNow, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { MailView } from "./mail-view"
import { MobileMailView } from "./mobile-mail-view"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Bell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAddressStore } from "@/store/use-address"

interface MailListProps {
  mails: Mail[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function MailList({ mails: initialMails, hasMore, loadingMore, onLoadMore }: MailListProps) {
  const { currentAddress } = useAddressStore()
  const [mails, setMails] = useState<Mail[]>(initialMails)
  const [newMailIds, setNewMailIds] = useState<Set<number>>(new Set())
  const { toast } = useToast()
  const lastMailId = useRef(mails[0]?.id || 0)
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024
  const listRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMails(initialMails)
  }, [initialMails])

  useEffect(() => {
    if (!hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore()
        }
      },
      {
        root: listRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    )

    if (loadingRef.current) {
      observer.observe(loadingRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  useEffect(() => {
    const checkNewMails = async () => {
      try {
        const response = currentAddress?.id === -1 
          ? await HttpClient.getAllMails(20, 0)
          : await HttpClient.getMails(currentAddress?.id.toString() || '0', 20, 0)
          
        const newMails = response.items

        if (newMails[0]?.id > lastMailId.current) {
          const newMailsToAdd = newMails.filter(mail => mail.id > lastMailId.current)
          
          lastMailId.current = newMails[0].id
          
          const newIds = new Set(Array.from(newMailIds))
          newMailsToAdd.forEach(mail => newIds.add(mail.id))
          setNewMailIds(newIds)

          setMails(prev => [...newMailsToAdd, ...prev])

          if (newMailsToAdd.length > 0) {
            toast({
              description: `收到 ${newMailsToAdd.length} 封新邮件`,
            })
          }
        }
      } catch (error) {
        console.error('Failed to check new mails:', error)
      }
    }

    const interval = setInterval(checkNewMails, 30000)
    return () => clearInterval(interval)
  }, [toast, newMailIds, currentAddress])

  const handleMailClick = (mail: Mail) => {
    setSelectedMail(mail)
    if (newMailIds.has(mail.id)) {
      const updatedIds = new Set(Array.from(newMailIds))
      updatedIds.delete(mail.id)
      setNewMailIds(updatedIds)
    }
  }

  return (
    <div className="flex h-full">
      {/* 邮件列表 */}
      <motion.div 
        className={cn(
          "w-full lg:w-[350px] border-r",
          isMobile && selectedMail && "hidden"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        <div className="divide-y overflow-y-auto h-full" ref={listRef}>
          <AnimatePresence mode="wait">
            {mails.map((mail) => (
              <motion.div
                key={mail.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="relative group"
                  onClick={() => handleMailClick(mail)}
                >
                  <button
                    className={cn(
                      "w-full px-4 py-3 flex flex-col gap-1 hover:bg-muted/50 text-left",
                      selectedMail?.id === mail.id && "bg-muted"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 w-full min-w-0 py-1">
                      <div className="font-medium truncate min-w-0 flex-1">
                        {mail.subject || '无主题'}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 w-[5.5rem] text-right">
                        {formatDistanceToNow(addHours(new Date(mail.created_at), 8), { 
                          locale: zhCN, 
                          addSuffix: true 
                        })}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate min-w-0 w-full">
                      {mail.source || mail.from}
                    </div>
                  </button>
                  {newMailIds.has(mail.id) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-destructive" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {hasMore && (
            <div 
              ref={loadingRef}
              className="p-4 text-center text-sm text-muted-foreground"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>加载更多...</span>
                </div>
              ) : (
                <span>上滑加载更多</span>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* 邮件详情 */}
      <AnimatePresence mode="wait">
        {selectedMail && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={cn(
              isMobile ? 'fixed inset-0 z-50 bg-background' : 'hidden lg:block flex-1'
            )}
          >
            {isMobile ? (
              <MobileMailView 
                mail={selectedMail} 
                onClose={() => setSelectedMail(null)} 
              />
            ) : (
              <MailView 
                mail={selectedMail} 
                onClose={() => setSelectedMail(null)} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 空状态提示 */}
      {!selectedMail && (
        <div className="hidden lg:flex flex-1 items-center justify-center text-muted-foreground">
          <p>选择一封邮件查看详情</p>
        </div>
      )}
    </div>
  )
} 