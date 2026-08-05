import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  Target,
  Bell,
  CreditCard,
  PieChart,
  ArrowRight,
} from "lucide-react";

const FeaturesPreview = () => {
  const features = [
    {
      icon: PieChart,
      title: "Expense Categorization",
      description: "Automatically categorize your spending with AI precision",
      color: "text-primary",
    },
    {
      icon: Brain,
      title: "ML-Based Forecasting",
      description: "Predict future expenses with machine learning algorithms",
      color: "text-accent",
    },
    {
      icon: TrendingUp,
      title: "Budget Tracking",
      description: "Real-time dashboard to monitor your financial health",
      color: "text-success",
    },
    {
      icon: Target,
      title: "Savings Goals",
      description: "Set and achieve your financial goals with smart tracking",
      color: "text-warning",
    },
    {
      icon: CreditCard,
      title: "Investment Insights",
      description: "Get personalized suggestions to grow your money through smart investments",
      color: "text-info",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get alerts for bills, budget limits, and opportunities",
      color: "text-secondary",
    },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Smart Finance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to take control of your money, backed by
            cutting-edge AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-2 border border-border animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-muted mb-4 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/features">
            <Button variant="hero" size="lg" className="group">
              Explore All Features
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;
