import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useToast } from "@/hooks/use-toast";
import { getReports } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "#14b8a6",
  "#0ea5e9",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#22c55e",
  "#ef4444",
];

const ReportsView = () => {
  const [period, setPeriod] = useState("6");
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const res = await getReports(Number(period));
        setReport(res.data);
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load reports.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [period]);

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "PDF export feature coming soon!",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No report data available.</p>
      </Card>
    );
  }

  const {
    summary,
    monthly_overview,
    savings_trend,
    expense_distribution,
    best_performance,
    next_milestone,
  } = report;

  const stats = [
    {
      label: "Total Income",
      value: `₹${summary.total_income.toLocaleString()}`,
      change: "",
      trend: summary.total_income >= 0 ? "up" : "down",
    },
    {
      label: "Total Expenses",
      value: `₹${summary.total_expenses.toLocaleString()}`,
      change: "",
      trend: "down",
    },
    {
      label: "Total Savings",
      value: `₹${summary.total_savings.toLocaleString()}`,
      change: "",
      trend: summary.total_savings >= 0 ? "up" : "down",
    },
    {
      label: "Avg. Monthly Savings",
      value: `₹${Math.round(summary.average_monthly_savings).toLocaleString()}`,
      change: "",
      trend: "up",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Financial Reports</h2>
            <p className="text-muted-foreground">
              Comprehensive analysis of your finances
            </p>
          </div>

          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 Months</SelectItem>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="hero" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className="p-5 shadow-soft hover:shadow-medium transition-all duration-300"
          >
            <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
            <p className="text-2xl font-bold mb-2">{stat.value}</p>

            <div
              className={`flex items-center gap-1 text-sm ${
                stat.trend === "up" ? "text-success" : "text-destructive"
              }`}
            >
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Income / Expenses / Savings Bar Chart */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-xl font-semibold mb-6">Financial Overview</h3>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthly_overview}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip />
            <Legend />

            <Bar dataKey="income" name="Income" fill="hsl(var(--success))" />
            <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" />
            <Bar dataKey="savings" name="Savings" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Two Column */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Savings Trend */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-semibold mb-6">Savings Trend</h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={savings_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="savings"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Expense Pie Chart */}
        <Card className="p-6 shadow-soft">
          <h3 className="text-xl font-semibold mb-6">
            Expense Distribution (Last Month)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expense_distribution}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ category, percent }) =>
                  `${category}: ${(percent).toFixed(1)}%`
                }
              >
                {expense_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Best Month & Milestone */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Best Performance */}
        <Card className="p-6 shadow-soft border-l-4 border-success bg-success/10">
          <div className="flex items-start gap-4">
            <div className="bg-success/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-lg">Best Performance</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Best month: <strong>{best_performance.month}</strong>  
                 with savings of ₹{best_performance.amount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Milestone */}
        <Card className="p-6 shadow-soft border-l-4 border-primary bg-primary/10">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-lg">Next Milestone</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Target: ₹{next_milestone.target.toLocaleString()}
              </p>
              <p className="text-sm text-primary">
                Remaining: ₹{next_milestone.remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsView;