import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Trash2, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
}

const GoalsManager = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      name: "Emergency Fund",
      target: 100000,
      current: 45000,
      deadline: "2025-12-31",
      icon: "🏦",
    },
    {
      id: "2",
      name: "Vacation",
      target: 50000,
      current: 28000,
      deadline: "2025-06-30",
      icon: "✈️",
    },
    {
      id: "3",
      name: "New Laptop",
      target: 80000,
      current: 35000,
      deadline: "2025-09-15",
      icon: "💻",
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    deadline: "",
    icon: "🎯",
  });
  const { toast } = useToast();

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const target = parseFloat(newGoal.target);
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid target amount",
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      target,
      current: 0,
      deadline: newGoal.deadline,
      icon: newGoal.icon,
    };

    setGoals([...goals, goal]);
    setNewGoal({ name: "", target: "", deadline: "", icon: "🎯" });
    setIsAdding(false);

    toast({
      title: "Success",
      description: "Savings goal added successfully",
    });
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
    toast({
      title: "Success",
      description: "Goal deleted",
    });
  };

  const handleAddMoney = (id: string, amount: number) => {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, current: Math.min(g.current + amount, g.target) } : g
      )
    );
    toast({
      title: "Success",
      description: `₹${amount.toLocaleString()} added to goal`,
    });
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 gradient-primary text-white shadow-medium">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Total Goals Target</p>
            <p className="text-3xl font-bold">₹{totalTarget.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
        </div>
        <div className="space-y-2">
          <Progress
            value={(totalSaved / totalTarget) * 100}
            className="h-2 bg-white/20"
          />
          <div className="flex justify-between text-sm">
            <span>Saved: ₹{totalSaved.toLocaleString()}</span>
            <span>{((totalSaved / totalTarget) * 100).toFixed(0)}% Complete</span>
          </div>
        </div>
      </Card>

      {/* Add Goal Form */}
      {isAdding && (
        <Card className="p-6 shadow-soft animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goalName">Goal Name</Label>
              <Input
                id="goalName"
                placeholder="e.g., New Car"
                value={newGoal.name}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="goalTarget">Target Amount (₹)</Label>
              <Input
                id="goalTarget"
                type="number"
                placeholder="0.00"
                value={newGoal.target}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, target: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="goalDeadline">Deadline</Label>
              <Input
                id="goalDeadline"
                type="date"
                value={newGoal.deadline}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, deadline: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="goalIcon">Icon (Emoji)</Label>
              <Input
                id="goalIcon"
                placeholder="🎯"
                value={newGoal.icon}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, icon: e.target.value })
                }
                maxLength={2}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAdding(false);
                  setNewGoal({ name: "", target: "", deadline: "", icon: "🎯" });
                }}
              >
                Cancel
              </Button>
              <Button variant="hero" className="flex-1" onClick={handleAddGoal}>
                Add Goal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add Button */}
      {!isAdding && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Goal
        </Button>
      )}

      {/* Goals List */}
      <div className="grid gap-4">
        {goals.map((goal, idx) => {
          const progress = (goal.current / goal.target) * 100;
          const daysLeft = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return (
            <Card
              key={goal.id}
              className="p-6 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{goal.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {daysLeft > 0
                        ? `${daysLeft} days left`
                        : daysLeft === 0
                        ? "Due today"
                        : "Overdue"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    ₹{goal.current.toLocaleString()} / ₹
                    {goal.target.toLocaleString()}
                  </span>
                  <span className="font-medium text-primary">
                    {progress.toFixed(0)}%
                  </span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddMoney(goal.id, 1000)}
                  >
                    + ₹1,000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddMoney(goal.id, 5000)}
                  >
                    + ₹5,000
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddMoney(goal.id, 10000)}
                  >
                    + ₹10,000
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsManager;
