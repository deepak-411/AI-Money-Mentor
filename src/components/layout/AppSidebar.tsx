'use client'

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { DollarSign, LayoutDashboard, HeartPulse, Goal, Receipt, FileSearch, Settings, HelpCircle } from "lucide-react"
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/health-score", label: "Money Health Score", icon: HeartPulse },
  { href: "/dashboard/fire-planner", label: "FIRE Path Planner", icon: Goal },
  { href: "/dashboard/tax-optimizer", label: "Tax Optimizer", icon: Receipt },
  { href: "/dashboard/mf-xray", label: "MF Portfolio X-Ray", icon: FileSearch },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <DollarSign className="h-6 w-6" />
            </div>
            <h1 className="font-headline text-xl font-semibold text-primary">
                AI Money Mentor
            </h1>
        </Link>
      </SidebarHeader>
      
      <SidebarMenu className="flex-1 p-4">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={{ children: item.label }}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarFooter className="p-4 border-t">
         <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Settings" }}>
                <Link href="#">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={{ children: "Help" }}>
                <Link href="#">
                  <HelpCircle />
                  <span>Help</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
