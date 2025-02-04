"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuthStore } from "@/store/use-auth"

export default function AuthPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const setToken = useAuthStore(state => state.setToken)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const correctPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD
      if (!correctPassword) {
        throw new Error('未配置密码')
      }

      if (password === correctPassword) {
        setToken(password)
        await new Promise(resolve => setTimeout(resolve, 100))
        const authStorage = localStorage.getItem('auth-storage')
        if (!authStorage) {
          throw new Error('Token not saved')
        }
        window.location.href = '/'
      } else {
        setError("密码错误，请重试")
      }
    } catch (error) {
      console.error('auth page - error:', error)
      setError("认证失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-2xl font-semibold">EmailBox</h1>
          <p className="text-sm text-muted-foreground">请输入密码继续</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={!password || isLoading}
          >
            {isLoading ? "验证中..." : "确认"}
          </Button>
        </form>
      </div>
    </div>
  )
} 