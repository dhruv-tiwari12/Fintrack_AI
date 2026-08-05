import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api";

const HeroSection = () => {
  const [summary, setSummary] = useState<any>(null);
  const [insight, setInsight] = useState<string>("");
  const [budgetLeft, setBudgetLeft] = useState<number | null>(null);
  const [budgetPercent, setBudgetPercent] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("access_token");

      // If user is not logged in → keep static preview
      if (!token) return;

      try {
        // Dashboard summary (CORRECT ENDPOINT)
        const s = await api.get("/categories/summary");
        setSummary(s.data);

        // AI insight (CORRECT ENDPOINT)
        const ai = await api.get("/categories/insights");
        setInsight(ai.data.message);

        // Budgets (TRAILING SLASH REQUIRED)
        const b = await api.get("/budgets/");
        if (Array.isArray(b.data)) {
          const total = b.data.reduce((sum, x) => sum + x.limit_amount, 0);
          const spent = b.data.reduce((sum, x) => sum + x.spent_amount, 0);
          const left = total - spent;

          setBudgetLeft(left);
          setBudgetPercent(total ? (left / total) * 100 : 0);
        }
      } catch (err) {
        console.log("Dashboard preview failed → using static.", err);
      }
    };

    loadData();
  }, []);

  // Fallback values (static preview)
  const fallback = {
    balance: "₹1,24,580",
    income: "+₹85,000",
    expenses: "-₹42,500",
    thisMonth: "₹32,450",
    budgetLeft: "₹18,560",
    budgetPercent: "62%",
    insight: "You're on track to save ₹5,200 extra this month! 🎉",
  };

  const dynamic = {
    balance:
      summary?.total_balance != null
        ? `₹${summary.total_balance.toLocaleString()}`
        : fallback.balance,

    income:
      summary?.income_this_month != null
        ? `+₹${summary.income_this_month.toLocaleString()}`
        : fallback.income,

    expenses:
      summary?.expenses_this_month != null
        ? `-₹${summary.expenses_this_month.toLocaleString()}`
        : fallback.expenses,

    thisMonth:
      summary?.income_this_month != null
        ? `₹${summary.income_this_month.toLocaleString()}`
        : fallback.thisMonth,

    budgetLeft:
      budgetLeft != null
        ? `₹${budgetLeft.toLocaleString()}`
        : fallback.budgetLeft,

    budgetPercent:
      budgetPercent != null
        ? `${budgetPercent.toFixed(0)}%`
        : fallback.budgetPercent,

    insight: insight || fallback.insight,
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 shadow-soft">
              <img src="/NoBg.png" alt="logo" className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Finance Management</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Manage. Save.
              </span>
              <br />
              <span className="text-foreground">Predict.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Take control of your financial future with FinTrack AI. Track expenses,
              predict spending patterns, and achieve your savings goals with intelligent insights.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/auth">
                <Button variant="hero" size="xl" className="group">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="xl">
                  View Demo
                  <TrendingUp className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">₹10M+</div>
                <div className="text-sm text-muted-foreground">Money Saved</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dynamic Dashboard Preview */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-strong border border-border bg-card p-6">
              <div className="space-y-4">
                {/* Mini Dashboard Card */}
                <div className="gradient-primary rounded-xl p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-white/80 text-sm">Total Balance</p>
                      <p className="text-3xl font-bold mt-1">{dynamic.balance}</p>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-white/70">Income</p>
                      <p className="font-semibold">{dynamic.income}</p>
                    </div>
                    <div>
                      <p className="text-white/70">Expenses</p>
                      <p className="font-semibold">{dynamic.expenses}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-2xl font-bold text-foreground">{dynamic.thisMonth}</p>
                  </div>
                  <div className="bg-muted rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Budget Left</p>
                    <p className="text-2xl font-bold text-foreground">{dynamic.budgetLeft}</p>
                    <p className="text-xs text-warning">
                      {dynamic.budgetPercent} remaining
                    </p>
                  </div>
                </div>

                {/* AI Insight Badge */}
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                  <div className="bg-accent/20 p-2 rounded-lg">
                    <img src="/NoBg.png" alt="logo" className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">AI Insight</p>
                    <p className="text-xs text-muted-foreground">
                      {dynamic.insight}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/30 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/30 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;