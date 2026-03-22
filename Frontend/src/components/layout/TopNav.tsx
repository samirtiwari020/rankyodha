import { Moon, Sun, Flame, Zap, Bell } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-2xl flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="hidden sm:block h-5 w-px bg-border/60" />
        <span className="hidden sm:block text-sm text-muted-foreground">
          Welcome, <strong className="text-foreground font-semibold">Samir</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Streak badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mr-0.5 transition-all duration-200 hover:bg-green-500/15 hover:scale-105 cursor-default group">
          <Flame className="h-3.5 w-3.5 text-green-500 group-hover:animate-bounce-gentle" />
          <span className="text-xs font-bold text-green-500">12</span>
        </div>

        {/* XP badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/20 mr-0.5 transition-all duration-200 hover:bg-lime-500/15 hover:scale-105 cursor-default group">
          <Zap className="h-3.5 w-3.5 text-lime-500 group-hover:animate-bounce-gentle" />
          <span className="text-xs font-bold text-lime-500">2,450</span>
        </div>

        {/* Notification */}
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl transition-all duration-200 hover:bg-muted/60 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl transition-all duration-200 hover:bg-muted/60"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
          )}
        </Button>

        {/* Avatar */}
        <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold ml-0.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer">
          S
        </div>
      </div>
    </header>
  );
}
