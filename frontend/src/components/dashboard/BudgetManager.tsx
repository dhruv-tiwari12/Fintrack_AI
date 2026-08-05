import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

import {
  getProfile,
  getTransactions,
  getBudgets,
  createBudget,
  deleteBudget,
} from "@/services/api";

import { PiggyBank, Plus, Trash2 } from "lucide-react";

interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: string;
  start_date: string;
  end_date: string;
}

const BudgetManager = () => {
  const { toast } = useToast();

  const [masterBudget, setMasterBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "", limit_amount: "" });

  // ===============================
  // FETCH MASTER MONTHLY BUDGET
  // ===============================
  const loadProfile = async () => {
    try {
      const res = await getProfile();
      setMasterBudget(res.data.monthly_budget);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  // ===============================
  // FETCH TRANSACTIONS FOR THIS MONTH
  // ===============================
  const loadSpent = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1; // 1–12
      const year = now.getFullYear();

      const res = await getTransactions({ month, year });
      const expenses = res.data.filter((t: any) => t.type === "expense");

      const total = expenses.reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
      setTotalSpent(total);
    } catch (err) {
      console.error("Failed to load spent:", err);
    }
  };

  // ===============================
  // FETCH CATEGORY-LEVEL BUDGETS
  // ===============================
  const loadBudgets = async () => {
    try {
      const res = await getBudgets();
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to load budgets:", err);
    }
  };

  // Load everything on mount
  useEffect(() => {
    loadProfile();
    loadSpent();
    loadBudgets();
  }, []);

  // ===============================
  // ADD NEW BUDGET
  // ===============================
  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.limit_amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const limit = parseFloat(newBudget.limit_amount);
    if (isNaN(limit) || limit <= 0) {
      toast({
        title: "Error",
        description: "Invalid budget amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const payload = {
        category: newBudget.category,
        limit_amount: limit,
        period: "monthly",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
      };

      await createBudget(payload);
      await loadBudgets();

      toast({
        title: "Success",
        description: "Budget added successfully",
      });

      setNewBudget({ category: "", limit_amount: "" });
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to add budget",
        variant: "destructive",
      });
    }
  };

  // ===============================
  // DELETE BUDGET
  // ===============================
  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id);
      await loadBudgets();

      toast({
        title: "Success",
        description: "Budget deleted",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  const remaining = masterBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* MASTER BUDGET SUMMARY */}
      <Card className="p-6 gradient-primary text-white shadow-medium">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Monthly Budget</p>
            <p className="text-3xl font-bold">₹{masterBudget.toLocaleString()}</p>
          </div>

          <div className="bg-white/20 p-3 rounded-lg">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span>Spent: ₹{totalSpent.toLocaleString()}</span>
          <span>Remaining: ₹{remaining.toLocaleString()}</span>
        </div>
      </Card>

      {/* ADD NEW CATEGORY BUDGET FORM */}
      {isAdding && (
        <Card className="p-6 shadow-soft animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Add New Category Budget</h3>

          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Input
                placeholder="e.g., Groceries"
                value={newBudget.category}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, category: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Budget Limit (₹)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newBudget.limit_amount}
                onChange={(e) =>
                  setNewBudget({ ...newBudget, limit_amount: e.target.value })
                }
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>

              <Button variant="hero" className="flex-1" onClick={handleAddBudget}>
                Add Budget
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!isAdding && (
        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Budget
        </Button>
      )}

      {/* CATEGORY BUDGET LIST */}
      <div className="space-y-4">
        {budgets.map((budget, idx) => {
          const percentage = (budget.spent_amount / budget.limit_amount) * 100;

          return (
            <Card
              key={budget.id}
              className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{budget.category}</h3>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteBudget(budget.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{budget.spent_amount.toLocaleString()} spent</span>
                  <span>₹{budget.limit_amount.toLocaleString()} limit</span>
                </div>

                <Progress value={percentage} className="h-2" />

                <div className="flex justify-between items-center">
                  <span className="text-xs">{percentage.toFixed(0)}% used</span>
                  <span className="text-xs font-medium">
                    ₹{(budget.limit_amount - budget.spent_amount).toLocaleString()} left
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetManager;