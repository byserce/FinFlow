'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CATEGORIES, CATEGORY_INFO } from '@/lib/constants';
import type { Category, Transaction } from '@/lib/types';
import { useAppContext } from '@/lib/hooks/use-app-context';

export function AddTransactionSheet() {
  const { addTransaction } = useAppContext();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Transaction['type']>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) {
      // Basic validation
      alert('Please fill all required fields');
      return;
    }
    addTransaction({
      amount: parseFloat(amount),
      type,
      category,
      date: date.toISOString(),
      note,
    });
    // Reset form and close sheet
    setAmount('');
    setCategory(null);
    setDate(new Date());
    setNote('');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <motion.div
          className="fixed bottom-24 right-4 z-40 md:hidden"
          whileTap={{ scale: 0.9 }}
        >
          <Button
            className="w-16 h-16 rounded-full shadow-2xl bg-accent hover:bg-accent/90 text-accent-foreground"
            size="icon"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-2xl p-4 md:p-6"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-center text-xl">Add Transaction</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto space-y-6">
            {/* Amount and Type */}
            <div className="flex items-center justify-center gap-2">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="text-4xl font-bold h-auto w-48 text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <div className="flex rounded-full bg-muted p-1">
                <Button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    'rounded-full h-8',
                    type === 'income' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'
                  )}
                  size="sm"
                >
                  Income
                </Button>
                <Button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    'rounded-full h-8',
                    type === 'expense' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground'
                  )}
                  size="sm"
                >
                  Expense
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Category</h3>
              <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  return (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all',
                        category === cat ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50'
                      )}
                    >
                      <info.icon className={cn('w-6 h-6 mb-1', info.color)} />
                      <span className="text-xs text-center">{cat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Date and Note */}
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'justify-start text-left font-normal h-12 rounded-xl',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-lg mt-4">
              Save Transaction
            </Button>
          </motion.div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
