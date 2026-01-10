"use client"

import { useState, useEffect } from "react"
import { DollarSign, TrendingUp, Calendar, PieChart, LogOut } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { isAuthenticated, logout } from "@/lib/auth"
import {
  getEntradasFinanceiras,
  calcularTotalReceitas,
  calcularReceitasMesAtual,
  type EntradaFinanceira,
} from "@/lib/agendamentos"

// Página de controle financeiro
// Por que: Interface dedicada para visualizar e gerenciar todas as entradas financeiras do negócio
export default function FinanceiroPage() {
  const router = useRouter()
  const [entradas, setEntradas] = useState<EntradaFinanceira[]>([])
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Verifica autenticação ao carregar página
  // Por que: Protege acesso à página financeira
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/financeiro')
      return
    }
    setIsCheckingAuth(false)
  }, [router])

  // Carrega entradas financeiras ao montar componente
  useEffect(() => {
    if (isCheckingAuth) return
    
    carregarEntradas()
    
    // Atualiza lista periodicamente
    const interval = setInterval(carregarEntradas, 5000)
    return () => clearInterval(interval)
  }, [isCheckingAuth])

  function carregarEntradas() {
    const todas = getEntradasFinanceiras()
    // Ordena por data (mais recente primeiro)
    setEntradas(todas.sort((a, b) => b.date.localeCompare(a.date)))
  }

  // Calcula estatísticas
  const totalReceitas = calcularTotalReceitas()
  const receitasMes = calcularReceitasMesAtual()
  
  // Filtra entradas por status
  const recebidas = entradas.filter(e => e.status === 'recebido')
  const pendentes = entradas.filter(e => e.status === 'pendente')
  
  // Agrupa por serviço para gráfico
  const porServico = entradas.reduce((acc, entrada) => {
    if (entrada.status === 'cancelado') return acc
    acc[entrada.service] = (acc[entrada.service] || 0) + entrada.price
    return acc
  }, {} as Record<string, number>)

  // Handler para logout
  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout()
      router.push('/login')
    }
  }

  // Formata data para exibição
  const formatarData = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  // Formata nome do serviço
  const formatarServico = (service: string) => {
    return service === 'corte' ? 'Corte' : 
           service === 'barba' ? 'Barba' : 
           'Corte + Barba'
  }

  // Mostra loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-primary text-4xl">⏳</div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Controle Financeiro
          </h1>
          <p className="text-muted-foreground text-lg">Visualize todas as entradas e receitas do negócio</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/painelBarber')} 
            variant="outline" 
            className="border-border hover:bg-accent"
            asChild={false}
          >
            ← Voltar ao Painel
          </Button>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-border hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
            asChild={false}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total de Receitas</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">R$ {totalReceitas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos os tempos</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Receitas do Mês</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">R$ {receitasMes.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Pendentes</CardTitle>
            <Calendar className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">R$ {pendentes.reduce((sum, e) => sum + e.price, 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>
      </div>

      {/* GRÁFICO POR SERVIÇO */}
      <Card className="border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <PieChart className="h-5 w-5 text-primary" />
            Receitas por Serviço
          </CardTitle>
          <CardDescription className="text-muted-foreground">Distribuição de receitas por tipo de serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(porServico).map(([servico, valor]) => (
              <div key={servico} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">
                    {formatarServico(servico)}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {valor.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{
                      width: `${(valor / totalReceitas) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LISTA DE ENTRADAS */}
      <Card className="border-border bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-card-foreground">Histórico de Entradas</CardTitle>
          <CardDescription className="text-muted-foreground">
            {entradas.length} entrada(s) registrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma entrada financeira registrada
            </div>
          ) : (
            <div className="space-y-2">
              {entradas.map((entrada) => (
                <div
                  key={entrada.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="font-semibold text-card-foreground">{entrada.clientName}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatarServico(entrada.service)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatarData(entrada.date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-green-400">
                      R$ {entrada.price.toFixed(2)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        entrada.status === 'recebido'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : entrada.status === 'pendente'
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          : 'bg-red-500/20 text-red-400 border-red-500/50'
                      }`}
                    >
                      {entrada.status === 'recebido' ? 'Recebido' :
                       entrada.status === 'pendente' ? 'Pendente' :
                       'Cancelado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

