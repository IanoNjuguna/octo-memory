import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { getAvatarUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  pubkey: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'size-6',
  default: 'size-8',
  lg: 'size-10',
} as const;

export function UserAvatar({ pubkey, size = 'default', className }: UserAvatarProps) {
  const { data: author, isLoading } = useAuthor(pubkey);

  if (isLoading) {
    return <Skeleton className={cn('rounded-full shrink-0', sizeMap[size], className)} />;
  }

  const pictureUrl = author?.metadata?.picture || null;
  const displayName = author?.metadata?.display_name || author?.metadata?.name;
  const fallbackLetter = displayName?.charAt(0)?.toUpperCase() || pubkey.slice(0, 1).toUpperCase();

  return (
    <Avatar className={cn('shrink-0', sizeMap[size], className)}>
      <AvatarImage
        src={getAvatarUrl(pubkey, pictureUrl)}
        alt={displayName || 'User avatar'}
      />
      <AvatarFallback>{fallbackLetter}</AvatarFallback>
    </Avatar>
  );
}