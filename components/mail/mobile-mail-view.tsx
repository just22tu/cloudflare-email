"use client"

import { Mail } from "@/lib/http-client"
import { Button } from "../ui/button"
import { ArrowLeft } from "lucide-react"
import { format, addHours } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"
import DOMPurify from 'dompurify'

interface MobileMailViewProps {
  mail: Mail
  onClose: () => void
}

export function MobileMailView({ mail, onClose }: MobileMailViewProps) {
  const x = useMotionValue(0)
  const controls = useAnimation()
  const dragStartX = useRef(0)
  
  // 根据滑动距离计算不同的动画值
  const opacity = useTransform(x, [0, 100, 200], [1, 0.8, 0])
  const scale = useTransform(x, [0, 100], [1, 0.95])
  const borderRadius = useTransform(x, [0, 100], [0, 20])
  const backgroundColor = useTransform(
    x,
    [0, 200],
    ["hsl(var(--background))", "hsl(var(--muted))"]
  )

  const handleDragStart = (event: any) => {
    dragStartX.current = event.clientX || event.touches?.[0]?.clientX || 0
  }

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const velocity = info.velocity.x
    const offset = info.offset.x

    // 放宽边缘区域和触发条件
    if (dragStartX.current <= 50) { // 增加边缘区域到 50px
      if (velocity > 300 || offset > 80) { // 降低速度和距离阈值
        await controls.start({
          x: 300,
          opacity: 0,
          transition: { duration: 0.2 }
        })
        onClose()
      } else {
        controls.start({
          x: 0,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
          }
        })
      }
    } else {
      x.set(0)
    }
  }

  // 同步修改滑动限制
  useEffect(() => {
    const unsubscribe = x.onChange((latest) => {
      if (latest < 0) {
        x.set(0)
      } else if (dragStartX.current > 50 && latest > 0) { // 同步修改边缘区域判断
        x.set(0)
      }
    })
    return () => unsubscribe()
  }, [x])

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
      ADD_ATTR: ['target'],
    })
  }, [mail.message])

  return (
    <motion.div
      style={{
        x,
        opacity,
        backgroundColor
      }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.7}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="fixed inset-0 touch-pan-y bg-background overflow-hidden"
    >
      <motion.div 
        className="flex flex-col h-full safe-top"
        style={{ scale, borderRadius }}
      >
        {/* 顶部导航 */}
        <div className="h-14 lg:h-16 border-b flex items-center px-4 gap-4 shrink-0 bg-background/95 backdrop-blur-sm z-10">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-medium truncate flex-1 min-w-0">邮件详情</h1>
        </div>

        {/* 内容区域 - 移除多余的滚动容器 */}
        <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
          {/* 邮件信息卡片 */}
          <div className="bg-card/50 rounded-lg border">
            <div className="p-4">
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-semibold break-words">
                  {mail.subject || '无主题'}
                </h2>
                
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
                    <div className="text-sm text-muted-foreground mt-1">
                      {format(addHours(new Date(mail.created_at), 8), 'PPpp', { locale: zhCN })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 邮件内容 */}
          <div className="bg-card/50 rounded-lg border">
            <div className="p-4">
              {mail.message ? (
                <div 
                  className="[&>*]:leading-normal [&>*]:my-4 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                             [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline
                             [&_img]:max-w-full [&_img]:h-auto
                             [&_table]:w-full [&_table]:border-collapse
                             [&_td]:p-2 [&_th]:p-2 [&_td,_th]:align-top
                             [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded [&_pre]:overflow-x-auto
                             [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4
                             [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6
                             [&>p]:break-words [&>div]:break-words
                             [&_code]:text-sm
                             text-sm"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <div className="whitespace-pre-wrap break-words text-sm">
                  {mail.text}
                </div>
              )}
            </div>
          </div>

          {/* 附件 */}
          {mail.attachments && mail.attachments.length > 0 && (
            <div className="bg-card/50 rounded-lg border">
              <div className="p-4">
                <h3 className="font-medium mb-3">附件</h3>
                <div className="space-y-2">
                  {mail.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg active:bg-muted/50"
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
      </motion.div>
    </motion.div>
  )
} 