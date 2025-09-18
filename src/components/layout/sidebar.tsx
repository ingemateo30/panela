'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  Package,
  Users,
  Factory,
  BoxIcon,
  FileText,
  Settings,
  LogOut,
  Home,
  QrCode
} from 'lucide-react'
type User = {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  role?: string | null | undefined; // Add the role property here
};
const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Lotes de Panela',
    href: '/lotes',
    icon: Package,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Proveedores',
    href: '/proveedores',
    icon: Users,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Insumos',
    href: '/insumos',
    icon: BoxIcon,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Producción',
    href: '/produccion',
    icon: Factory,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Trazabilidad',
    href: '/trazabilidad',
    icon: QrCode,
    roles: ['ADMIN', 'OPERARIO']
  },
  {
    name: 'Reportes',
    href: '/reportes',
    icon: FileText,
    roles: ['ADMIN']
  },
  {
    name: 'Analíticas',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ADMIN']
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    roles: ['ADMIN']
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  role?: string;
}

const userRole = (session?.user as User)?.role;

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(userRole as string)
  )

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="flex h-full w-64 flex-col bg-panela-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-panela-700">
        <div className="flex items-center space-x-2">
          <Package className="h-8 w-8 text-panela-200" />
          <span className="text-xl font-bold text-white">Panela System</span>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-panela-700 text-white'
                  : 'text-panela-200 hover:bg-panela-700 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Usuario y cerrar sesión */}
      <div className="border-t border-panela-700 p-4">
        <div className="mb-3 text-sm text-panela-200">
          <div className="font-medium text-white">{session?.user?.name}</div>
          <div className="text-xs">{session?.user?.email}</div>
          <div className="text-xs text-panela-300">
            {userRole === 'ADMIN' ? 'Administrador' : 'Operario'}
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-panela-200 hover:bg-panela-700 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}