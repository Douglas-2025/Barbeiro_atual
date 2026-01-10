# 📱 Guia de Configuração WhatsApp

Este guia explica como configurar o envio automático de mensagens WhatsApp no sistema.

## 🎯 Funcionalidades Implementadas

✅ **Salvar WhatsApp do cliente** - Campo no formulário de agendamento  
✅ **Envio automático ao confirmar** - Mensagem enviada quando barbeiro confirma  
✅ **Envio automático ao remarcar** - Mensagem enviada quando data/hora muda  
✅ **Envio automático ao cancelar** - Mensagem enviada quando agendamento é cancelado  
✅ **Templates de mensagens** - Mensagens profissionais e padronizadas  

---

## 🔧 Opções de Integração WhatsApp

### Opção 1: Evolution API (Recomendado para Brasil) ⭐

**Por que:** Solução brasileira popular, fácil de usar, suporta WhatsApp Business.

#### Passo a Passo:

1. **Instalar Evolution API:**
```bash
# Via Docker (mais fácil)
docker run --name evolution-api -d \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-secreta-aqui \
  atendai/evolution-api:latest
```

2. **Conectar WhatsApp:**
   - Acesse: `http://localhost:8080`
   - Escaneie QR Code com seu WhatsApp
   - Aguarde conexão

3. **Configurar no .env:**
```env
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=sua-chave-secreta-aqui
```

**Documentação:** https://doc.evolution-api.com/

---

### Opção 2: Twilio WhatsApp API

**Por que:** Solução internacional confiável, mas requer aprovação do WhatsApp.

#### Passo a Passo:

1. **Criar conta Twilio:**
   - Acesse: https://www.twilio.com
   - Crie conta gratuita
   - Ative WhatsApp Sandbox (gratuito para testes)

2. **Configurar no .env:**
```env
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

3. **Atualizar lib/whatsapp.ts:**
   - Substituir Evolution API por Twilio SDK
   - Instalar: `npm install twilio`

**Documentação:** https://www.twilio.com/docs/whatsapp

---

### Opção 3: WhatsApp Business API (Oficial)

**Por que:** Solução oficial do Meta, mas requer processo de aprovação.

#### Passo a Passo:

1. **Criar conta Meta Business:**
   - Acesse: https://business.facebook.com
   - Configure WhatsApp Business Account
   - Aguarde aprovação (pode levar dias)

2. **Configurar Webhook:**
   - Configure webhook para receber mensagens
   - Use Graph API para enviar mensagens

**Documentação:** https://developers.facebook.com/docs/whatsapp

---

## 🚀 Configuração Rápida (Evolution API)

### 1. Adicionar variáveis no .env

```env
# WhatsApp Configuration
WHATSAPP_API_URL=http://localhost:8080
WHATSAPP_API_KEY=sua-chave-secreta-aqui

# Ou se usar serviço na nuvem:
# WHATSAPP_API_URL=https://sua-evolution-api.com
# WHATSAPP_API_KEY=sua-api-key
```

### 2. Executar migração do Prisma

```bash
# Adiciona campo whatsappEnviado no banco
npx prisma migrate dev --name add_whatsapp_fields
```

### 3. Testar envio manual

```bash
# Via API
curl -X POST http://localhost:3000/api/whatsapp/enviar \
  -H "Content-Type: application/json" \
  -d '{
    "agendamentoId": "id-do-agendamento",
    "tipo": "confirmacao"
  }'
```

---

## 📝 Como Funciona

### Fluxo Automático:

```
1. Cliente agenda e informa WhatsApp
   ↓
2. Agendamento salvo no banco com clientWhatsApp
   ↓
3. Barbeiro confirma agendamento no painel
   ↓
4. API detecta mudança de status → "confirmado"
   ↓
5. Sistema chama /api/whatsapp/enviar automaticamente
   ↓
6. Mensagem formatada e enviada via Evolution API
   ↓
7. Flag whatsappEnviado = true no banco
   ↓
8. Cliente recebe mensagem no WhatsApp ✅
```

### Tipos de Mensagens:

- **confirmacao**: Quando barbeiro confirma agendamento
- **remarcacao**: Quando data/hora é alterada
- **cancelamento**: Quando agendamento é cancelado
- **lembrete**: (Futuro) Lembrete 15min antes

---

## 🎨 Personalizar Mensagens

Edite `lib/whatsapp.ts` para personalizar templates:

```typescript
case 'confirmacao':
  return `✅ *Agendamento Confirmado!*

Olá ${dados.clientName}! 

Seu agendamento foi *confirmado* com sucesso:
...`
```

**Dicas:**
- Use emojis para melhor visualização
- Mantenha mensagens curtas e objetivas
- Inclua sempre data, horário e serviço
- Adicione contato para dúvidas

---

## 🐛 Troubleshooting

### Erro: "WhatsApp API não configurada"

**Solução:** Configure `WHATSAPP_API_URL` e `WHATSAPP_API_KEY` no `.env`

### Erro: "WhatsApp do cliente não cadastrado"

**Solução:** Cliente precisa informar WhatsApp no formulário de agendamento

### Mensagem não chega

**Verifique:**
1. Evolution API está rodando?
2. WhatsApp está conectado? (QR Code escaneado?)
3. Número está no formato correto? (5511999999999)
4. Verifique logs: `docker logs evolution-api`

### Teste sem WhatsApp real

**Solução:** Sistema funciona em modo simulado se API não estiver configurada
- Mensagens são logadas no console
- Agendamento é salvo normalmente
- WhatsApp não é enviado (mas não quebra o sistema)

---

## 🔒 Segurança

- ✅ Credenciais em variáveis de ambiente (`.env`)
- ✅ Validação de número antes de enviar
- ✅ Rate limiting (evita spam)
- ✅ Logs de envio para auditoria

---

## 📊 Próximas Melhorias Sugeridas

1. **Lembrete automático 15min antes**
   - Usar cron job ou queue
   - Verificar agendamentos próximos
   - Enviar lembrete automaticamente

2. **Confirmação de leitura**
   - Webhook para receber status de entrega
   - Marcar mensagem como lida

3. **Histórico de mensagens**
   - Salvar todas as mensagens enviadas
   - Dashboard para visualizar histórico

4. **Mensagens personalizadas**
   - Barbeiro pode editar template
   - Variáveis dinâmicas (nome, data, etc)

5. **Multi-idioma**
   - Suporte a inglês/espanhol
   - Detectar idioma do cliente

---

## ✅ Checklist de Implementação

- [x] Campo WhatsApp no formulário
- [x] Campo WhatsApp no schema Prisma
- [x] Biblioteca de envio de mensagens
- [x] API route para enviar mensagens
- [x] Integração automática ao confirmar
- [x] Integração automática ao remarcar
- [x] Integração automática ao cancelar
- [x] Templates de mensagens
- [ ] Lembrete 15min antes (futuro)
- [ ] Dashboard de mensagens (futuro)

---

**Pronto! Seu sistema agora envia WhatsApp automaticamente! 🎉**

