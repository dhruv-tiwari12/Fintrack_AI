import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import AddTransactionDialog from "./AddTransactionDialog";

interface Transaction {
  id: string;
  type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  date: string;
}

const TransactionsPage = () => {
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  // EDIT STATE
  const [editing, setEditing] = useState<Transaction | null>(null);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      setTransactions(response.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));

      toast({
        title: "Deleted",
        description: "Transaction removed successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    try {
      await updateTransaction(editing.id, {
        type: editing.type,
        description: editing.description,
        amount: Math.abs(editing.amount),
        category: editing.category,
        date: editing.date,
      });

      toast({
        title: "Updated",
        description: "Transaction updated successfully",
      });

      setEditing(null);
      fetchAllTransactions();

    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "all" || t.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Transactions</CardTitle>

          <AddTransactionDialog
            onAdd={() => fetchAllTransactions()}
          />
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
              <Input
                placeholder="Search by description or category..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Select
              value={filterType}
              onValueChange={(v: "all" | "income" | "expense") => setFilterType(v)}
            >
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading */}
          {loading && (
            <p className="text-center text-muted-foreground py-10">Loading...</p>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left bg-muted/30">
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Description</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="border-b last:border-none">
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium
                            ${
                              t.type === "income"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {t.type.toUpperCase()}
                        </span>
                      </td>

                      <td className="p-3">{t.description}</td>
                      <td className="p-3">{t.category}</td>
                      <td className="p-3 font-semibold">
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {new Date(t.date).toLocaleDateString()}
                      </td>

                      <td className="p-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditing(t)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-10">
                  No transactions found
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 space-y-4 animate-scale-in">
            <CardTitle>Edit Transaction</CardTitle>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={editing.type}
                  onValueChange={(v: "income" | "expense") =>
                    setEditing({ ...editing, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Category</Label>
                <Input
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editing.amount}
                  onChange={(e) =>
                    setEditing({ ...editing, amount: Number(e.target.value) })
                  }
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;