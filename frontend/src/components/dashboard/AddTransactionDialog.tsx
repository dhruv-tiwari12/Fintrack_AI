import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { createTransaction } from "@/services/api";

interface AddTransactionDialogProps {
  onAdd: () => void; // Only triggers dashboard refresh
}

const AddTransactionDialog = ({ onAdd }: AddTransactionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    amount: "",
    type: "expense" as "income" | "expense",
  });
  const { toast } = useToast();

  const categories = {
    expense: [
      "Food & Dining",
      "Transportation",
      "Shopping",
      "Bills & Utilities",
      "Entertainment",
      "Healthcare",
      "Education",
      "Other",
    ],
    income: ["Salary", "Freelance", "Investment", "Business", "Other"],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description || !formData.category || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    // Final payload that matches the backend schema exactly
    const payload = {
      type: formData.type,
      description: formData.description,
      category: formData.category,
      amount: amount, // ALWAYS POSITIVE
      date: new Date().toISOString(),
    };

    try {
      await createTransaction(payload);

      toast({
        title: "Success",
        description: `${
          formData.type === "income" ? "Income" : "Expense"
        } added successfully`,
      });

      // Refresh dashboard AFTER backend success
      onAdd();

      // Reset form + close modal
      setFormData({
        description: "",
        category: "",
        amount: "",
        type: "expense",
      });
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to create transaction:", error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.detail ||
          "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "income" | "expense") =>
                setFormData({ ...formData, type: value, category: "" })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="e.g., Grocery Shopping"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionDialog;
