"use client"

import { Mail } from "@/lib/http-client"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import { format, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import DOMPurify from 'dompurify'
import { useMemo, useRef, useEffect } from "react"

interface MailViewProps {
  mail: Mail
  onClose: () => void
}

export function MailView({ mail, onClose }: MailViewProps) {
  const sanitizedHtml = useMemo(() => {
    if (!mail.message) return ''
    return DOMPurify.sanitize(mail.message, {
      ALLOWED_TAGS: [
        // 基础文本格式
        'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'small', 'sub', 'sup',
        // 标题
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        // 列表
        'ul', 'ol', 'li',
        // 表格
        'table', 'thead', 'tbody', 'tr', 'td', 'th',
        // 其他常用元素
        'div', 'span', 'a', 'img', 'blockquote', 'pre', 'code',
        // 样式和布局
        'style', 'font', 'center', 'hr'
      ],
      ALLOWED_ATTR: [
        // 通用属性
        'class', 'id', 'style',
        // 链接属性
        'href', 'target', 'rel',
        // 图片属性
        'src', 'alt', 'width', 'height',
        // 表格属性
        'border', 'cellpadding', 'cellspacing',
        // 字体和颜色
        'face', 'color', 'size'
      ],
      ALLOW_DATA_ATTR: false,
      ADD_TAGS: ['style'],
      ADD_ATTR: ['target'], // 允许链接在新窗口打开
    })
  }, [mail.message])

  const contentRef = useRef<HTMLDivElement>(null)

  // 监听 mail 变化，滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [mail.id]) // 只在邮件 ID 变化时触发

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-semibold line-clamp-1 flex-1 min-w-0 mr-4">{mail.subject || '无主题'}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div 
          ref={contentRef}
          className="h-full px-4 py-4 space-y-4 overflow-y-auto"
        >
          <div className="max-w-full py-4 space-y-6">
            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary grid place-items-center">
                      {(mail.from?.[0] || 'U').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {mail.source || mail.from}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        发送至: {mail.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground pl-[52px]">
                    {format(addHours(new Date(mail.created_at), 8), 'PPpp', { locale: zhCN })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
              <div className="p-6">
                {mail.message ? (
                  <div className="relative">
                    <div 
                      className="[&>*]:leading-normal [&>*]:my-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                                 [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline
                                 [&_img]:max-w-full [&_img]:h-auto
                                 [&_table]:w-full [&_table]:border-collapse [&_td]:p-2 [&_th]:p-2
                                 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
                                 [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4
                                 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                                 [&_*]:break-words [&_pre]:whitespace-pre-wrap
                                 [&>p]:break-all [&>div]:break-all
                                 overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap break-all overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {mail.text}
                  </div>
                )}
              </div>
            </div>

            {mail.attachments && mail.attachments.length > 0 && (
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                <div className="p-4">
                  <h3 className="font-medium mb-4">附件</h3>
                  <div className="space-y-2">
                    {mail.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="truncate font-medium">{attachment.filename}</span>
                          <span className="text-xs text-muted-foreground">
                            {attachment.size}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild className="ml-4 shrink-0">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            下载
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 