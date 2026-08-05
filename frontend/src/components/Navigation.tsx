import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🔥 TRUE login check — always correct
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 Re-check login state whenever route changes (fixes navbar not updating)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(Boolean(token));
  }, [location.pathname]);

  // 🔥 Re-check login state every time storage changes (other tabs)
  useEffect(() => {
    const syncLogin = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("access_token")));
    };
    window.addEventListener("storage", syncLogin);
    return () => window.removeEventListener("storage", syncLogin);
  }, []);

  // 🔥 Scroll animation
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  // 🔥 logout logic that forces navbar rerender
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-card/80 backdrop-blur-lg shadow-medium" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div>
              <img src="/NoBg.png" alt="logo" className="w-10 h-10" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FinTrack AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? "default" : "ghost"}
                  size="sm"
                  className="font-medium"
                >
                  {link.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* 🔥 Desktop CTA / Logout */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Button variant="destructive" size="lg" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="lg">
                  Get Started
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive(link.path) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {link.name}
                  </Button>
                </Link>
              ))}

              {isLoggedIn ? (
                <>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" className="w-full">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;