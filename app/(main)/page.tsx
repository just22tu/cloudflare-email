"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { HttpClient, Mail, MailsResponse } from "@/lib/http-client"
import { MailList } from "@/components/mail/mail-list"
import { Inbox, Loader2 } from "lucide-react"
import { useAddressStore } from "@/store/use-address"
import { motion, AnimatePresence } from "framer-motion"
import MailEditor from "@/components/mail/mail-editor"
import { useMailView } from "@/store/use-mail-view"

export default function MailContent() {
  const { view } = useMailView()
  const [mails, setMails] = useState<Mail[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)
  const currentAddress = useAddressStore(state => state.currentAddress)

  const fetchMails = useCallback(async (isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const data: MailsResponse = currentAddress?.id === -1
        ? await HttpClient.getAllMails(20, isLoadingMore ? offsetRef.current : 0)
        : await HttpClient.getMails(
            currentAddress!.name, 
            20, 
            isLoadingMore ? offsetRef.current : 0
          )
      
      if (!data) {
        throw new Error('Failed to fetch mails')
      }

      const newHasMore = data.items.length === 20
      setHasMore(newHasMore)

      if (isLoadingMore) {
        setMails(prev => [...prev, ...data.items])
        offsetRef.current += 20
      } else {
        setMails(data.items)
        offsetRef.current = newHasMore ? 20 : 0
      }

    } catch (error) {
      console.error('Failed to fetch mails:', error)
      setError("加载邮件失败")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [currentAddress])

  useEffect(() => {
    if (!currentAddress) return

    setMails([])
    offsetRef.current = 0
    setHasMore(true)
    setError(null)
    
    fetchMails()
  }, [currentAddress, fetchMails])

  // 渲染主要内容
  const renderContent = () => {
    switch (view) {
      case 'compose':
        return (
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-4">写邮件</h1>
            <MailEditor />
          </div>
        )
      case 'inbox':
        if (loading) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <Loader2 className="h-12 w-12 mb-4 animate-spin" />
              <p>加载邮件中...</p>
            </motion.div>
          )
        }

        if (error) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full text-destructive"
            >
              {error}
            </motion.div>
          )
        }

        if (!mails || mails.length === 0) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <Inbox className="h-12 w-12 mb-4" />
              <p>没有邮件</p>
            </motion.div>
          )
        }

        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAddress?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <MailList 
                mails={mails} 
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={() => fetchMails(true)}
              />
            </motion.div>
          </AnimatePresence>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full">
      {renderContent()}
    </div>
  )
} 