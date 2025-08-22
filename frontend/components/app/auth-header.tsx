"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  User, 
  LogOut, 
  Settings, 
  Shield, 
  Bot,
  Zap
} from "lucide-react"
import { useAuth } from "@/lib/auth"

export function AuthHeader() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  if (!isAuthenticated || !user) {
    return null
  }

  const initials = user.name 
    ? user.name.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase()

  return (
    <div className="flex items-center space-x-4">
      {/* Status Badge */}
      <Badge 
        variant="outline" 
        className="bg-green-50 text-green-700 border-green-200 flex items-center space-x-1"
      >
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>En ligne</span>
      </Badge>

      {/* Admin Badge */}
      {isAdmin && (
        <Badge className="bg-purple-100 text-purple-700 border-purple-200 flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>Admin</span>
        </Badge>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border-2 border-blue-200">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium">{user.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          
          {isAdmin && (
            <DropdownMenuItem className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span>Administration</span>
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}