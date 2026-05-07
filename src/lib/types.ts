export type Category = 'cities' | 'sports' | 'animals' | 'foods';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MascotName = 'panda' | 'red-panda' | 'tiger';
export type Phase = 'menu' | 'loading' | 'playing' | 'won' | 'lost';

export type WordEntry = {
  word: string;
  category: Category;
  emoji: string;
  fact: string;
  wiki?: string;
};

export type ImageSource = 'local' | 'wikipedia' | 'commons' | 'unsplash' | 'pexels' | 'emoji';

export type ResolvedImage = {
  url: string | null;
  source: ImageSource;
  attributionUrl?: string;
  attributionText?: string;
};

export type WikiSummary = {
  title: string;
  extract?: string;
  thumbnail?: { source: string };
  originalimage?: { source: string };
  content_urls?: { desktop?: { page?: string } };
};
