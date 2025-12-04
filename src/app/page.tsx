'use client';
import { useState } from 'react';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';

export default function BudgetsPage() {
  const { budgets } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast({
      variant: 'destructive',
      title: 'Hata',
      description: 'Backend bağlantısı kaldırıldığı için bu işlem yapılamaz.',
    });
    setIsDialogOpen(false);
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hoşgeldin</h1>
              <p className="text-muted-foreground">
                Tüm bütçelerinizi yönetin
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Yeni Bütçe
              </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleFormSubmit}>
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
