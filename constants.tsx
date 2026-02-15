
import React, { useState, useEffect } from 'react'; // React import added to be safe based on file type, though mostly config

export const COLORS = {
  primary: '#FFD700',
  primaryDark: '#B8860B',
  bgDeep: '#050505',
};

// UPDATE STRUKTUR NARASI 6 SCENE SESUAI REQUEST
export const STORYBOARD_STRUCTURE = [
  { 
    name: "SCENE 1: INTRO / AWAL", 
    desc: "Perkenalan dunia & karakter. Siapa mereka, di mana lokasinya, dan mood awal. (Contoh: Pagi cerah, karakter muncul)." 
  },
  { 
    name: "SCENE 2: PEMICU CERITA", 
    desc: "Masalah atau rasa penasaran muncul. Ada kejadian kecil atau tujuan mulai terbentuk. (Contoh: Menemukan tombol misterius)." 
  },
  { 
    name: "SCENE 3: AKSI AWAL", 
    desc: "Mulai bergerak menyelesaikan tujuan. Eksplorasi atau percobaan pertama. (Contoh: Mengikuti cahaya ke tempat baru)." 
  },
  { 
    name: "SCENE 4: TANTANGAN / KONFLIK", 
    desc: "Puncak cerita (High Tension). Hambatan besar, emosi naik, atau waktu hampir habis. (Contoh: Jalan terhalang, mesin rusak)." 
  },
  { 
    name: "SCENE 5: SOLUSI", 
    desc: "Masalah mulai teratasi. Ide muncul atau kerja sama tim terjadi. (Contoh: Bekerja sama menekan kode yang benar)." 
  },
  { 
    name: "SCENE 6: ENDING / PENUTUP", 
    desc: "Fungsi: Penutup yang jelas & memuaskan. Isi: Masalah selesai, Pesan moral / happy ending." 
  }
];

export const CATEGORIES = [
  { id: 'all', name: 'Semua', defaultPrompt: 'Professional product photography, ultra-sharp 8k resolution, ' },
  { id: 'beauty', name: 'Kecantikan', defaultPrompt: 'Professional beauty photography, high-end skincare context, ultra-sharp 8k resolution, ' },
  { id: 'fashion', name: 'Fashion', defaultPrompt: 'Professional fashion photography, luxury apparel context, ultra-sharp 8k resolution, ' },
  { id: 'food', name: 'F&B', defaultPrompt: 'Professional food photography, gourmet context, ultra-sharp 8k resolution, ' },
  { id: 'tech', name: 'Gadget', defaultPrompt: 'Professional tech photography, sleek electronic device, ultra-sharp 8k resolution, ' },
];

export const MICROSTOCK_CATEGORIES = [
  { id: 'stock-photo', name: 'Foto Asli', defaultPrompt: 'High-end Stock Photography, Commercial use style, crystal clear focus, ultra-sharp details, perfect lighting. ' },
  { id: 'flat-3d', name: 'Flat 3D', defaultPrompt: '3D Render, Clay style or Blender Cycles, Isometric view, clean background, soft lighting, 8k. ' },
  { id: 'flat-2d', name: 'Flat 2D', defaultPrompt: 'Flat design illustration, 2D vector style, clean lines, minimalist, vibrant colors, isolated. ' },
  { id: 'vector', name: 'Vektor', defaultPrompt: 'Vector Art, Adobe Illustrator style, mathematically perfect curves, solid colors, isolated on white. ' },
  { id: 'illustration', name: 'Ilustrasi', defaultPrompt: 'Digital Illustration, Artistic hand-drawn style, highly detailed, creative composition. ' },
  { id: 'realistic', name: 'Foto Realistik', defaultPrompt: 'Hyper-realistic photography, 8k resolution, cinematic lighting, photorealism engine. ' },
];

export const CHARACTERS = [
  { id: 'rian', name: 'Rian (Pria Asia)', prompt: 'Rian (Indonesian man, 28yo, short black hair, casual trendy outfit)' },
  { id: 'sofia', name: 'Sofia (Super Model)', prompt: 'Sofia (Stunning mixed-race woman, 24yo, long wavy hair, elegant dress)' },
  { id: 'aisha', name: 'Aisha (Hijab Glowing)', prompt: 'Aisha (Beautiful woman in modern pastel hijab, 23yo, sweet smile, modest fashion)' },
  { id: 'naufal', name: 'Naufal (Petualang)', prompt: 'Naufal (A brave young Indonesian explorer, 25yo, wearing safari outdoor outfit, backpack, adventurous look)' },
  { id: 'my-face', name: 'Wajah Saya', prompt: 'The specific person provided in the uploaded reference image (SUMBER FOTO)' },
];

export const TEMPLATES = [
  { id: 'studio-pure-white', name: 'Studio Putih', prompt: 'Clean bright environment, high key lighting. ' },
  { id: 'studio-dark-luxury', name: 'Hitam Mewah', prompt: 'Dark dramatic cinematic background, rim lighting. ' },
  { id: 'lifestyle-living', name: 'Living Room', prompt: 'Cozy modern living room, bokeh background. ' },
];

export const STORY_THEMES = [
  { id: 'petualangan', name: 'Petualangan' },
  { id: 'edukasi', name: 'Edukasi' },
  { id: 'horor', name: 'Horor' },
  { id: 'komedi', name: 'Komedi' },
  { id: 'action', name: 'Action' },
  { id: 'fantasi', name: 'Fantasi' },
  { id: 'scifi', name: 'Sci-Fi' },
  { id: 'misteri', name: 'Misteri' },
  { id: 'slice-of-life', name: 'Slice of Life' },
  { id: 'drama', name: 'Drama' },
  { id: 'olahraga', name: 'Olahraga' },
  { id: 'musikal', name: 'Musikal' },
  { id: 'super-hero', name: 'Super Hero' },
  { id: 'sejarah', name: 'Sejarah' },
  { id: 'fabel', name: 'Fabel (Hewan)' },
];

// NEW: CARTOON VISUAL STYLES (UPDATED FOR BETTER INTEGRATION)
export const CARTOON_STYLES = [
  { id: 'pixar-3d', name: '1. 3D Pixar-style', prompt: '(Masterpiece 3D Animation:1.6), (Disney Pixar Style:1.5), Full Cinematic Scene, Octane Render, Redshift, Volumetric Lighting, Ray Tracing, Vivid Colors, Expressive Character blended perfectly with background, Depth of Field, No sticker effect' },
  { id: 'clay', name: '2. Clay Animation', prompt: '(Cute Claymation Masterpiece:1.6), (Soft Plasticine Art:1.5), Rounded character design, Play-Doh texture, Handcrafted miniature world, Fingerprints and imperfections on clay, Tilt-shift photography, Depth of field, Soft studio lighting, Warm cozy atmosphere, Octane Render, 3D Animation Style, Physical presence, Realistic shadows' },
  { id: 'doodle', name: '3. Hand-Drawn / Doodle', prompt: '(Hand-Drawn Sketch Style:1.6), (Cute 2D Illustration:1.5), Black ink outlines, Marker or Watercolor coloring style, Simple and clean strokes, Children Book Illustration, White background with simple environmental elements, Expressive character, Flat 2D Vector Art, Charming aesthetic, Not 3D' },
  { id: 'watercolor', name: '4. Watercolor / Storybook', prompt: '(Whimsical Watercolor Masterpiece:1.6), (Classic Children Book Illustration:1.5), Soft detailed watercolor painting, Dreamy forest atmosphere, Cute round characters, Gentle pastel palette, Magical lighting, Intricate background details, Beatrix Potter style, Soft edges, High quality art, Heartwarming' },
  { id: 'paper-cut', name: '5. Paper Cut / Cutout', prompt: '(Paper Cutout Animation:1.5), Layered Paper Art, Depth created by shadows between paper layers, Craft and DIY aesthetic, Vibrant paper textures, Character made of paper standing in a paper world, Realistic macro photography of paper art' },
  { id: 'felt', name: '6. Felt / Fabric', prompt: '(Cute Felt Doll Masterpiece:1.6), (Handmade Fabric Art:1.5), Soft wool felt texture, Visible thick stitching, Patchwork details, Button eyes or felt cutouts, Plush toy aesthetic, Macro photography, Soft fuzzy edges, Warm studio lighting, Craft world atmosphere, Tactile 3D render, Vibrant colors' },
  { id: 'low-poly', name: '7. Low Poly 3D', prompt: '(Low Poly 3D Art:1.6), (Minimalist Geometric Character:1.5), Constructed from simple primitive shapes (Spheres, Cylinders, Cubes), Vibrant flat colors, Papercraft or rigid puppet aesthetic, Sharp faceted edges, No smooth shading, 3D Render, Clean background, Quirky and funny design' },
  { id: 'anime-kids', name: '8. Anime Kids Style', prompt: '(Masterpiece Cute Anime Style:1.6), (Vibrant Shojo Animation:1.5), Big expressive sparkling eyes, Clean lineart, Soft Cel Shading, Bright cheerful colors, Kawaii aesthetic, High quality 2D anime screenshot, Detailed background with soft sunlight, Cherry blossoms, Heartwarming and innocent look' },
  { id: 'stop-motion', name: '9. Stop Motion Toy', prompt: '(Stop Motion Toy Photography:1.6), (Cute Vinyl Figure:1.5), Smooth shiny plastic material, Claymation aesthetic, Articulated doll joints, Miniature world diorama, Macro lens, Shallow depth of field, Soft studio lighting, Vibrant colors, 3D Render, Octane Render, High quality texture' },
  { id: 'crayon', name: '10. Crayon / Child Drawing', prompt: '(Cute Crayon Drawing:1.6), (Children Book Illustration:1.5), Wax crayon texture on rough paper, Hand-drawn naive style, Vibrant colors, Simple cute character design, Thick textured outlines, White paper background showing through, Playful and innocent aesthetic, 2D Flat Art' },
];

export const VIDEO_STYLES = [
  "Cinematic Masterpiece",
  "Levitation (Anti-Gravity)",
  "Lifestyle Authentic",
  "Epic VFX Transformation",
  "360° Studio Loop",
  "Y2K Pop Viral"
];

// --- PRODUK & MODEL STUDIO DATA ---

export const PROD_CATEGORIES = [
  "Semua", "Kecantikan", "Fashion", "F&B", "Gadget", "Home", "Kesehatan", "3D Cartoon"
];

export const PROD_BACKGROUNDS = [
  "✨ Viral (Acak)", "Studio Putih", "Beige Minimalis", "Hitam Mewah", "Kain Artistik", 
  "Urban Street", "Pastel Pop", "Abstrak Seni", "Nordic Clean", "Terrazzo Trendy", 
  "Gradient Glass", "Brutalis Beton", "Cahaya Jendela", "Batu Alam", "Hutan & Bunga", 
  "Podium Geometris", "Pantai Tropis", "Dapur Marmer", "Kamar Cozy", "Cyberpunk City", 
  "Taman Bunga", "Spa & Zen", "Awan Dreamy", "Meja Kerja Kayu", "Golden Sunset", 
  "Bunga Kering (Boho)", "Pagi Cafe"
];

export const PROD_POSITIONS = [
  "1. Lurus & Tengah", "2. Miring Kanan", "3. Sudut Bawah", "4. Melayang", "5. Tampak Atas", 
  "6. Miring Kiri", "7. Zoom Detail", "8. Samping", "9. Dipegang"
];

export const PROD_EFFECTS = [
  "1. Normal", "2. Splash Air", "3. Efek Api", "4. POV Tangan", "5. Flatlay", "6. Neon Cyber", 
  "7. Macro Detail", "8. Bawah Air", "9. Exploded", "10. Cermin", "11. Asap Warna", 
  "12. Efek Beku", "13. Prisma", "14. Serbuk Emas", "15. Gerak Cepat", "16. Holographic", 
  "17. Sketsa Pensil", "18. Origami", "19. Tetesan Cat", "20. Double Exp.", "21. Vaporwave", 
  "22. Bokeh", "23. Gelembung"
];

// DESKRIPSI SANGAT SPESIFIK UNTUK KONSISTENSI KARAKTER (WAJAH & PAKAIAN)
export const MODEL_PRESETS = [
  { 
    id: 'my-face', 
    name: 'Wajah Saya (Unggah)', 
    desc: 'The specific person provided in the uploaded reference images' 
  },
  { 
    id: 'rian', 
    name: 'Rian (Pria Asia)', 
    desc: 'Rian, an Indonesian man, 28 years old. Sharp jawline, short fade black hair, light brown skin. He is wearing a Plain White T-Shirt and a Navy Blue Bomber Jacket. He wears silver watch on left hand. Consistent face and body type across all shots.' 
  },
  { 
    id: 'sofia', 
    name: 'Sofia (Super Model)', 
    desc: 'Sofia, a stunning mixed-race supermodel, 24 years old. Long wavy brunette hair, high cheekbones, almond eyes. She is wearing a Red Satin Slip Dress and gold hoop earrings. Tall and slender physique. Consistent face and body type across all shots.' 
  },
  { 
    id: 'aisha', 
    name: 'Aisha (Hijab Glowing)', 
    desc: 'Aisha, a beautiful Asian woman, 23 years old. She wears a Sage Green Pashmina Hijab (modern style) and a cream-colored modest blouse. Glowing flawless skin, sweet smile, soft facial features. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'pak-budi', 
    name: 'Pak Budi (Mature)', 
    desc: 'Pak Budi, a charismatic Indonesian man, 50 years old. Salt-and-pepper hair, neatly combed. He wears a classic Brown Batik Shirt (long sleeve) and black trousers. Wise and friendly expression. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'raffi', 
    name: 'Raffi (Host Hits)', 
    desc: 'Raffi, an energetic celebrity host, 30 years old. Stylish undercut hair, bright smile. He wears a colorful yellow and blue Hoodie and white sneakers. Dynamic energy. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'nichol', 
    name: 'Nichol (Aktor Tampan)', 
    desc: 'Nichol, a handsome heartthrob actor, 23 years old. Messy cool hairstyle, sharp nose, intense gaze. He wears a Black Leather Jacket over a grey t-shirt. Edgy movie star vibe. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'manda', 
    name: 'Manda (Soap Star)', 
    desc: 'Manda, a sophisticated Indonesian actress, 25 years old. Straight shoulder-length black hair. She wears a professional White Blazer and pink lipstick. Elegant and dramatic aura. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'prilly', 
    name: 'Prilly (Cantik Imut)', 
    desc: 'Prilly, a petite and cute woman, 22 years old. Big expressive eyes, cheerful smile, long black hair. She wears a Yellow Summer Dress with floral patterns. Bubbly personality. Consistent face and clothing across all shots.' 
  },
  { 
    id: 'fuji', 
    name: 'Fuji (TikTok Viral)', 
    desc: 'Fuji (Indonesian TikTok Viral), a cute trendy Gen-Z girl, 20 years old. Shoulder length hair with airy bangs (poni tipis), slightly brownish hair. She is wearing a Blue Denim Jacket over a Black T-shirt with white text. Playful and cute expression (pouting lips). Consistent face and clothing across all shots.' 
  }
];
