'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction, Member, Profile } from '@/lib/types';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { useAppContext } from '@/lib/hooks/use-app-context';

interface MemberAnalysisChartProps {
  transactions: Transaction[];
  members: Member[];
}

export function MemberAnalysisChart({ transactions, members }: MemberAnalysisChartProps) {
  const { allProfiles } = useAppContext();
  
  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }

  const data = useMemo(() => {
    const analysis: { [key: string]: { name: string; income: number; expense: number } } = {};

    // Initialize with all accepted members
    members.forEach(member => {
      if (member.status === 'accepted') {
        const profile = getProfile(member.user_id);
        analysis[member.user_id] = {
          name: profile?.display_name?.split(' ')[0] || 'Unknown', // Get first name
          income: 0,
          expense: 0,
        };
      }
    });

    // Initialize common spending
    analysis['common'] = { name: 'Ortak', income: 0, expense: 0 };
    
    transactions.forEach(tx => {
      const key = tx.payer_id || 'common';
      
      // Ensure user exists in analysis (e.g. if they left the budget)
      if (!analysis[key]) {
         const profile = getProfile(key);
         analysis[key] = {
            name: profile?.display_name?.split(' ')[0] || 'Eski Üye',
            income: 0,
            expense: 0
         }
      }

      if (tx.type === 'income') {
        analysis[key].income += tx.amount;
      } else {
        analysis[key].expense += tx.amount;
      }
    });
    
    return Object.values(analysis).filter(d => d.income > 0 || d.expense > 0);

  }, [transactions, members, allProfiles]);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle>Member Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value as number)}/>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--border))',
                  }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" fill="hsl(var(--chart-1))" name="Income" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="hsl(var(--chart-2))" name="Expense" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-muted-foreground">No data for this period.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
