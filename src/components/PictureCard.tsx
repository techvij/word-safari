import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useImage } from '../hooks/useImageResolver';
import type { Category } from '../lib/types';
import { cn } from '../lib/utils';

export function PictureCard({
  category,
  word,
  emoji,
  wikiOverride,
  lost,
}: {
  category: Category | null;
  word: string;
  emoji: string;
  wikiOverride?: string;
  lost?: boolean;
}) {
  const { data, isLoading } = useImage(category, word, wikiOverride);
  const url = data?.url;
  const credit = data?.attributionText;
  const creditUrl = data?.attributionUrl;

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Polaroid-style frame: gradient border, small rotation, tape strip on top */}
      <motion.div
        initial={{ scale: 0.3, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: -2, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative"
      >
        {/* Tape strip at top — masking-tape feel */}
        <span
          aria-hidden
          className="absolute -top-2 left-1/2 z-10 h-3 w-12 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-amber-200/80 shadow-sm dark:bg-amber-300/40"
          style={{ boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.06)' }}
        />
        <div
          className={cn(
            'relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 sm:h-44 sm:w-44',
            lost
              ? 'ring-rose-200 dark:bg-slate-100/95 dark:ring-rose-700/40'
              : 'ring-bamboo-200 dark:bg-slate-100/95 dark:ring-bamboo-700/40',
          )}
        >
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-xl',
              lost ? 'bg-rose-50' : 'bg-bamboo-50',
            )}
          >
            {isLoading && !url && (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-5xl sm:text-6xl" aria-hidden>
                  {emoji || '✨'}
                </span>
              </div>
            )}
            {url && (
              <motion.img
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={url}
                alt={word}
                className="h-full w-full object-cover"
                loading="eager"
                referrerPolicy="no-referrer"
              />
            )}
            {!url && !isLoading && (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-5xl sm:text-6xl" aria-hidden>
                  {emoji || '✨'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {credit && creditUrl && (
        <a
          href={creditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {credit}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
