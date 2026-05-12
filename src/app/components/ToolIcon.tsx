import { useState } from 'react';
import { cn } from './ui/utils';

interface ToolIconProps {
  toolName: string;
  website?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

const ICON_PX = { sm: 16, md: 20, lg: 24 };

/**
 * Shows the tool's favicon from its website URL.
 * Falls back to a colored initial if no website or image fails to load.
 */
export function ToolIcon({ toolName, website, size = 'md', className }: ToolIconProps) {
  const [imgError, setImgError] = useState(false);

  let domain: string | null = null;
  if (website) {
    try {
      domain = new URL(website).hostname;
    } catch {
      try {
        domain = new URL('https://' + website).hostname;
      } catch {
        domain = null;
      }
    }
  }

  if (!domain) {
    const guesses: Record<string, string> = {
      'github': 'github.com',
      'copilot': 'github.com',
      'figma': 'figma.com',
      'notion': 'notion.so',
      'slack': 'slack.com',
      'vercel': 'vercel.com',
      'netlify': 'netlify.com',
      'aws': 'aws.amazon.com',
      'azure': 'azure.microsoft.com',
      'firebase': 'firebase.google.com',
      'supabase': 'supabase.com',
      'stripe': 'stripe.com',
      'jira': 'atlassian.com',
      'trello': 'trello.com',
      'linear': 'linear.app',
      'postman': 'postman.com',
      'docker': 'docker.com',
      'mongodb': 'mongodb.com',
      'sentry': 'sentry.io',
      'cloudflare': 'cloudflare.com',
      'zoom': 'zoom.us',
      'discord': 'discord.com',
      'spotify': 'spotify.com',
      'netflix': 'netflix.com',
      'adobe': 'adobe.com',
      'canva': 'canva.com',
      'chatgpt': 'openai.com',
      'openai': 'openai.com',
      'cursor': 'cursor.com',
      'youtube': 'youtube.com',
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'dropbox': 'dropbox.com',
      'grammarly': 'grammarly.com',
      'miro': 'miro.com',
      'airtable': 'airtable.com',
      'zapier': 'zapier.com',
      'railway': 'railway.app',
      'neon': 'neon.tech',
      'render': 'render.com',
      'prisma': 'prisma.io',
      'tailwind': 'tailwindcss.com',
    };
    const lower = toolName.toLowerCase();
    for (const [key, val] of Object.entries(guesses)) {
      if (lower.includes(key)) {
        domain = val;
        break;
      }
    }
  }

  const faviconUrl = domain
    ? 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=' + (ICON_PX[size] * 2)
    : null;

  const showFallback = !faviconUrl || imgError;

  const hash = toolName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colors = [
    'from-violet-500/20 to-indigo-500/20 border-violet-500/30',
    'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
    'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    'from-rose-500/20 to-pink-500/20 border-rose-500/30',
    'from-sky-500/20 to-cyan-500/20 border-sky-500/30',
    'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30',
  ];
  const colorClass = colors[hash % colors.length];

  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center shrink-0 overflow-hidden border',
        SIZES[size],
        showFallback ? 'bg-gradient-to-br ' + colorClass : 'bg-white dark:bg-gray-900 border-border',
        className,
      )}
    >
      {!showFallback ? (
        <img
          src={faviconUrl!}
          alt={toolName}
          className="w-full h-full object-contain p-0.5"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : (
        <span className="font-bold text-foreground">{toolName.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}
