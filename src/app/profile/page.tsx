
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { updateUserProfile } from '@/app/actions';
import { PageTransition } from '@/components/page-transition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfilePage() {
  const { user, isLoading, refetch } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avatarOptions = Array.from({ length: 30 }, (_, i) => `https://picsum.photos/seed/${i + 1}/100/100`);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.display_name || '');
      setSelectedAvatar(user.photo_url || '');
      setDefaultCurrency(user.default_currency || 'USD');
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
    formData.append('default_currency', defaultCurrency);

    const result = await updateUserProfile(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: result.error,
      });
    } else {
      toast({
        title: t('success'),
        description: t('updateSuccess'),
      });
      await refetch();
      router.push('/');
      router.refresh();
    }

    setIsSubmitting(false);
  };
  
  if (isLoading || !user) {
    return <div className="flex items-center justify-center h-screen">{t('loading')}...</div>;
  }

  return (
    <PageTransition>
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <header className="flex items-center gap-4">
             <Link href="/" passHref>
              <Button variant="outline" size="icon" aria-label={t('goBack')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
                 <h1 className="text-2xl xs:text-3xl font-bold">{t('profileSettings')}</h1>
                <p className="text-muted-foreground">{t('updateProfileDescription')}</p>
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
                <Label htmlFor="displayName">{t('displayNameLabel')}</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('language')}</Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as 'tr' | 'en')}>
                      <SelectTrigger>
                          <SelectValue placeholder={t('language')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="tr">{t('turkish')}</SelectItem>
                          <SelectItem value="en">{t('english')}</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                 <div className="space-y-2">
                  <Label>{t('defaultCurrency')}</Label>
                  <Select value={defaultCurrency} onValueChange={setDefaultCurrency} name="default_currency">
                      <SelectTrigger>
                          <SelectValue placeholder={t('selectCurrency')} />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="TRY">TRY (₺)</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('selectProfilePicture')}</Label>
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
                {isSubmitting ? t('saving') : t('saveChanges')}
              </Button>

            </CardContent>
          </Card>
        </form>
      </div>
    </PageTransition>
  );
}
