// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, TrendingDown } from "lucide-react";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// interface OverviewTabProps {
//   data: any;
//   isLoading: boolean;
// }

// const OverviewTab = ({ data, isLoading }: OverviewTabProps) => {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <p className="text-muted-foreground">Loading dashboard data...</p>
//       </div>
//     );
//   }

//   if (!data) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="text-center">
//           <p className="text-muted-foreground mb-4">No dashboard data available</p>
//           <p className="text-sm text-muted-foreground">
//             Please set up your profile and add some transactions to see insights
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const { stats, category_breakdown, monthly_trend, recent_transactions } = data;

//   return (
//     <div className="space-y-6">
//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {/* Total Balance */}
//         <Card className="gradient-primary text-white">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
//             <Wallet className="w-5 h-5" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">₹{stats.total_balance.toLocaleString()}</div>
//             <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
//               <ArrowUpRight className="w-4 h-4" />
//               +12.5% from last month
//             </p>
//           </CardContent>
//         </Card>

//         {/* Income */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Income (Current Month)</CardTitle>
//             <TrendingUp className="w-5 h-5 text-green-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">₹{stats.total_income.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//               <ArrowUpRight className="w-4 h-4" />
//               +{stats.income_change_percent.toFixed(1)}% increase
//             </p>
//           </CardContent>
//         </Card>

//         {/* Expenses */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Expenses (Current Month)</CardTitle>
//             <TrendingDown className="w-5 h-5 text-red-500" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-red-600">₹{stats.total_expenses.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
//               <ArrowDownRight className="w-4 h-4" />
//               {stats.expense_change_percent.toFixed(1)}% decrease
//             </p>
//           </CardContent>
//         </Card>

//         {/* Budget Left */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Budget Left</CardTitle>
//             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//               🎯
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">₹{stats.budget_left.toLocaleString()}</div>
//             <p className="text-xs text-muted-foreground mt-1">
//               {stats.budget_usage_percent.toFixed(0)}% of monthly budget remaining
//             </p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid gap-6 md:grid-cols-2">
//         {/* Income vs Expenses Chart */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="w-5 h-5" />
//               Income vs Expenses
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={monthly_trend}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
//                 <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         {/* Category Breakdown */}
//         <Card>
//           <CardHeader>
//             <CardTitle>By Category</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={category_breakdown}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="amount"
//                   label={(entry) => entry.category}
//                 >
//                   {category_breakdown.map((entry: any, index: number) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="mt-4 space-y-2">
//               {category_breakdown.map((cat: any) => (
//                 <div key={cat.category} className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-2">
//                     <div
//                       className="w-3 h-3 rounded-full"
//                       style={{ backgroundColor: cat.color }}
//                     />
//                     <span>{cat.category}</span>
//                   </div>
//                   <span className="font-semibold">₹{cat.amount.toLocaleString()}</span>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default OverviewTab;

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface OverviewTabProps {
  data: any;
  isLoading: boolean;
}

const OverviewTab = ({ data, isLoading }: OverviewTabProps) => {
  // ========== LOADING STATE ==========
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  // ========== NO DATA ==========
  if (!data || !data.stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No dashboard data available</p>
          <p className="text-sm text-muted-foreground">
            Please set up your profile and add some transactions to see insights.
          </p>
        </div>
      </div>
    );
  }

  // ========== SAFE DATA EXTRACTION ==========
  const stats = data.stats ?? {};
  const monthlyTrend = data.monthly_trend ?? [];
  const categories = data.category_breakdown ?? [];

  return (
    <div className="space-y-6">
      {/* ========== STATS CARDS ========== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Total Balance */}
        <Card className="gradient-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats.total_balance ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-white/80 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              {stats.income_change_percent ?? 0}% from last month
            </p>
          </CardContent>
        </Card>

        {/* Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Income (Current Month)</CardTitle>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{(stats.total_income ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              +{(stats.income_change_percent ?? 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expenses (Current Month)</CardTitle>
            <TrendingDown className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{(stats.total_expenses ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-4 h-4" />
              {(stats.expense_change_percent ?? 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* Budget Left */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget Left</CardTitle>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              🎯
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{(stats.budget_left ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(stats.budget_usage_percent ?? 0).toFixed(0)}% used
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ========== CHARTS ========== */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Income vs Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  label={(entry) => entry.category}
                >
                  {categories.map((entry: any, index: number) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {categories.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.category}</span>
                  </div>
                  <span className="font-semibold">
                    ₹{(cat.amount ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default OverviewTab;