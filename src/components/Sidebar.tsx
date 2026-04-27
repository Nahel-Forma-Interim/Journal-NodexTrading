"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Calculator,
  ClipboardList,
  StickyNote,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Menu,
  X,
  Settings,
  CalendarDays,
  Download,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "PRINCIPAL", items: [] },
  { href: "/dashboard", label: "Aperçu", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/calendar", label: "Calendrier", icon: CalendarDays },
  { href: "/calculator", label: "Calculatrice Spot", icon: Calculator },
  { label: "ANALYSE", items: [] },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/simulator", label: "Simulateur", icon: LineChart },
  { href: "/neldia", label: "Nodex IA", icon: Bot },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/plans", label: "Plans", icon: ClipboardList },
  { label: "OUTILS", items: [] },
  { href: "/import-backtest", label: "Importer trades", icon: Download },
  { label: "COMPTE", items: [] },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile menu on nav
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Mobile hamburger
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 glass-btn p-2.5 rounded-2xl"
        >
          <Menu size={22} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 h-screen w-72 z-50 flex flex-col"
                style={{
                  background: "rgba(6, 6, 18, 0.95)",
                  backdropFilter: "blur(24px) saturate(150%)",
                  borderRight: "1px solid rgba(111, 168, 255, 0.15)",
                }}
              >
                <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <img src="/logo-nodex.png" alt="Nodex Trading" className="w-10 h-10 nodex-squircle" style={{ boxShadow: "0 0 14px rgba(111, 168, 255, 0.3)" }} />
                  <span className="text-lg font-bold text-gradient-accent">
                    Nodex
                  </span>
                  <span className="text-xs font-mono text-muted ml-1">V6.1</span>
                  <button onClick={() => setMobileOpen(false)} className="ml-auto glass-btn p-2 rounded-xl">
                    <X size={18} />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3">
                  {renderNav(navItems, pathname)}
                </nav>
                {renderUser()}
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40"
      style={{
        background: "rgba(6, 6, 18, 0.85)",
        backdropFilter: "blur(24px) saturate(150%)",
        borderRight: "1px solid rgba(111, 168, 255, 0.10)",
      }}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <img src="/logo-nodex.png" alt="Nodex Trading" className="w-10 h-10 nodex-squircle" style={{ boxShadow: "0 0 14px rgba(111, 168, 255, 0.3)" }} />
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-baseline gap-1.5 whitespace-nowrap"
            >
              <span className="text-lg font-bold text-gradient-accent">Nodex</span>
              <span className="text-xs font-mono text-muted">V6.1</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto glass-btn p-1.5 rounded-xl"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

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
                    className="text-[10px] font-semibold tracking-widest text-text-muted/60 mt-6 mb-2 px-3 uppercase"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-1 transition-all duration-200 group relative
                ${isActive
                  ? "glass-btn-primary"
                  : "text-text-muted hover:text-foreground"
                }`}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(111, 168, 255, 0.08)";
                  e.currentTarget.style.borderLeft = "2px solid rgba(111, 168, 255, 0.4)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderLeft = "2px solid transparent";
                }
              }}
              style={{ borderLeft: "2px solid transparent" }}
            >
              <Icon size={19} style={isActive ? { color: "#000" } : undefined} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-[13px] font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {renderUser(collapsed)}
    </motion.aside>
  );
}

function renderNav(items: typeof navItems, pathname: string) {
  return items.map((item, i) => {
    if ("items" in item && !item.href) {
      return (
        <p key={i} className="text-[10px] font-semibold tracking-widest text-text-muted/60 mt-6 mb-2 px-3 uppercase">
          {item.label}
        </p>
      );
    }

    const Icon = item.icon!;
    const isActive = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href!}
        className={`flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 transition-all duration-200
          ${isActive ? "glass-btn-primary" : "text-text-muted active:bg-white/5"}`}
      >
        <Icon size={20} style={isActive ? { color: "#000" } : undefined} />
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  });
}

function renderUser(collapsed?: boolean) {
  return (
    <div className="border-t p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 nodex-squircle flex items-center justify-center font-bold text-sm shadow-lg"
          style={{
            background: "var(--accent)",
            color: "#000",
            boxShadow: "0 0 14px rgba(111, 168, 255, 0.4)",
          }}
        >
          N
        </div>
        {collapsed !== true && (
          <div>
            <p className="text-sm font-medium">Nahel</p>
            <p className="text-xs text-text-muted">Trader Spot · V6.1</p>
          </div>
        )}
      </div>
    </div>
  );
}
