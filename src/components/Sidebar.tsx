"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Calculator,
  ClipboardList,
  StickyNote,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  LineChart,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "PRINCIPAL", items: [] },
  { href: "/dashboard", label: "Aperçu", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/calculator", label: "Calculatrice Spot", icon: Calculator },
  { label: "ANALYSE", items: [] },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/simulator", label: "Simulateur", icon: LineChart },
  { href: "/neldia", label: "Nahel IA", icon: Bot },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/plans", label: "Plans", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-40"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <img src="/logo.png" alt="Nahel Trading" className="w-10 h-10 rounded-lg" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent whitespace-nowrap"
            >
              Nahel Trading
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg hover:bg-surface-light transition-colors text-text-muted"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navItems.map((item, i) => {
          if ("items" in item && !item.href) {
            return (
              <AnimatePresence key={i}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-semibold tracking-wider text-text-muted mt-6 mb-2 px-3 uppercase"
                  >
                    {item.label}
                  </motion.p>
                )}
              </AnimatePresence>
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group relative
                ${isActive
                  ? "bg-primary/15 text-primary"
                  : "text-text-muted hover:bg-surface-light hover:text-foreground"
                }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon size={20} className={isActive ? "text-primary" : "group-hover:text-primary-light"} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-medium">Nahel</p>
                <p className="text-xs text-text-muted">Trader Spot</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
