// Biblioteca de autenticação simples para barbeiro
// Por que: Sistema simples de login com usuário/senha padrão para proteger painel administrativo

// Credenciais padrão do barbeiro
// Por que: Credenciais fixas para acesso ao painel (em produção, usar banco de dados)
const DEFAULT_USERNAME = 'barbeiro'
const DEFAULT_PASSWORD = 'barbeiro123'

// Chave do localStorage para sessão
// Por que: Armazena estado de autenticação no navegador
const AUTH_KEY = 'barbearia_auth_session'

// Interface de sessão
export interface AuthSession {
  isAuthenticated: boolean
  username: string
  loginTime: number
}

// Faz login com usuário e senha
// Por que: Valida credenciais e cria sessão de autenticação
export function login(username: string, password: string): boolean {
  // Valida credenciais
  // Por que: Verifica se usuário e senha estão corretos
  if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
    // Cria sessão de autenticação
    const session: AuthSession = {
      isAuthenticated: true,
      username,
      loginTime: Date.now(),
    }
    
    // Salva sessão no localStorage
    // Por que: Persiste autenticação mesmo após recarregar página
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session))
      
      // Também cria cookie para middleware do Next.js
      // Por que: Middleware roda no servidor e não tem acesso ao localStorage
      document.cookie = `barbearia_auth=true; path=/; max-age=${24 * 60 * 60}` // 24 horas
    }
    
    return true
  }
  
  return false
}

// Faz logout
// Por que: Remove sessão e desautentica usuário
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_KEY)
    // Remove cookie também
    document.cookie = 'barbearia_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

// Verifica se usuário está autenticado
// Por que: Usado para proteger rotas e verificar acesso
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) return false
    
    const session: AuthSession = JSON.parse(stored)
    
    // Verifica se sessão é válida (não expirou após 24 horas)
    // Por que: Segurança - força novo login após período de inatividade
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
    const isExpired = Date.now() - session.loginTime > TWENTY_FOUR_HOURS
    
    if (isExpired) {
      logout()
      return false
    }
    
    return session.isAuthenticated === true
  } catch {
    return false
  }
}

// Obtém sessão atual
// Por que: Permite acessar dados do usuário logado
export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(AUTH_KEY)
    if (!stored) return null
    
    return JSON.parse(stored) as AuthSession
  } catch {
    return null
  }
}

