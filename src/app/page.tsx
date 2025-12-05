'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageTransition } from '@/components/page-transition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Plus, Users, User, ArrowRight, LogOut, Trash2, UserPlus, WalletCards, Receipt, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { createBudget, deleteBudget, joinBudgetByCode } from './actions';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BudgetsPage() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { budgets, allProfiles, isLoading: isBudgetsLoading, refetch } = useAppContext();
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center h-screen">{t('loading')}</div>;
  }
  
  const getProfile = (userId: string) => allProfiles.find(p => p.id === userId);

  const handleCreateBudgetAction = async (formData: FormData) => {
    if (user) {
        formData.append('owner_id', user.id);
    }
    
    const result = await createBudget(formData);
    
    if (result?.error) {
         toast({
            variant: 'destructive',
            title: t('error'),
            description: result.error,
        });
    } else {
        toast({
            title: t('success'),
            description: t('budgetCreateSuccess'),
        });
        await refetch();
        setIsCreateDialogOpen(false);
    }
  };
  
  const handleJoinBudgetAction = async (formData: FormData) => {
    if (user) {
        formData.append('user_id', user.id);
    }
    
    const result = await joinBudgetByCode(formData);

    if (result?.error) {
         toast({
            variant: 'destructive',
            title: t('error'),
            description: result.error,
        });
    } else {
        toast({
            title: t('success'),
            description: t('joinRequestSuccess'),
        });
        await refetch();
        setIsJoinDialogOpen(false);
    }
  }


  const handleDeleteBudgetAction = async (budgetId: string) => {
    const result = await deleteBudget(budgetId);
     if (result?.error) {
         toast({
            variant: 'destructive',
            title: t('error'),
            description: result.error,
        });
    } else {
        toast({
            title: t('success'),
            description: t('budgetDeleteSuccess'),
        });
        await refetch();
    }
  }


  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center justify-between">
                <Link href="/profile" className="flex items-center gap-4 group">
                    <Avatar>
                        <AvatarImage src={user?.photo_url ?? undefined} />
                        <AvatarFallback>{user?.display_name?.charAt(0) ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold group-hover:underline">{t('welcomeUser', { name: user?.display_name || '' })}</h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            {t('manageBudgets')}
                        </p>
                    </div>
                </Link>
                 <div className="flex items-center md:hidden">
                    <Link href="/profile">
                        <Button variant="ghost" size="icon" aria-label={t('profileSettings')}>
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('logout')}>
                        <LogOut className="h-5 w-5" />
                    </Button>
                 </div>
            </div>
          <div className='flex items-center gap-2'>
            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                 <Button variant="outline" className="w-full md:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" /> {t('joinBudget')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={handleJoinBudgetAction}>
                    <DialogHeader>
                        <DialogTitle>{t('joinBudgetTitle')}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                        id="join_code"
                        name="join_code"
                        placeholder={t('joinCodePlaceholder')}
                        required
                        />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                        <Button variant="outline">{t('cancel')}</Button>
                        </DialogClose>
                        <Button type="submit">{t('sendRequest')}</Button>
                    </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> {t('newBudget')}
                </Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleCreateBudgetAction}>
                        <DialogHeader>
                            <DialogTitle>{t('createBudgetTitle')}</DialogTitle>
                            <DialogDescription>
                                {t('createBudgetDescription')}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('budgetNameLabel')}</Label>
                                    <Input
                                    id="name"
                                    name="name"
                                    placeholder={t('budgetNamePlaceholder')}
                                    required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select name="currency" defaultValue={user.default_currency || 'USD'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="TRY">TRY (₺)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <RadioGroup name="mode" defaultValue="tracking" className="space-y-4">
                                <Label>{t('budgetModeLabel')}</Label>
                                <div className="flex items-start p-4 border rounded-lg gap-4 has-[:checked]:bg-muted/50">
                                    <RadioGroupItem value="tracking" id="tracking" className="mt-1"/>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="tracking" className="font-bold flex items-center gap-2">
                                            <WalletCards className="w-4 h-4" /> {t('trackingMode')}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">{t('trackingModeDescription')}</p>
                                    </div>
                                </div>
                                <div className="flex items-start p-4 border rounded-lg gap-4 has-[:checked]:bg-muted/50">
                                    <RadioGroupItem value="sharing" id="sharing" className="mt-1"/>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="sharing" className="font-bold flex items-center gap-2">
                                            <Receipt className="w-4 h-4" /> {t('sharingMode')}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">{t('sharingModeDescription')}</p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">{t('cancel')}</Button>
                            </DialogClose>
                            <Button type="submit">{t('create')}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <div className="hidden md:flex items-center">
                 <Link href="/profile">
                    <Button variant="ghost" size="icon" aria-label={t('profileSettings')}>
                        <Settings className="h-5 w-5" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('logout')}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
           </div>
        </header>

        <div className="space-y-4">
          {isBudgetsLoading ? (
             <div className="text-center py-10">
                <p className="text-muted-foreground">{t('budgetsLoading')}</p>
             </div>
          ) : budgets.length > 0 ? (
            budgets.map((budget) => {
              const acceptedMembers = budget.members.filter(m => m.status === 'accepted');
              
              const getIcon = () => {
                if (budget.mode === 'sharing') return <Receipt className="mr-2 text-primary" />;
                if (acceptedMembers.length > 1) return <Users className="mr-2 text-primary" />;
                return <User className="mr-2 text-primary" />;
              };

              return (
              <Card key={budget.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                 <CardHeader>
                    <div className="flex justify-between items-start">
                      <Link href={`/budget/${budget.id}`} className="flex-grow">
                        <CardTitle className="flex items-center">
                            {getIcon()}
                            {budget.name}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center -space-x-2">
                        {acceptedMembers.slice(0, 3).map(member => {
                          const profile = getProfile(member.user_id);
                          return (
                            <Avatar key={member.user_id} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={profile?.photo_url ?? undefined} />
                              <AvatarFallback>{profile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                            </Avatar>
                          )
                        })}
                        {acceptedMembers.length > 3 && (
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">+{acceptedMembers.length - 3}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                <Link href={`/budget/${budget.id}`} className="block">
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(budget.balance, budget.currency)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {budget.transactions.length} {t('transactions')}
                        </p>
                      </div>
                       <div className='flex items-center'>
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="text-muted-foreground" />
                        </div>
                         {user.id === budget.owner_id && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {t('deleteBudgetWarning', { budgetName: budget.name })}
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteBudgetAction(budget.id)}>
                                        {t('delete')}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )})
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {t('noBudgets')}
              </p>
              <p className="text-muted-foreground">
                {t('clickNewBudget')}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
