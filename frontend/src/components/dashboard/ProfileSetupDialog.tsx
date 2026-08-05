import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Target } from "lucide-react";
import { createProfile } from "@/services/api";

interface ProfileSetupDialogProps {
  open: boolean;
  onSuccess: () => void;
}

const ProfileSetupDialog = ({ open, onSuccess }: ProfileSetupDialogProps) => {
  const [formData, setFormData] = useState({
    initial_balance: "",
    monthly_budget: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.initial_balance || !formData.monthly_budget) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const initialBalance = parseFloat(formData.initial_balance);
    const monthlyBudget = parseFloat(formData.monthly_budget);

    if (isNaN(initialBalance) || isNaN(monthlyBudget)) {
      toast({
        title: "Error",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }

    if (initialBalance < 0 || monthlyBudget < 0) {
      toast({
        title: "Error",
        description: "Amounts cannot be negative",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createProfile({
        initial_balance: initialBalance,
        monthly_budget: monthlyBudget,
      });

      toast({
        title: "Profile Created!",
        description: "Your financial profile has been set up successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create profile:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.detail || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to FinTrack AI! 🎉</DialogTitle>
          <DialogDescription>
            Let's set up your financial profile to get started with smart money management.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="initial_balance" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Current Bank Balance
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="initial_balance"
                name="initial_balance"
                type="number"
                step="0.01"
                placeholder="50000"
                className="pl-8"
                value={formData.initial_balance}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter your total current balance across all accounts
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_budget" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Monthly Budget
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ₹
              </span>
              <Input
                id="monthly_budget"
                name="monthly_budget"
                type="number"
                step="0.01"
                placeholder="30000"
                className="pl-8"
                value={formData.monthly_budget}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Set a monthly spending limit to help track your expenses
            </p>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">💡 Quick Tip</p>
            <p className="text-xs text-muted-foreground">
              Your monthly budget should be less than your monthly income. A good rule of thumb
              is to allocate 50% for needs, 30% for wants, and 20% for savings.
            </p>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            variant="hero"
            size="lg"
            className="w-full"
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ProfileSetupDialog;