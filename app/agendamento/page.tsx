"use client"

import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Scissors, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarVisual } from "@/components/ui/calendar-visual"
import { createAgendamento } from "@/lib/agendamentos"
import { cn } from "@/lib/utils"

// Página de agendamento de horários
// Por que: Interface principal onde clientes agendam seus horários na barbearia
export default function AgendamentoPage() {
  const router = useRouter()
  
  // Estados do formulário - controlam valores dos inputs
  // Por que: React precisa de estado para controlar componentes controlados
  const [date, setDate] = useState<string | null>(null) // Mudado para null para melhor controle
  const [service, setService] = useState("")
  const [time, setTime] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientWhatsApp, setClientWhatsApp] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false) // Controla exibição do calendário

  // Handler para submit do formulário
  // Por que: Processa dados do agendamento e envia para API (ou exibe feedback)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validação básica - garante que todos os campos obrigatórios estão preenchidos
    // Por que: Previne envio de dados incompletos
    if (!date || !service || !time || !clientName || !clientPhone) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    setIsSubmitting(true)

    try {
      // Cria agendamento e salva no localStorage
      // Por que: Persiste dados localmente e envia para painelBarber
      const dateTime = `${date}T${time}:00` // Combina data e hora em formato ISO
      
      const novoAgendamento = createAgendamento({
        date,
        time,
        dateTime,
        clientName,
        clientPhone,
        clientWhatsApp: clientWhatsApp || clientPhone, // Usa WhatsApp se informado, senão usa telefone
        service,
      })

      // Simula delay de requisição para melhor UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Feedback de sucesso
      alert(`Agendamento confirmado!\n\nCliente: ${clientName}\nServiço: ${service}\nData: ${date} às ${time}\nValor: R$ ${novoAgendamento.price.toFixed(2)}`)
      
      // Limpa formulário após sucesso
      // Por que: Melhora UX permitindo novo agendamento rapidamente
      setDate(null)
      setService("")
      setTime("")
      setClientName("")
      setClientPhone("")
      setClientWhatsApp("")
      setShowCalendar(false)
      
      // Opcional: Redireciona para painelBarber após agendamento
      // Descomente a linha abaixo se quiser redirecionar automaticamente
      // router.push('/painelBarber')
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      alert("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formata data para exibição no input
  // Por que: Mostra data formatada de forma legível no input readOnly
  const formatarDataParaInput = (dateStr: string | null): string => {
    if (!dateStr) return ""
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Handler para seleção de data no calendário
  // Por que: Atualiza estado e fecha calendário após seleção
  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate)
    setShowCalendar(false) // Fecha calendário após seleção
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
      
      {/* TÍTULO DA PÁGINA */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Agendamento de Horário
        </h1>
        <p className="text-muted-foreground text-lg">Preencha os dados abaixo para agendar seu horário</p>
      </div>

      {/* FORMULÁRIO DE AGENDAMENTO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GRID PRINCIPAL - Data, Serviço e Horário */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* SELEÇÃO DE DATA */}
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Input readOnly que exibe data formatada */}
              {/* Por que: Mantém estilo consistente com outros inputs e funciona perfeitamente no iOS */}
              <Input
                readOnly
                value={formatarDataParaInput(date)}
                placeholder="Clique no calendário para selecionar"
                onClick={() => setShowCalendar(!showCalendar)}
                className="cursor-pointer bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
                required
              />
              
              {/* Calendário visual - aparece quando showCalendar é true */}
              {/* Por que: Calendário customizado funciona igual em todos os dispositivos, incluindo iOS */}
              {showCalendar && (
                <div className="mt-3 border-t border-border pt-3">
                  <CalendarVisual
                    agendamentos={[]} // Pode passar agendamentos existentes aqui se quiser mostrar conflitos
                    selectedDate={date ?? undefined}
                    onDateSelect={handleDateSelect}
                  />
                </div>
              )}
              
              {/* Botão para abrir calendário se estiver fechado */}
              {!showCalendar && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCalendar(true)}
                  className="w-full border-border hover:bg-accent"
                  asChild={false}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {date ? 'Alterar Data' : 'Selecionar Data'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* SELEÇÃO DE SERVIÇO */}
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                <Scissors className="w-5 h-5 text-primary" />
                Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={service} onValueChange={setService} required>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Escolha um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="corte" className="hover:bg-accent">
                    ✂️ Corte - R$ 30
                  </SelectItem>
                  <SelectItem value="barba" className="hover:bg-accent">
                    🪒 Barba - R$ 20
                  </SelectItem>
                  <SelectItem value="combo" className="hover:bg-accent">
                    💇 Corte + Barba - R$ 45
                  </SelectItem>
                </SelectContent>
              </Select>
              {service && (
                <p className="text-xs text-muted-foreground mt-2">
                  💰 Valor: R$ {service === 'corte' ? '30' : service === 'barba' ? '20' : '45'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* SELEÇÃO DE HORÁRIO */}
          <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                <Clock className="w-5 h-5 text-primary" />
                Horário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  "09:00",
                  "09:45",
                  "10:30",
                  "11:15",
                  "12:00",
                  "12:45",
                  "13:30",
                  "14:15",
                  "15:00",
                  "15:45",
                  "16:30",
                  "17:15",
                  "18:00",
                  "18:45",
                  "19:30",
                  "20:15",
                  "21:00",
                ].map((h) => (
                  <Button
                    key={h}
                    type="button"
                    variant={time === h ? "default" : "outline"}
                    onClick={() => setTime(h)}
                    className={cn(
                      "text-xs transition-all",
                      time === h && "bg-primary text-primary-foreground shadow-lg scale-105",
                      time !== h && "hover:bg-accent hover:border-primary/50"
                    )}
                    asChild={false}
                  >
                    {h}
                  </Button>
                ))}
              </div>
              {time && (
                <div className="mt-3 p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário selecionado: {time}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DADOS DO CLIENTE */}
        <Card className="border-border bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              <User className="w-5 h-5 text-primary" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-foreground font-medium">
                Nome completo *
              </Label>
              <Input
                id="clientName"
                placeholder="Ex: João Silva"
                value={clientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
                required
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone" className="text-foreground font-medium">
                Telefone para contato *
              </Label>
              <Input
                id="clientPhone"
                type="tel"
                placeholder="(99) 99999-9999"
                value={clientPhone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientPhone(e.target.value)}
                required
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientWhatsApp" className="text-foreground font-medium">
                WhatsApp (opcional)
              </Label>
              <Input
                id="clientWhatsApp"
                type="tel"
                placeholder="(99) 99999-9999"
                value={clientWhatsApp}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientWhatsApp(e.target.value)}
                className="bg-input border-border text-foreground focus:ring-2 focus:ring-primary"
              />
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
  <p className="flex items-center gap-2 text-sm text-blue-600">
    <span className="text-base">📱</span>
    Informe seu WhatsApp para receber confirmações e lembretes automáticos.
  </p>
</div>

            </div>
          </CardContent>
        </Card>

        {/* BOTÃO DE CONFIRMAÇÃO */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              // Limpa formulário
              setDate(null)
              setService("")
              setTime("")
              setClientName("")
              setClientPhone("")
              setClientWhatsApp("")
              setShowCalendar(false)
            }}
            className="border-border hover:bg-accent"
            asChild={false}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!date || !service || !time || !clientName || !clientPhone || isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            asChild={false}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Confirmar Agendamento
              </span>
            )}
          </Button>
        </div>
      </form>
      </div>
    </div>
  )
}
