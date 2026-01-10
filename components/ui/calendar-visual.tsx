"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Componente de calendário visual melhorado para agendamentos
// Por que: Interface intuitiva que mostra agendamentos em formato de calendário mensal com tema escuro
interface CalendarVisualProps {
  agendamentos: Array<{
    id: string
    date: string
    time: string
    clientName: string
    service: string
    status: string
  }>
  onDateSelect?: (date: string) => void
  selectedDate?: string
}

export function CalendarVisual({ agendamentos, onDateSelect, selectedDate }: CalendarVisualProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Nomes dos meses em português
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  // Nomes dos dias da semana
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  // Obtém primeiro dia do mês e quantos dias tem o mês
  const primeiroDiaMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const ultimoDiaMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const diasNoMes = ultimoDiaMes.getDate()
  const diaInicioSemana = primeiroDiaMes.getDay()

  // Gera array de dias do mês
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1)

  // Busca agendamentos de uma data específica
  const getAgendamentosDoDia = (dia: number) => {
    const dataStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return agendamentos.filter(a => a.date === dataStr)
  }

  // Navega para mês anterior
  const mesAnterior = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navega para próximo mês
  const proximoMes = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Verifica se data é hoje
  const isHoje = (dia: number) => {
    const hoje = new Date()
    return (
      dia === hoje.getDate() &&
      currentDate.getMonth() === hoje.getMonth() &&
      currentDate.getFullYear() === hoje.getFullYear()
    )
  }

  // Verifica se data está selecionada
  const isSelecionada = (dia: number) => {
    if (!selectedDate) return false
    const dataStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return selectedDate === dataStr
  }

  // Verifica se data está no passado
  // Por que: Desabilita datas passadas para prevenir agendamentos inválidos
  const isPastDate = (dia: number) => {
    const dataStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    const dataObj = new Date(dataStr + 'T00:00:00')
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    return dataObj < hoje
  }

  // Obtém cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'bg-green-500/20 border-green-500/50'
      case 'pendente':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'cancelado':
        return 'bg-red-500/20 border-red-500/50'
      case 'concluido':
        return 'bg-blue-500/20 border-blue-500/50'
      default:
        return 'bg-gray-500/20 border-gray-500/50'
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
      {/* Cabeçalho do calendário */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={mesAnterior}
          className="hover:bg-accent"
          asChild={false}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-bold text-foreground">
          {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={proximoMes}
          className="hover:bg-accent"
          asChild={false}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {diasSemana.map((dia) => (
          <div
            key={dia}
            className="text-center text-sm font-semibold text-muted-foreground py-2"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-2">
        {/* Espaços vazios antes do primeiro dia */}
        {Array.from({ length: diaInicioSemana }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Dias do mês */}
        {dias.map((dia) => {
          const agendamentosDia = getAgendamentosDoDia(dia)
          const hoje = isHoje(dia)
          const selecionada = isSelecionada(dia)
          const passado = isPastDate(dia)

          return (
            <button
              key={dia}
              onClick={() => {
                if (passado) return // Não permite selecionar datas passadas
                const dataStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
                onDateSelect?.(dataStr)
              }}
              disabled={passado}
              className={cn(
                "aspect-square rounded-lg border-2 p-2 text-left transition-all",
                "flex flex-col gap-1 min-h-[80px]",
                !passado && "hover:scale-105 cursor-pointer",
                passado && "opacity-40 cursor-not-allowed",
                hoje && !passado && "border-primary ring-2 ring-primary/50",
                selecionada && !passado && "border-accent bg-accent/20",
                !hoje && !selecionada && !passado && "border-border hover:border-accent",
                agendamentosDia.length > 0 && "bg-card/50"
              )}
            >
              {/* Número do dia */}
              <span
                className={cn(
                  "text-sm font-semibold",
                  hoje && "text-primary",
                  selecionada && !hoje && "text-accent-foreground",
                  !hoje && !selecionada && "text-foreground"
                )}
              >
                {dia}
              </span>

              {/* Agendamentos do dia */}
              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {agendamentosDia.slice(0, 2).map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded border truncate",
                      getStatusColor(agendamento.status),
                      "text-foreground"
                    )}
                    title={`${agendamento.time} - ${agendamento.clientName} (${agendamento.service})`}
                  >
                    <span className="font-medium">{agendamento.time}</span> {agendamento.clientName.substring(0, 8)}
                  </div>
                ))}
                {agendamentosDia.length > 2 && (
                  <div className="text-xs text-muted-foreground px-1.5">
                    +{agendamentosDia.length - 2} mais
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legenda */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500/50" />
          <span className="text-muted-foreground">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/50" />
          <span className="text-muted-foreground">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/50" />
          <span className="text-muted-foreground">Cancelado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/20 border border-blue-500/50" />
          <span className="text-muted-foreground">Concluído</span>
        </div>
      </div>
    </div>
  )
}

