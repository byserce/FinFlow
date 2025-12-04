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
import type { Category } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function AddTransactionSheet({ budgetId }: { budgetId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(null);
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
        variant: 'destructive',
        title: 'Hata',
        description: 'Backend bağlantısı kaldırıldığı için bu işlem yapılamaz.',
    });
    setOpen(false);
  }

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
        className="h-[90vh] rounded-t-2xl p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-center text-xl">Add Transaction</SheetTitle>
        </SheetHeader>
        <form 
            onSubmit={handleFormSubmit}
            className="flex flex-col flex-1 overflow-hidden"
        >
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-6 py-6">
              {/* Amount and Type */}
              <div className="flex items-center justify-center gap-2">
                <Input
                  type="number"
                  name="amount"
                  step="0.01"
                  placeholder="0.00"
                  className="text-4xl font-bold h-auto w-48 text-center border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                  autoFocus
                />
                <div className="flex rounded-full bg-muted p-1">
                   <input type="hidden" name="type" value={type} />
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
                 <input type="hidden" name="category" value={category || ''} />
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
                <input type="hidden" name="date" value={date?.toISOString() || ''} />
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
                  name="note"
                  placeholder="Note (optional)"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t sticky bottom-0 bg-background">
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
