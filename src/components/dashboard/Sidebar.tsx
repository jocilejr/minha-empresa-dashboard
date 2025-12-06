import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  ListOrdered, 
  RefreshCcw, 
  Truck, 
  Columns, 
  Bot, 
  FileText, 
  Settings,
  ChevronLeft,
  LogOut
} from "lucide-react";
import logo from "@/assets/logo-ov.png";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", badge: null },
  { icon: ListOrdered, label: "Transações", path: "/transactions", badge: 2 },
  { icon: RefreshCcw, label: "Recuperação", path: "/recovery", badge: null },
  { icon: Truck, label: "Entrega", path: "/delivery", badge: null },
  { icon: Columns, label: "Quadros", path: "/boards", badge: null },
  { icon: Bot, label: "Typebots", path: "/typebots", badge: null },
  { icon: FileText, label: "Gerar Boleto", path: "/boleto", badge: null },
  { icon: Settings, label: "Configurações", path: "/settings", badge: null, adminOnly: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className={cn(
      "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <img src={logo} alt="Origem Viva" className="w-10 h-10 rounded-lg object-contain" />
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-foreground font-semibold text-sm">Origem Viva</h1>
            <span className="text-xs text-muted-foreground">MARKETING</span>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-3">
        {!collapsed && (
          <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Menu
          </span>
        )}
        <ul className="mt-3 space-y-1">
          {filteredMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in">
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "sidebar-item w-full",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="bg-warning text-warning-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-item w-full"
        >
          <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && <span>Recolher</span>}
        </button>
        <button 
          onClick={handleLogout}
          className="sidebar-item w-full text-destructive hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
