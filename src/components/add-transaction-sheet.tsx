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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_INFO } from '@/lib/constants';
import type { Category, Transaction } from '@/lib/types';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { ScrollArea } from './ui/scroll-area';

export function AddTransactionSheet() {
  const { addTransaction } = useAppContext();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Transaction['type']>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState('');

  const handleTypeChange = (newType: Transaction['type']) => {
    setType(newType);
    setCategory(null);
  }

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

  const categoriesToShow = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
        className="h-[90vh] rounded-t-2xl p-0 md:p-6 flex flex-col"
      >
        <SheetHeader className="p-4">
          <SheetTitle className="text-center text-xl">Add Transaction</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 h-full overflow-hidden">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-6 pb-4">
              {/* Amount and Type */}
              <div className="flex items-center justify-center gap-2 pt-4">
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
                    onClick={() => handleTypeChange('income')}
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
                    onClick={() => handleTypeChange('expense')}
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
                  {categoriesToShow.map((cat) => {
                    const info = CATEGORY_INFO[cat];
                    return (
                      <div
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={cn(
                          'flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer',
                          category === cat ? 'border-primary bg-primary/10' : 'border-transparent bg-muted/50'
                        )}
                      >
                        <info.icon className={cn('w-6 h-6 mb-1', info.color)} />
                        <span className="text-xs text-center">{info.label}</span>
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
          </ScrollArea>
          <div className="p-4 border-t">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-lg">
                Save Transaction
              </Button>
            </motion.div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
