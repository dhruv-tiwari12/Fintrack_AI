import { Link } from "react-router-dom";
import { Sparkle, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Product: [
      { name: "Features", path: "/features" },
      { name: "Dashboard", path: "/dashboard" },
      { name: "Pricing", path: "/" },
    ],
    Company: [
      { name: "About Us", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Blog", path: "/" },
    ],
    Legal: [
      { name: "Privacy Policy", path: "/" },
      { name: "Terms of Service", path: "/" },
      { name: "Cookie Policy", path: "/" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "#", label: "Email" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <img src="/NoBg.png" alt="logo" className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FinTrack AI</span>
            </Link>
            <p className="text-secondary-foreground/80 mb-4 max-w-xs">
              Empowering your financial future with AI-driven insights and
              smart money management solutions.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-secondary-foreground/80 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary-foreground/60 text-sm">
              © {new Date().getFullYear()} FinTrack AI. All rights reserved.
            </p>
            <p className="text-secondary-foreground/60 text-sm">
              Made with ❤️ for smarter financial decisions
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
