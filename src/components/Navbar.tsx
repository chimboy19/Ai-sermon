import React from "react";
import type { User } from "firebase/auth";
import { BookOpen, PlusCircle, Library, LogOut, Menu, X } from "lucide-react";
import type { View } from "../App";
import { cn } from "../lib/utils";

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  setView: (view: View) => void;
  currentView: View;
}

export default function Navbar({
  user,
  onLogin,
  onLogout,
  setView,
  currentView,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BookOpen },
    { id: "generator", label: "New Sermon", icon: PlusCircle },
    { id: "library", label: "Library", icon: Library },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-stone-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setView(user ? "dashboard" : "landing")}
          >
            <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center mr-3">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight">
              AI Sermon
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {user &&
              navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as View)}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-olive-600",
                    currentView === item.id
                      ? "text-olive-600"
                      : "text-stone-600",
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              ))}

            {user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-stone-200">
                <span className="text-xs text-stone-500">{user.email}</span>
                <button
                  onClick={onLogout}
                  className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-olive-600 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-olive-700 transition-all shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-stone-600"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 py-4 space-y-4">
          {user &&
            navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id as View);
                  setIsMenuOpen(false);
                }}
                className={cn(
                  "flex items-center w-full text-left px-4 py-2 rounded-lg text-sm font-medium",
                  currentView === item.id
                    ? "bg-olive-50 text-olive-600"
                    : "text-stone-600",
                )}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          {!user && (
            <button
              onClick={() => {
                onLogin();
                setIsMenuOpen(false);
              }}
              className="w-full bg-olive-600 text-white px-6 py-3 rounded-xl text-sm font-medium"
            >
              Sign In
            </button>
          )}
          {user && (
            <button
              onClick={() => {
                onLogout();
                setIsMenuOpen(false);
              }}
              className="flex items-center w-full text-left px-4 py-2 text-stone-600 text-sm font-medium"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
