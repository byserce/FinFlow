'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/page-transition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppContext } from '@/lib/hooks/use-app-context';
import { formatCurrency } from '@/lib/utils';
import { Plus, Users, User, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { createBudget } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function BudgetsPage() {
  const { budgets, user } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateBudget = async (formData: FormData) => {
    const result = await createBudget(formData);

    if (result?.error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: result.error,
      });
    } else if (result?.id) {
      toast({
        title: 'Başarılı!',
        description: 'Yeni bütçeniz oluşturuldu.',
      });
      setIsDialogOpen(false);
      router.push(`/budget/${result.id}`);
      router.refresh(); // Sayfanın yenilenmesini tetikleyerek yeni bütçenin listede görünmesini sağlar
    }
  };
  
  if (!user) {
    return (
         <PageTransition>
            <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
                <h1 className="text-2xl font-bold">FinFlow'a Hoş Geldiniz</h1>
                <p className="text-muted-foreground mt-2">
                    Bütçelerinizi yönetmeye başlamak için lütfen giriş yapın.
                </p>
                <Link href="/login" passHref>
                    <Button className="mt-4">Giriş Yap</Button>
                </Link>
            </div>
        </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bütçelerim</h1>
            <p className="text-muted-foreground">
              Tüm bütçelerinizi yönetin
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Yeni Bütçe
              </Button>
            </DialogTrigger>
            <DialogContent>
                <form action={handleCreateBudget}>
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
        </header>

        <div className="space-y-4">
          {budgets.length > 0 ? (
            budgets.map((budget) => (
              <Link href={`/budget/${budget.id}`} key={budget.id} passHref>
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span className="flex items-center">
                        {budget.members && budget.members.length > 1 ? (
                          <Users className="mr-2 text-primary" />
                        ) : (
                          <User className="mr-2 text-primary" />
                        )}
                        {budget.name}
                      </span>
                      <ArrowRight className="text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(budget.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {budget.transactions.length} işlem
                    </p>
                  </CardContent>
                </Card>
              </Link>
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
