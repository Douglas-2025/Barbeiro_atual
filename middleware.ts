import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware para proteger rotas administrativas
// Por que: Verifica autenticação antes de permitir acesso ao painel do barbeiro
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas que requerem autenticação
  // Por que: Lista de rotas protegidas que só barbeiros autenticados podem acessar
  const protectedRoutes = ['/painelBarber', '/financeiro']
  
  // Verifica se rota atual precisa de autenticação
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Em produção, verificar cookie/token aqui
    // Por que: Middleware roda no servidor, não tem acesso ao localStorage
    // Por enquanto, redireciona para login e frontend verifica novamente
    
    // Verifica se tem cookie de autenticação (será verificado no cliente também)
    const authCookie = request.cookies.get('barbearia_auth')
    
    if (!authCookie) {
      // Redireciona para login se não autenticado
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

// Configura quais rotas o middleware deve executar
export const config = {
  matcher: [
    '/painelBarber/:path*',
    '/financeiro/:path*',
  ],
}

