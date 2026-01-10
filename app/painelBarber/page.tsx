"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Scissors, User, Trash2, X, Check, DollarSign, TrendingUp, AlertCircle, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarVisual } from "@/components/ui/calendar-visual"
import { cn } from "@/lib/utils"
import { isAuthenticated, logout, getSession } from "@/lib/auth"
import {
  getAgendamentosOrdenados,
  deleteAgendamento,
  updateAgendamentoStatus,
  calcularTotalReceitas,
  calcularReceitasMesAtual,
  contarAgendamentosPendentes,
  type Agendamento,
} from "@/lib/agendamentos"

// Página do painel do barbeiro
// Por que: Interface administrativa onde barbeiro gerencia todos os agendamentos e visualiza dashboard financeiro
export default function PainelBarberPage() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [filtroStatus, setFiltroStatus] = useState<'todos' | Agendamento['status']>('todos')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Verifica autenticação ao carregar página
  // Por que: Protege acesso ao painel, redirecionando para login se não autenticado
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login?redirect=/painelBarber')
      return
    }
    setIsCheckingAuth(false)
  }, [router])

  // Carrega agendamentos ao montar componente e quando filtro muda
  // Por que: Mantém lista atualizada e permite filtrar por status
  useEffect(() => {
    if (isCheckingAuth) return
    
    carregarAgendamentos()
    
    // Atualiza lista a cada 5 segundos para sincronizar com outras abas
    // Por que: Se barbeiro abrir múltiplas abas, todas ficam sincronizadas
    const interval = setInterval(carregarAgendamentos, 5000)
    return () => clearInterval(interval)
  }, [filtroStatus, isCheckingAuth])

  // Carrega agendamentos do localStorage
  function carregarAgendamentos() {
    const todos = getAgendamentosOrdenados()
    
    // Aplica filtro se necessário
    if (filtroStatus === 'todos') {
      setAgendamentos(todos)
    } else {
      setAgendamentos(todos.filter(a => a.status === filtroStatus))
    }
  }

  // Handler para excluir agendamento
  // Por que: Permite remover agendamentos definitivamente do sistema
  const handleExcluir = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    
    if (deleteAgendamento(id)) {
      carregarAgendamentos()
      alert('Agendamento excluído com sucesso!')
    } else {
      alert('Erro ao excluir agendamento')
    }
  }

  // Handler para cancelar agendamento
  // Por que: Cancela sem excluir, mantendo histórico para relatórios
  const handleCancelar = (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return
    
    if (updateAgendamentoStatus(id, 'cancelado')) {
      carregarAgendamentos()
      alert('Agendamento cancelado!')
    } else {
      alert('Erro ao cancelar agendamento')
    }
  }

  // Handler para confirmar agendamento
  // Por que: Marca agendamento como confirmado, atualizando status financeiro
  const handleConfirmar = (id: string) => {
    if (updateAgendamentoStatus(id, 'confirmado')) {
      carregarAgendamentos()
    }
  }

  // Handler para marcar como concluído
  // Por que: Finaliza agendamento e confirma recebimento
  const handleConcluir = (id: string) => {
    if (updateAgendamentoStatus(id, 'concluido')) {
      carregarAgendamentos()
    }
  }

  // Formata data para exibição
  const formatarData = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    })
  }

  // Calcula estatísticas para o dashboard
  const totalReceitas = calcularTotalReceitas()
  const receitasMes = calcularReceitasMesAtual()
  const pendentes = contarAgendamentosPendentes()
  const agendamentosHoje = agendamentos.filter(a => a.date === new Date().toISOString().split('T')[0]).length

  const [selectedDate, setSelectedDate] = useState<string | undefined>()

  // Handler para logout
  // Por que: Permite barbeiro sair do sistema de forma segura
  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout()
      router.push('/login')
    }
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

  const session = getSession()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
      
      {/* CABEÇALHO */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Painel do Barbeiro
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie agendamentos e visualize suas finanças
            {session && (
              <span className="ml-2 text-sm text-muted-foreground">
                • Logado como: <span className="font-semibold text-foreground">{session.username}</span>
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/agendamento')} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
            asChild={false}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
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

      {/* DASHBOARD FINANCEIRO */}
      {/* Por que: Mostra resumo financeiro rapidamente sem precisar ir para página financeira */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total de Receitas</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">R$ {totalReceitas.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Todos os agendamentos confirmados</p>
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
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{pendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando confirmação</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Agendamentos Hoje</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{agendamentosHoje}</div>
            <p className="text-xs text-muted-foreground mt-1">Para hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* CALENDÁRIO VISUAL */}
      {/* Por que: Visualização intuitiva dos agendamentos em formato de calendário mensal */}
      <CalendarVisual
        agendamentos={agendamentos.map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          clientName: a.clientName,
          service: a.service,
          status: a.status,
        }))}
        onDateSelect={setSelectedDate}
        selectedDate={selectedDate}
      />

      {/* FILTROS E LISTA DE AGENDAMENTOS */}
      <Card className="border-border bg-card shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-card-foreground text-2xl">Agendamentos</CardTitle>
              <CardDescription className="text-muted-foreground">
                {agendamentos.length} agendamento(s) encontrado(s)
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filtroStatus === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('todos')}
                className={cn(
                  filtroStatus === 'todos' && 'bg-primary text-primary-foreground',
                  filtroStatus !== 'todos' && 'border-border hover:bg-accent'
                )}
                asChild={false}
              >
                Todos
              </Button>
              <Button
                variant={filtroStatus === 'pendente' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('pendente')}
                className={cn(
                  filtroStatus === 'pendente' && 'bg-yellow-500 text-white',
                  filtroStatus !== 'pendente' && 'border-border hover:bg-accent'
                )}
                asChild={false}
              >
                Pendentes
              </Button>
              <Button
                variant={filtroStatus === 'confirmado' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('confirmado')}
                className={cn(
                  filtroStatus === 'confirmado' && 'bg-blue-500 text-white',
                  filtroStatus !== 'confirmado' && 'border-border hover:bg-accent'
                )}
                asChild={false}
              >
                Confirmados
              </Button>
              <Button
                variant={filtroStatus === 'concluido' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus('concluido')}
                className={cn(
                  filtroStatus === 'concluido' && 'bg-green-500 text-white',
                  filtroStatus !== 'concluido' && 'border-border hover:bg-accent'
                )}
                asChild={false}
              >
                Concluídos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {agendamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum agendamento encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentos.map((agendamento) => {
                const borderColor = 
                  agendamento.status === 'pendente' ? 'border-l-yellow-500' :
                  agendamento.status === 'confirmado' ? 'border-l-blue-500' :
                  agendamento.status === 'concluido' ? 'border-l-green-500' :
                  'border-l-red-500'

                return (
                  <Card 
                    key={agendamento.id} 
                    className={cn(
                      "border-l-4 border-border bg-card hover:shadow-lg transition-all",
                      borderColor
                    )}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Informações do cliente */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-semibold text-card-foreground text-lg">
                                {agendamento.clientName}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                {agendamento.clientPhone}
                              </span>
                            </div>
                          </div>

                          {/* Data e horário */}
                          <div className="flex items-center gap-6 text-sm flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">
                                {formatarData(agendamento.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{agendamento.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Scissors className="h-4 w-4 text-muted-foreground" />
                              <span className="text-foreground capitalize font-medium">
                                {agendamento.service === 'corte' ? 'Corte' : 
                                 agendamento.service === 'barba' ? 'Barba' : 
                                 'Corte + Barba'}
                              </span>
                            </div>
                          </div>

                          {/* Valor e status */}
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-bold text-green-400">
                              R$ {agendamento.price.toFixed(2)}
                            </span>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold",
                                agendamento.status === 'pendente' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
                                agendamento.status === 'confirmado' && 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
                                agendamento.status === 'concluido' && 'bg-green-500/20 text-green-400 border border-green-500/50',
                                agendamento.status === 'cancelado' && 'bg-red-500/20 text-red-400 border border-red-500/50'
                              )}
                            >
                              {agendamento.status === 'pendente' ? 'Pendente' :
                               agendamento.status === 'confirmado' ? 'Confirmado' :
                               agendamento.status === 'concluido' ? 'Concluído' :
                               'Cancelado'}
                            </span>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2 flex-shrink-0">
                          {agendamento.status === 'pendente' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmar(agendamento.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                asChild={false}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelar(agendamento.id)}
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                asChild={false}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {agendamento.status === 'confirmado' && (
                            <Button
                              size="sm"
                              onClick={() => handleConcluir(agendamento.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              asChild={false}
                            >
                              Concluir
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleExcluir(agendamento.id)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                            asChild={false}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* LINK PARA PÁGINA FINANCEIRA */}
      <div className="flex justify-end pt-4">
        <Button
          variant="outline"
          onClick={() => router.push('/financeiro')}
          className="border-border hover:bg-accent"
          asChild={false}
        >
          Ver Detalhes Financeiros →
        </Button>
      </div>
      </div>
    </div>
  )
}

