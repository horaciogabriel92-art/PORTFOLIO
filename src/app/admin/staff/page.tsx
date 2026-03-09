"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Shield, Hammer, Briefcase } from "lucide-react";

export default function StaffPage() {
  const staff = [
    { name: "Admin Pando", role: "Administrador", email: "info@bordadospando.com", status: "Online", icon: Shield, color: "text-primary" },
    { name: "Juan Pérez", role: "Operario M1", email: "juan@pando.com", status: "En Máquina", icon: Hammer, color: "text-secondary" },
    { name: "María García", role: "Vendedora", email: "maria@pando.com", status: "Online", icon: Briefcase, color: "text-accent" },
    { name: "Carlos Ruiz", role: "Operario M3", email: "carlos@pando.com", status: "Offline", icon: Hammer, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="font-headline text-3xl font-bold mb-2">Gestión de Personal</h1>
        <p className="text-muted-foreground">Administración de roles y estados del equipo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {staff.map((person) => (
          <Card key={person.email} className="glass-card border-none hover:shadow-2xl transition-all group">
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {person.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-1">{person.name}</h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <person.icon size={14} className={person.color} />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{person.role}</span>
              </div>
              <Badge variant={person.status === "Offline" ? "outline" : "secondary"} className={person.status === "Online" ? "bg-accent/20 text-accent border-none" : ""}>
                {person.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
