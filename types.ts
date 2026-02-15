
export type AppMode = 'model' | 'product' | 'video_review' | 'microstock' | 'storyboard' | 'ecourse';

export interface ProductSlot {
  base64: string | null;
  mimeType: string | null;
}

export interface GeneratedImage {
  id: number;
  base64: string;
  mimeType: string;
  label?: string;
  videoUri?: string;
  isProcessingVideo?: boolean;
}

export interface MicrostockItem {
  file: File;
  base64: string;
  mimeType: string;
  status: 'Menunggu' | 'Proses...' | 'Selesai' | 'Gagal';
  metadata?: {
    title: string;
    keywords: string;
    category_id: number;
  };
}

export interface StoryScene {
  id: number;
  name: string;
  desc: string;
  grokScript: string;
  veoScript: string;
  image?: GeneratedImage;
  videoUri?: string;
  isProcessingVideo?: boolean;
}
