export type Article = {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  category: string;
  timeAgo: string;
  readTime: string;
  imageUrl: string;
  url: string;
  featured?: boolean;
};

export type Tab = 'Home' | 'Discover' | 'Saved' | 'Profile';
