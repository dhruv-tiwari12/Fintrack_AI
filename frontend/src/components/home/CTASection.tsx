import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkle, ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full gradient-primary opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 animate-slide-up">
            <img src="/NoBg.png" alt="logo" className="w-4 h-4" />
            <span className="text-sm font-medium">Start Your Journey Today</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-slide-up">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Financial Future?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            Join thousands of users who are already making smarter financial
            decisions with FinTrack AI. Get started in minutes, no credit card
            required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl">
                Contact Sales
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by finance professionals worldwide
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-xl font-semibold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-briefcase-business"
                >
                  <path d="M12 12h.01" />
                  <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <path d="M22 13a18.15 18.15 0 0 1-20 0" />
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                </svg>
                Professionals
              </div>

              <div className="text-xl font-semibold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-notebook-pen"
                >
                  <path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" />
                  <path d="M2 6h4" />
                  <path d="M2 10h4" />
                  <path d="M2 14h4" />
                  <path d="M2 18h4" />
                  <path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                </svg>
                Students
              </div>

              <div className="text-xl font-semibold flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-house"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Families
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
