'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, AuthUser } from '@/firebase/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  ShoppingCart,
  Factory,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
  Package,
  Bell
} from 'lucide-react';

interface AdminSidebarProps {
  user: AuthUser;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
  { name: 'Taller', href: '/admin/taller', icon: Factory },
  { name: 'Ventas', href: '/admin/ventas', icon: BarChart3 },
  { name: 'Personal', href: '/admin/staff', icon: Users },
];

const secondaryNavigation = [
  { name: 'Inventario', href: '/admin/inventario', icon: Package },
  { name: 'Configuración', href: '/admin/config', icon: Settings },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
            : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5', isActive && 'text-primary-foreground')} />
        {item.name}
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-4">
          <Link href="/admin" className="font-headline text-xl font-bold">
            Bordados <span className="text-primary">Pando</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-card/50 backdrop-blur-xl border-r border-white/5',
          'transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6">
            <Link href="/admin" className="font-headline text-2xl font-bold">
              Bordados <span className="text-primary">Pando</span>
            </Link>
            <p className="text-xs text-muted-foreground mt-1">ERP Industrial</p>
          </div>

          <Separator className="mx-4 w-auto bg-white/5" />

          {/* User info */}
          <div className="p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Main navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Principal
            </p>
            {navigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}

            <p className="px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mt-6 mb-2">
              Sistema
            </p>
            {secondaryNavigation.map((item) => (
              <NavLink key={item.name} item={item} />
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-4">
              v1.0.0 • Firebase Emulators
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
}
