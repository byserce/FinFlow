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

export default function BudgetsPage() {
  const { budgets, createBudget } = useAppContext();
  const [newBudgetName, setNewBudgetName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateBudget = () => {
    if (newBudgetName.trim()) {
      createBudget(newBudgetName.trim());
      setNewBudgetName('');
      setIsDialogOpen(false);
    }
  };

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
              <DialogHeader>
                <DialogTitle>Yeni Bütçe Oluştur</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Bütçe adı (örn: Aile Bütçesi)"
                  value={newBudgetName}
                  onChange={(e) => setNewBudgetName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">İptal</Button>
                </DialogClose>
                <Button onClick={handleCreateBudget}>Oluştur</Button>
              </DialogFooter>
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
                        {budget.shared ? (
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
