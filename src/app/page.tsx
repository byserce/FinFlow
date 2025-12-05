'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageTransition } from '@/components/page-transition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Plus, Users, User, ArrowRight, LogOut, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { createBudget, deleteBudget } from './actions';
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/hooks/use-app-context';


export default function BudgetsPage() {
  const { user, logout, isLoading: isUserLoading } = useUser();
  const { budgets, isLoading: isBudgetsLoading, refetch } = useAppContext();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }

  const handleCreateBudgetAction = async (formData: FormData) => {
    if (user) {
        formData.append('owner_id', user.id);
    }
    
    const result = await createBudget(formData);
    
    if (result?.error) {
         toast({
            variant: 'destructive',
            title: 'Hata',
            description: result.error,
        });
    } else {
        toast({
            title: 'Başarılı',
            description: 'Yeni bütçe oluşturuldu.',
        });
        await refetch();
        setIsDialogOpen(false);
    }
  };

  const handleDeleteBudgetAction = async (budgetId: string) => {
    const result = await deleteBudget(budgetId);
     if (result?.error) {
         toast({
            variant: 'destructive',
            title: 'Hata',
            description: result.error,
        });
    } else {
        toast({
            title: 'Başarılı',
            description: 'Bütçe silindi.',
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
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Avatar>
                <AvatarImage src={user?.photo_url ?? undefined} />
                <AvatarFallback>{user?.display_name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Hoşgeldin, {user?.display_name}</h1>
              <p className="text-muted-foreground">
                Tüm bütçelerinizi yönetin
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Yeni Bütçe
                </Button>
                </DialogTrigger>
                <DialogContent>
                    <form action={handleCreateBudgetAction}>
                        <DialogHeader>
                            <DialogTitle>Yeni Bütçe Oluştur</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Input
                            id="name"
                            name="name"
                            placeholder="Bütçe adı (örn: Aile Bütçesi)"
                            required
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                            <Button variant="outline">İptal</Button>
                            </DialogClose>
                            <Button type="submit">Oluştur</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
            </Button>
           </div>
        </header>

        <div className="space-y-4">
          {isBudgetsLoading ? (
             <div className="text-center py-10">
                <p className="text-muted-foreground">Bütçeler yükleniyor...</p>
             </div>
          ) : budgets.length > 0 ? (
            budgets.map((budget) => (
              <Card key={budget.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                    <Link href={`/budget/${budget.id}`} className="flex items-center flex-grow">
                        {budget.members && budget.members.length > 1 ? (
                        <Users className="mr-2 text-primary" />
                        ) : (
                        <User className="mr-2 text-primary" />
                        )}
                        {budget.name}
                    </Link>
                    <div className='flex items-center'>
                         <Link href={`/budget/${budget.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="text-muted-foreground" />
                        </Link>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bu eylem geri alınamaz. Bu, &quot;{budget.name}&quot; bütçesini ve içindeki tüm işlemleri kalıcı olarak silecektir.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBudgetAction(budget.id)}>
                                    Sil
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                    </CardTitle>
                  </CardHeader>
                <Link href={`/budget/${budget.id}`} className="block">
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(budget.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {budget.transactions.length} işlem
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                Henüz bir bütçe oluşturmadınız.
              </p>
              <p className="text-muted-foreground">
                Başlamak için &apos;Yeni Bütçe&apos; düğmesine tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
