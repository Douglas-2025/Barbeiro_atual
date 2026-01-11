"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Agendamento {
  id: string
  date: string
  time: string
  clientName: string
  service: string
  status: string
}

interface CalendarVisualProps {
  agendamentos: Agendamento[]
  onDateSelect?: (date: string) => void
  selectedDate?: string
}

export function CalendarVisual({
  agendamentos,
  onDateSelect,
  selectedDate,
}: CalendarVisualProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ]

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const primeiroDiaSemana = new Date(year, month, 1).getDay()
  const diasNoMes = new Date(year, month + 1, 0).getDate()

  const hoje = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const agendamentosPorData = useMemo(() => {
    return agendamentos.reduce<Record<string, Agendamento[]>>((acc, a) => {
      acc[a.date] ??= []
      acc[a.date].push(a)
      return acc
    }, {})
  }, [agendamentos])

  const isPastDate = (dateStr: string) =>
    new Date(`${dateStr}T00:00:00`) < hoje

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmado":
        return "bg-green-500/20 border-green-500/50"
      case "pendente":
        return "bg-yellow-500/20 border-yellow-500/50"
      case "cancelado":
        return "bg-red-500/20 border-red-500/50"
      case "concluido":
        return "bg-blue-500/20 border-blue-500/50"
      default:
        return "bg-muted border-border"
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h2 className="text-lg sm:text-xl font-semibold">
          {meses[month]} {year}
        </h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mb-2">
        {diasSemana.map(d => <div key={d}>{d}</div>)}
      </div>

      {/* Dias */}
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
          <div key={i} />
        ))}

        {Array.from({ length: diasNoMes }, (_, i) => {
          const dia = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

          const ags = agendamentosPorData[dateStr] ?? []
          const passado = isPastDate(dateStr)
          const selecionado = selectedDate === dateStr
          const isHoje =
            dateStr ===
            `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`

          return (
            <button
              key={dateStr}
              disabled={passado}
              aria-label={`Selecionar dia ${dia}`}
              onClick={() => !passado && onDateSelect?.(dateStr)}
              className={cn(
                "relative min-h-[72px] sm:min-h-[90px] rounded-lg border p-2 text-left transition",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                passado && "opacity-40 cursor-not-allowed",
                !passado && "hover:border-primary",
                selecionado && "border-primary bg-primary/10",
                isHoje && "ring-2 ring-primary/40"
              )}
            >
              <span className="text-sm font-semibold">{dia}</span>

              <div className="mt-1 flex flex-col gap-1">
                {ags.slice(0, 2).map(a => (
                  <div
                    key={a.id}
                    className={cn(
                      "text-[10px] sm:text-xs px-1 py-0.5 rounded border truncate",
                      getStatusColor(a.status)
                    )}
                  >
                    <b>{a.time}</b> {a.clientName}
                  </div>
                ))}

                {ags.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{ags.length - 2} mais
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
