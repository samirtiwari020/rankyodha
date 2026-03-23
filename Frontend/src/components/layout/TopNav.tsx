import { Moon, Sun, Bell, BookOpen, Calculator, LogOut, User, KeyRound } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { CurrentCourseIndicator } from "@/components/CurrentCourseIndicator";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { apiRequest, clearAuthSession } from "@/lib/api";
import { useCourse } from "@/contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const [dueRevisions, setDueRevisions] = useState<any[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const authUser = JSON.parse(localStorage.getItem("auth_user") || "{}");
  const userName = authUser?.name || "Samir";
  const userEmail = authUser?.email || "samir@example.com";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    clearAuthSession();
    navigate("/auth");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      setIsChangingPassword(true);
      await apiRequest("/api/v1/user/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword })
      }, true);
      toast.success("Password changed successfully!");
      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  useEffect(() => {
    const fetchDue = async () => {
      try {
        const data = await apiRequest<any[]>(`/api/v1/revision?course=${selectedCourse}`, { method: "GET" }, true);
        const due = data.filter(r => new Date(r.nextRevisionAt) <= new Date());
        setDueRevisions(due);
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    };
    fetchDue();
  }, [selectedCourse]);

  return (
    <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-2xl flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        
        {/* Course Indicator */}
        <div className="hidden md:block flex-1 max-w-xs">
          <CurrentCourseIndicator />
        </div>
      </div>

      <div className="flex items-center gap-1.5">

        {/* Notification Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl transition-all duration-200 hover:bg-muted/60 relative"
            >
              <Bell className="h-4 w-4" />
              {(dueRevisions.length > 0) && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 glass-card border-border/50">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            
            {/* Mock Test Reminder */}
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Calculator className="h-4 w-4" />
                <span>Upcoming Mock Test</span>
              </div>
              <p className="text-xs text-muted-foreground ml-6">Full Syllabus Mock Test scheduled for Sunday, 10:00 AM.</p>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/50" />
            
            {/* Revision Due Reminders */}
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Due Revisions</DropdownMenuLabel>
            {dueRevisions.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">You are all caught up!</div>
            ) : (
              dueRevisions.slice(0, 3).map((rev) => (
                <DropdownMenuItem key={rev._id} onClick={() => navigate("/revision")} className="flex items-start gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <BookOpen className="h-4 w-4 text-orange-400 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{rev.topic}</span>
                    <span className="text-xs text-muted-foreground">Due for review</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            {dueRevisions.length > 3 && (
              <div className="p-2 text-center text-xs text-primary font-medium hover:underline cursor-pointer" onClick={() => navigate("/revision")}>
                +{dueRevisions.length - 3} more topics due
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold ml-0.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-105 cursor-pointer">
              {userInitial}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card border-border/50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)} className="cursor-pointer">
              <KeyRound className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and a new one to update your security credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleChangePassword}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="current" className="text-right text-xs">Current</Label>
                  <Input 
                    id="current" 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="new" className="text-right text-xs">New</Label>
                  <Input 
                    id="new" 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}
