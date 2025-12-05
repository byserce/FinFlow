'use client';
import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Calendar as CalendarIcon, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_INFO } from '@/lib/constants';
import type { Category, Profile } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/app/actions';
import { useUser } from '@/hooks/use-user';
import { useAppContext, useBudget } from '@/lib/hooks/use-app-context';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useTranslation } from '@/hooks/use-translation';

interface AddTransactionSheetProps {
    budgetId: string;
}


export function AddTransactionSheet({ budgetId }: AddTransactionSheetProps) {
  const { budget } = useBudget(budgetId);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [payerId, setPayerId] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const acceptedMembers = budget?.members.filter(m => m.status === 'accepted') || [];
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  useEffect(() => {
    if (budget?.mode === 'sharing') {
      setParticipantIds(acceptedMembers.map(m => m.user_id));
    }
  }, [budget?.mode, budget?.members]);

  const { toast } = useToast();
  const { user } = useUser();
  const { refetch, allProfiles } = useAppContext();
  
  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }
  
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(null);
  }

  const handleParticipantChange = (userId: string) => {
    setParticipantIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };


  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
         toast({ variant: 'destructive', title: t('error'), description: t('error_mustBeLoggedIn') });
        return;
    }
    if (!category) {
        toast({ variant: 'destructive', title: t('error'), description: t('error_mustSelectCategory') });
        return;
    }
    
    if (budget?.mode === 'sharing' && !payerId) {
       toast({ variant: 'destructive', title: t('error'), description: t('error_mustSelectPayer') });
        return;
    }
    
    if (budget?.mode === 'sharing' && participantIds.length === 0) {
        toast({ variant: 'destructive', title: t('error'), description: t('error_mustSelectParticipant') });
        return;
    }

    const formData = new FormData(event.currentTarget);
    formData.set('budgetId', budgetId);
    if(payerId) formData.set('payer_id', payerId);
    if (budget?.mode === 'sharing') {
      formData.set('type', 'expense');
      participantIds.forEach(id => formData.append('participant_ids', id));
    }

    const result = await addTransaction(formData);

    if (result?.error) {
        toast({ variant: 'destructive', title: t('error'), description: result.error, });
    } else {
        toast({ title: t('success'), description: t('transactionAddSuccess') });
        await refetch();
        setOpen(false);
        // Reset form state if needed
        setCategory(null);
        setPayerId(null);
        setParticipantIds(acceptedMembers.map(m => m.user_id));
    }
  }
  
  if (!budget) return null;

  const transactionType = budget.mode === 'sharing' ? 'expense' : type;
  const categoriesToShow = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

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
          <SheetTitle className="text-center text-xl">
             {budget.mode === 'sharing' ? t('addExpense') : t('addTransaction')}
          </SheetTitle>
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
                {budget.mode === 'tracking' && (
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
                        {t('income')}
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
                        {t('expense')}
                    </Button>
                    </div>
                )}
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{t('category')}</h3>
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

             <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                    {t('payer')}
                </h3>
                <Select value={payerId ?? undefined} onValueChange={setPayerId}>
                    <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder={t('selectPayer')} />
                    </SelectTrigger>
                    <SelectContent>
                        {budget.mode === 'tracking' && (
                            <SelectItem value="common">
                            <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <span>{t('commonExpense')}</span>
                            </div>
                            </SelectItem>
                        )}
                        {acceptedMembers.map(member => {
                            const profile = getProfile(member.user_id);
                            return (
                                <SelectItem key={member.user_id} value={member.user_id}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile?.photo_url ?? undefined} />
                                            <AvatarFallback>{profile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                                        </Avatar>
                                        <span>{profile?.display_name ?? 'Bilinmeyen'}</span>
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
             </div>

            {budget.mode === 'sharing' && (
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        {t('participants')}
                    </h3>
                    <div className="space-y-2">
                        {acceptedMembers.map(member => {
                            const profile = getProfile(member.user_id);
                            return (
                                <div key={member.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                    <Checkbox 
                                        id={`participant-${member.user_id}`}
                                        checked={participantIds.includes(member.user_id)}
                                        onCheckedChange={() => handleParticipantChange(member.user_id)}
                                    />
                                    <Label htmlFor={`participant-${member.user_id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={profile?.photo_url ?? undefined} />
                                            <AvatarFallback>{profile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                                        </Avatar>
                                        <span>{profile?.display_name ?? 'Bilinmeyen'}</span>
                                    </Label>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

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
                      {date ? format(date, 'PPP') : <span>{t('selectDate')}</span>}
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
                  placeholder={t('note')}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </ScrollArea>
          <div className="p-4 border-t sticky bottom-0 bg-background">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" size="lg" className="w-full h-14 rounded-xl text-lg">
                {t('saveTransaction')}
              </Button>
            </motion.div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
