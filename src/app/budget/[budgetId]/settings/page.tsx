'use client';
import { PageTransition } from "@/components/page-transition";
import { useBudget } from "@/lib/hooks/use-app-context";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check, UserPlus, Users, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { updateMemberStatus, updateMemberRole, removeMember } from "@/app/actions";
import { useAppContext } from "@/lib/hooks/use-app-context";
import type { Profile } from "@/lib/types";

interface SettingsPageProps {
  params: { budgetId: string };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  const { budget, isLoading } = useBudget(params.budgetId);
  const { user } = useUser();
  const { refetch, allProfiles } = useAppContext();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getProfile = (userId: string): Profile | undefined => {
    return allProfiles.find(p => p.id === userId);
  }

  const handleCopyToClipboard = () => {
    if (budget?.join_code) {
      navigator.clipboard.writeText(budget.join_code);
      setCopied(true);
      toast({ title: "Copied!", description: "Join code copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStatusUpdate = async (memberId: string, status: 'accepted' | 'rejected') => {
    const { error } = await updateMemberStatus(params.budgetId, memberId, status);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error });
    } else {
      toast({ title: 'Success', description: `Request has been ${status}.` });
      await refetch();
    }
  };
  
  const handleRoleUpdate = async (memberId: string, role: 'editor' | 'viewer') => {
    const { error } = await updateMemberRole(params.budgetId, memberId, role);
     if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error });
    } else {
      toast({ title: 'Success', description: `Member role has been updated.` });
      await refetch();
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    const { error } = await removeMember(params.budgetId, memberId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error });
    } else {
      toast({ title: 'Success', description: 'Member has been removed.' });
      await refetch();
    }
  }

  if (isLoading || !budget) {
    return (
      <PageTransition>
        <div className="p-4 md:p-6 text-center">Yükleniyor...</div>
      </PageTransition>
    );
  }

  const isOwner = user?.id === budget.owner_id;
  const pendingRequests = budget.members.filter(m => m.status === 'pending');
  
  // Sort accepted members, owner first
  const acceptedMembers = budget.members
    .filter(m => m.status === 'accepted')
    .sort((a, b) => {
      if (a.role === 'owner') return -1;
      if (b.role === 'owner') return 1;
      return 0;
    });


  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Bütçe Ayarları</h1>
          <p className="text-muted-foreground">{budget.name}</p>
        </header>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus /> Davet Kodu
              </CardTitle>
              <CardDescription>
                Bu kodu paylaşarak başkalarını bu bütçeye davet edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input readOnly value={budget.join_code || ''} />
                <Button size="icon" variant="ghost" onClick={handleCopyToClipboard}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isOwner && pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Katılım İstekleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map(member => {
                const memberProfile = getProfile(member.user_id);
                return (
                  <div key={member.user_id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={memberProfile?.photo_url ?? undefined} />
                          <AvatarFallback>{memberProfile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{memberProfile?.display_name ?? 'Bilinmeyen Kullanıcı'}</p>
                          <p className="text-xs text-muted-foreground">{member.user_id}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleStatusUpdate(member.user_id, 'accepted')}>Onayla</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(member.user_id, 'rejected')}>Reddet</Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
        
        <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users /> Üyeler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {acceptedMembers.map(member => {
                 const memberProfile = getProfile(member.user_id);
                 return (
                 <div key={member.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={memberProfile?.photo_url ?? undefined} />
                            <AvatarFallback>{memberProfile?.display_name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{memberProfile?.display_name ?? 'Bilinmeyen Kullanıcı'}</p>
                            <p className="text-xs text-muted-foreground">{member.user_id}</p>
                        </div>
                    </div>

                    {isOwner && member.role !== 'owner' ? (
                       <div className="flex items-center gap-2">
                          <Select 
                            value={member.role}
                            onValueChange={(value: 'editor' | 'viewer') => handleRoleUpdate(member.user_id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-9">
                              <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="editor">Düzenleyici</SelectItem>
                              <SelectItem value="viewer">Görüntüleyici</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button size="icon" variant="ghost" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu kullanıcıyı bütçeden kalıcı olarak kaldıracaksınız.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveMember(member.user_id)}>
                                  Kaldır
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                       </div>
                    ) : (
                      <span className="text-sm font-medium capitalize bg-muted px-2 py-1 rounded-md">{member.role}</span>
                    )}
                 </div>
                 )
              })}
            </CardContent>
        </Card>

      </div>
    </PageTransition>
  );
}
