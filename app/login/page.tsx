"use client"

import { useState, FormEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, isAuthenticated } from "@/lib/auth"
import { cn } from "@/lib/utils"

// Página de login para barbeiro
// Por que: Protege acesso ao painel administrativo, permitindo apenas barbeiros autenticados
export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Verifica se já está autenticado ao carregar página
  // Por que: Se já estiver logado, redireciona para painel automaticamente
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/painelBarber')
    }
  }, [router])

  // Handler para submit do formulário de login
  // Por que: Valida credenciais e autentica usuário
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Valida campos preenchidos
      if (!username || !password) {
        setError("Por favor, preencha usuário e senha")
        setIsLoading(false)
        return
      }

      // Tenta fazer login
      const success = login(username, password)

      if (success) {
        // Redireciona para painel após login bem-sucedido
        router.push('/painelBarber')
      } else {
        setError("Usuário ou senha incorretos")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
      console.error("Erro no login:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <Card className="border-border bg-card shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
              <img src="/logo.png" alt="Barbeiro Atual" className="w-10 h-15 mx-auto " />
            </div>
            <CardTitle className="text-3xl font-bold text-card-foreground">
              Login Barbeiro
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Acesse o painel administrativo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo de Usuário */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground font-medium">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Campo de Senha */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground text-sm"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                disabled={isLoading}
                size="lg"
                asChild={false}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </span>
                )}
              </Button>
            </form>

            {/* Link para agendamento público */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Cliente? Faça seu agendamento
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/agendamento')}
                className="w-full border-border hover:bg-accent"
                asChild={false}
              >
                Ir para Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informações de segurança */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          🔒 Acesso restrito apenas para barbeiros autorizados
        </p>
      </div>
    </div>
  )
}

