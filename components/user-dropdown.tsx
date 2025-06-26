"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { User, LogOut, Shield, Heart } from "lucide-react";
import { useHydration } from "@/hooks/use-hydration";

export function UserDropdown() {
  // Hydration kontrolü
  const isHydrated = useHydration();

  // SSR sırasında çalışmayacak şekilde güvenli hale getir
  const sessionQuery = isHydrated
    ? authClient.useSession()
    : { data: null, isPending: true };
  const { data: session } = sessionQuery;

  if (!session?.user) return null;

  const user = session.user as any;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1 rounded-full"
        >
          <Avatar className="h-10 w-10 p-0.5 border border-amber">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Profil Ayarları
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/contact" className="flex items-center gap-2">
            <Heart className="w-4 h-4" /> Destek
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => authClient.signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Çıkış Yap
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
