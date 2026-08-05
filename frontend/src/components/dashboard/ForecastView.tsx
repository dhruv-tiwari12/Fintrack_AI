import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, DollarSign, Info } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const ForecastView = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [forecast, setForecast] = useState<any>(null);

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const response = await api.get("/forecast/");
        setForecast(response.data);
      } catch (error: any) {
        console.error("Forecast error:", error);
        toast({
          title: "Error",
          description: "Failed to load forecast data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!forecast) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No forecast data available.</p>
      </Card>
    );
  }

  const { predicted_total_next_month, trend, forecast: forecastData, category_predictions, insights } = forecast;

  // Convert categories into chart-friendly format
  const formattedCategories = Object.entries(category_predictions || {}).map(
    ([category, predicted]) => ({
      category,
      predicted,
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 gradient-primary text-white shadow-medium">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI-Powered Forecast</h2>
            <p className="text-white/80">
              Machine learning + Gemini insights based on your spending patterns
            </p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </Card>

      {/* Monthly Forecast Chart */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-xl font-semibold mb-6">6-Month Expense Forecast</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              name="Actual"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--accent))"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "hsl(var(--accent))", r: 4 }}
              name="Predicted"
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-sm text-muted-foreground mt-4 text-center">
          Dashed line represents AI predictions
        </p>
      </Card>

      {/* Category Forecast */}
      <Card className="p-6 shadow-soft">
        <h3 className="text-xl font-semibold mb-6">Next Month Category Forecast</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedCategories}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="predicted"
              fill="hsl(var(--accent))"
              radius={[8, 8, 0, 0]}
              name="Predicted"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* AI Insights */}
      <div>
        <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
        <div className="space-y-4">
          {insights.map((insight: any, idx: number) => (
            <Card
              key={idx}
              className={`p-5 shadow-soft border-l-4 animate-fade-in ${
                insight.type === "High"
                  ? "border-l-warning bg-warning/5"
                  : insight.type === "Positive"
                  ? "border-l-success bg-success/5"
                  : "border-l-info bg-info/5"
              }`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-info/10 text-info">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-5 shadow-soft text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-success" />
          <p className="text-2xl font-bold text-foreground">
            ₹{predicted_total_next_month.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Predicted Next Month Total</p>
        </Card>

        <Card className="p-5 shadow-soft text-center">
          <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">
            {forecastData.length}
          </p>
          <p className="text-sm text-muted-foreground">Months Analyzed</p>
        </Card>

        <Card className="p-5 shadow-soft text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-accent" />
          <p className="text-2xl font-bold text-foreground">
            ₹{Math.round(predicted_total_next_month / 12).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Avg. Monthly Estimate</p>
        </Card>
      </div>
    </div>
  );
};

export default ForecastView;