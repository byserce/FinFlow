
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { updateUserProfile } from '@/app/actions';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isLoading, loadUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarOptions = Array.from({ length: 30 }, (_, i) => `https://picsum.photos/seed/${i + 1}/100/100`);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.display_name || '');
      setSelectedAvatar(user.photo_url || '');
    }
  }, [user, isLoading, router]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('userId', user.id);
    formData.append('displayName', displayName);
    formData.append('photoURL', selectedAvatar);

    const result = await updateUserProfile(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Hata',
        description: result.error,
      });
    } else {
        // Update local storage to reflect changes immediately
      const updatedUser = { ...user, display_name: displayName, photo_url: selectedAvatar };
      localStorage.setItem('active_user', JSON.stringify(updatedUser));
      // Manually trigger a re-fetch in the useUser hook
      await loadUser();

      toast({
        title: 'Başarılı',
        description: 'Profiliniz başarıyla güncellendi.',
      });
      router.push('/');
    }

    setIsSubmitting(false);
  };
  
  if (isLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Yükleniyor...</div>;
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-4">
             <Link href="/" passHref>
              <Button variant="outline" size="icon" aria-label="Geri">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
                 <h1 className="text-3xl font-bold">Profil Ayarları</h1>
                <p className="text-muted-foreground">Adınızı ve profil resminizi güncelleyin.</p>
            </div>
        </header>

        <form onSubmit={handleFormSubmit}>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={selectedAvatar} />
                  <AvatarFallback>
                    <UserIcon className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Kullanıcı Adı</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Profil Resmi Seç</Label>
                <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                  {avatarOptions.map((avatarUrl) => (
                    <button
                      type="button"
                      key={avatarUrl}
                      onClick={() => setSelectedAvatar(avatarUrl)}
                      className={cn(
                        'rounded-full ring-2 ring-transparent hover:ring-primary transition-all',
                        selectedAvatar === avatarUrl && 'ring-primary'
                      )}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>

            </CardContent>
          </Card>
        </form>
      </div>
    </PageTransition>
  );
}
