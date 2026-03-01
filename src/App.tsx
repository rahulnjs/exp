import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Input, TextArea } from "./components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { motion } from "framer-motion";
import {
  differenceInCalendarDays,
  addMonths,
  addDays,
  isAfter,
} from "date-fns";
import { toast } from "react-toastify";

interface Contributor {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  contributorId: string;
  description?: string;
}

interface Budget {
  id: string;
  name: string;
  monthlyLimit: number;
  expenses: Expense[];
  description: string;
}

function useDebounce() {
  let timer: number | null = null;
  return (fn, t = 500) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, t);
  };
}

const DB = location.hostname === "localhost" ? "expense_dev" : "expense";

// Billing cycle starts on 25th
const getCycleStartDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  let cycleDate;
  if (now.getDate() >= 25) {
    cycleDate = new Date(year, month, 25);
  }
  cycleDate = new Date(year, month - 1, 25);
  const nextCycleDate = addMonths(cycleDate, 1);
  return [cycleDate, nextCycleDate];
};

const getFromattedDate = (d) => {
  const date = d ?? new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
};

const initialBudgets: Budget[] = [
  {
    id: "1",
    name: "Dine out",
    description: "Eating out or online orders",
    monthlyLimit: 6000,
    expenses: [],
  },
  {
    id: "2",
    name: "Raw Meat & Fish",
    description: "Raw Chicken, Mutton and Fish etc.",
    monthlyLimit: 6000,
    expenses: [],
  },
  {
    id: "3",
    name: "Clothing & Misc",
    description: "Clothing or miscellenous ",
    monthlyLimit: 10000,
    expenses: [],
  },
  {
    id: "4",
    name: "Rent",
    description: "Monthly house rental",
    monthlyLimit: 35000,
    expenses: [],
  },
  {
    id: "5",
    name: "Utilities",
    description: "Elecricity, Gas, Internet and water bills",
    monthlyLimit: 3500,
    expenses: [],
  },
  {
    id: "6",
    name: "Cab",
    description: "Ola/Uber/Rapido services",
    monthlyLimit: 2000,
    expenses: [],
  },
  {
    id: "7",
    name: "Grocery",
    description: "Day to day groceries",
    monthlyLimit: 16000,
    expenses: [],
  },
  {
    id: "8",
    name: "Supplements",
    description: "Medicine or health supplements",
    monthlyLimit: 1500,
    expenses: [],
  },
];

export default function BudgetTrackerApp() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [contributors] = useState<Contributor[]>([
    { id: "1", name: "Rahul" },
    { id: "2", name: "Anu" },
  ]);

  const [selectedBudget, setSelectedBudget] = useState<string>("1");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedContributor, setSelectedContributor] = useState<string>("1");

  const [cycleStart, nextCycleStart] = useMemo(() => getCycleStartDate(), []);
  const today = useMemo(() => getFromattedDate(new Date()), []);
  const daysPassed = useMemo(() => {
    let st = addDays(new Date(cycleStart), 1);
    let dc = 0;
    while (true) {
      dc++;
      st = addDays(st, 1);
      const tomorrow = addDays(new Date(), 1);
      if (isAfter(st, tomorrow)) {
        break;
      }
    }
    return dc;
  }, []);
  const debounce = useDebounce();
  const initialized = useRef(false);
  const daysLeftInCycle = differenceInCalendarDays(nextCycleStart, new Date());
  const lastExpenseName = useRef("");

  useEffect(() => {
    fetch(
      `https://api.rider.rahulnjs.com/exp/${DB}/data/${getFromattedDate(
        cycleStart
      ).replaceAll("/", "-")}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          setBudgets(data[0].budget);
        }
        setTimeout(() => (initialized.current = true), 1000);
      });
  }, []);

  const addExpense = () => {
    if (!amount) return;

    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === selectedBudget) {
          lastExpenseName.current = b.name;
          return {
            ...b,
            expenses: [
              ...b.expenses,
              {
                id: Date.now().toString(),
                amount: Number(amount),
                description,
                date: new Date().toISOString(),
                contributorId: selectedContributor,
              },
            ],
          };
        }
        return b;
      })
    );
    setAmount("");
    setDescription("");
  };

  const saveData = async (c, b, overview) => {
    const res = await fetch(`https://api.rider.rahulnjs.com/exp/${DB}/data`, {
      body: JSON.stringify({
        cycle: c,
        budget: b,
        overview,
      }),
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.modifiedCount) {
      toast.success(`${lastExpenseName.current} expense added`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const calculateSpent = (budget: Budget) =>
    budget.expenses.reduce((sum, e) => sum + e.amount, 0);

  const totalMonthlyLimit = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + calculateSpent(b), 0);
  const totalSpentWithoutRent = budgets
    .filter((b) => b.id !== "4")
    .reduce((sum, b) => sum + calculateSpent(b), 0);
  const totalRemaining = totalMonthlyLimit - totalSpent;
  const allDays = new Set(
    budgets
      .map((b) => b.expenses)
      .flat()
      .map((e) => e.date.replace(/T.*$/, ""))
  ).size;

  const overallPercent =
    totalMonthlyLimit === 0 ? 0 : (totalSpent / totalMonthlyLimit) * 100;

  const contributorTotals = contributors.map((contributor) => {
    const total = budgets.reduce((sum, budget) => {
      const contributorSpent = budget.expenses
        .filter((e) => e.contributorId === contributor.id)
        .reduce((s, e) => s + e.amount, 0);
      return sum + contributorSpent;
    }, 0);

    const percent = totalSpent === 0 ? 0 : (total / totalSpent) * 100;

    return { ...contributor, percent, total };
  });

  useEffect(() => {
    if (!initialized.current) {
      return;
    }
    debounce(() => {
      saveData(getFromattedDate(cycleStart), budgets, {
        totalMonthlyLimit,
        totalSpent,
        totalRemaining,
        collab: contributorTotals,
      });
    });
  }, [budgets]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 pb-24 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Budget Overview
        </h1>
        <p className="text-sm text-slate-500">
          Billing cycle from {cycleStart.toDateString()}
        </p>
        <p className="text-sm text-slate-500">
          Today <b style={{ color: "#000" }}>{today}</b>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
        {/* Premium Overview Card */}
        <Card className="rounded-3xl border border-slate-600 border-solid shadow-2xl bg-white/80 backdrop-blur">
          <CardContent className="p-7 space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Remaining
                </p>
                <p className="text-xl font-semibold text-[#4C45D9]">
                  ₹{totalRemaining}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Spent
                </p>
                <p className="text-xl font-semibold text-[#FF5722]">
                  ₹{totalSpent}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Budget
                </p>
                <p className="text-xl font-semibold text-[#278459]">
                  ₹{totalMonthlyLimit}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(overallPercent, 100)}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-2 bg-gradient-to-r from-slate-900 to-slate-700 rounded-full"
                />
              </div>
              <div className="text-right text-xs text-slate-500">
                {overallPercent.toFixed(1)}% utilized
              </div>
            </div>

            {/* Contribution Split Premium */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Contribution</span>
                <div className="flex gap-6 text-xs text-slate-600">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
                    {contributors[0]?.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-violet-600" />
                    {contributors[1]?.name}
                  </span>
                </div>
              </div>

              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${contributorTotals[0]?.percent || 0}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${contributorTotals[1]?.percent || 0}%` }}
                  transition={{ duration: 0.7 }}
                  className="h-3 bg-gradient-to-r from-indigo-400 to-violet-600"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 items-center gap-5">
              <div>
                <p className="text-3xl text-slate-700">
                  {allDays}/{daysPassed}
                </p>
                <p className="text-xs text-slate-400 tracking-wide">
                  No expsense days
                </p>
              </div>

              <div>
                <p className="text-3xl text-slate-700">{daysLeftInCycle}</p>
                <p className="text-xs text-slate-400 tracking-wide">
                  Days left
                </p>
              </div>

              <div>
                <p className="text-3xl relative pr-7 text-slate-700">
                  <div className="relative w-min">
                    ₹{(totalSpentWithoutRent / daysPassed).toFixed(0)}
                    <div className="absolute text-[10px] top-[3px] right-[-28px] font-normal text-[#b8b8b8]">
                      / day
                    </div>
                  </div>
                </p>
                <p className="text-xs text-slate-400 tracking-wide">
                  Spending rate
                </p>
              </div>

              <div>
                <p className="text-3xl relative pr-7 text-slate-700">
                  <div className="relative w-min">
                    ₹{(totalRemaining / daysLeftInCycle).toFixed(0)}
                    <div className="absolute text-[10px] top-[3px] right-[-28px] font-normal text-[#b8b8b8]">
                      / day
                    </div>
                  </div>
                </p>
                <p className="text-xs text-slate-400 tracking-wide">
                  Safe to spend
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Expense */}
        <Card className="rounded-3xl border-1 shadow-xl bg-white border border-slate-600 border-solid">
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-semibold">Add Expense</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                onValueChange={setSelectedBudget}
                defaultValue={selectedBudget}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Budget" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <TextArea
              placeholder="Descrption (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Select
              onValueChange={setSelectedContributor}
              defaultValue={selectedContributor}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Contributor" />
              </SelectTrigger>
              <SelectContent>
                {contributors.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white p-4"
              onClick={addExpense}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Individual Budgets */}
      <div className=" grid gap-4 md:grid-cols-3 lg:grid-cols:4 sm:grid-cols-1">
        {budgets.map((budget) => {
          const spent = calculateSpent(budget);
          const remaining = budget.monthlyLimit - spent;
          const percent =
            budget.monthlyLimit === 0 ? 0 : (spent / budget.monthlyLimit) * 100;

          const progressColor =
            percent < 50
              ? "from-emerald-400 to-emerald-600"
              : percent < 80
              ? "from-amber-400 to-orange-500"
              : "from-rose-400 to-red-600";

          return (
            <Card
              key={budget.id}
              className="rounded-3xl shadow-lg bg-white/80 backdrop-blur border border-slate-600 border-solid"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{budget.name}</h3>
                  <span className="text-xs text-slate-500">
                    ₹{remaining} left
                  </span>
                </div>
                <div className="text-gray-400 !mt-px text-sm">
                  {budget.description}
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percent, 100)}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-2 bg-gradient-to-r ${progressColor} rounded-full`}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>₹{spent} spent</span>
                  <span>₹{budget.monthlyLimit} limit</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
