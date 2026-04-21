import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UploadedImage, ImageRating, HighScoreReasons } from './image.types';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageService {
  private uploadedImages: Map<string, UploadedImage> = new Map();

  private sampleHighScoreImages: UploadedImage[] = [
    {
      id: 'sample1',
      filename: 'sample1.jpg',
      originalName: 'sample1.jpg',
      uploadDate: new Date(),
      rating: { imagination: 92, composition: 88, scenery: 95, total: 92 },
      highScoreReasons: {
        imagination: '这幅作品展现了非凡的想象力，将科幻元素与自然景观完美融合，创造出超现实的视觉体验。',
        composition: '构图采用黄金分割原则，主体元素与背景层次分明，光影对比强烈，极具视觉冲击力。',
        scenery: '景色描绘细腻入微，从细节处展现宏大的世界观，色彩搭配和谐统一。'
      },
      prompt: 'A futuristic city floating in the sky with flying cars, cyberpunk style, neon lights, detailed architecture, cinematic lighting, 8k resolution, ultra realistic'
    },
    {
      id: 'sample2',
      filename: 'sample2.jpg',
      originalName: 'sample2.jpg',
      uploadDate: new Date(),
      rating: { imagination: 85, composition: 90, scenery: 88, total: 88 },
      highScoreReasons: {
        imagination: '创意独特，将古典与现代元素巧妙结合，呈现出时空交错的艺术效果。',
        composition: '对称构图营造庄严肃穆的氛围，线条流畅自然，视觉引导清晰。',
        scenery: '景色层次丰富，前景中景远景层层递进，空间感强烈。'
      },
      prompt: 'Ancient temple with modern architecture elements, sunrise lighting, dramatic shadows, mystical atmosphere, photorealistic, 4k'
    },
    {
      id: 'sample3',
      filename: 'sample3.jpg',
      originalName: 'sample3.jpg',
      uploadDate: new Date(),
      rating: { imagination: 95, composition: 85, scenery: 90, total: 90 },
      highScoreReasons: {
        imagination: '想象力爆棚，创造出完全虚构但又令人信服的奇幻生物，细节丰富令人惊叹。',
        composition: '动态构图充满张力，主体占据黄金位置，背景虚化突出重点。',
        scenery: '环境设定独特，色彩大胆而协调，氛围营造出色。'
      },
      prompt: 'Mystical dragon emerging from crystal cave, bioluminescent plants, magical aura, fantasy art, highly detailed, digital painting'
    }
  ];

  getAllHighScoreImages(): UploadedImage[] {
    return [...this.sampleHighScoreImages];
  }

  getImageById(id: string): UploadedImage | undefined {
    const sampleImage = this.sampleHighScoreImages.find(img => img.id === id);
    if (sampleImage) return sampleImage;
    return this.uploadedImages.get(id);
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadedImage> {
    const id = uuidv4();
    const image: UploadedImage = {
      id,
      filename: file.filename,
      originalName: file.originalname,
      uploadDate: new Date(),
    };
    
    this.uploadedImages.set(id, image);
    return image;
  }

  async rateImage(id: string): Promise<UploadedImage> {
    const image = this.uploadedImages.get(id);
    if (!image) {
      throw new Error('Image not found');
    }

    const rating = this.generateRandomRating();
    const reasons = this.generateHighScoreReasons(rating);
    
    image.rating = rating;
    image.highScoreReasons = reasons;
    
    this.uploadedImages.set(id, image);
    return image;
  }

  async generatePrompt(id: string): Promise<UploadedImage> {
    const image = this.uploadedImages.get(id) || this.sampleHighScoreImages.find(img => img.id === id);
    if (!image) {
      throw new Error('Image not found');
    }

    image.prompt = this.generateRandomPrompt();
    if (this.uploadedImages.has(id)) {
      this.uploadedImages.set(id, image);
    }
    return image;
  }

  async deaiImage(id: string): Promise<UploadedImage> {
    const image = this.uploadedImages.get(id);
    if (!image) {
      throw new Error('Image not found');
    }

    image.deaiVersion = `deai_${image.filename}`;
    this.uploadedImages.set(id, image);
    return image;
  }

  getAllDeaiImages(): UploadedImage[] {
    return Array.from(this.uploadedImages.values()).filter(img => img.deaiVersion);
  }

  private generateRandomRating(): ImageRating {
    const imagination = Math.floor(Math.random() * 30) + 70;
    const composition = Math.floor(Math.random() * 30) + 70;
    const scenery = Math.floor(Math.random() * 30) + 70;
    const total = Math.floor((imagination + composition + scenery) / 3);
    
    return { imagination, composition, scenery, total };
  }

  private generateHighScoreReasons(rating: ImageRating): HighScoreReasons {
    const imaginationReasons = [
      '这幅作品展现了非凡的想象力，创意独特，突破常规思维。',
      '想象力丰富，将不可能变为可能，创造出令人惊叹的视觉效果。',
      '创意新颖，视角独特，展现出创作者丰富的内心世界。'
    ];
    
    const compositionReasons = [
      '构图精妙，黄金分割运用得当，视觉引导清晰自然。',
      '层次分明，主次有序，光影对比营造出强烈的空间感。',
      '布局合理，留白得当，整体画面和谐统一。'
    ];
    
    const sceneryReasons = [
      '景色描绘细腻入微，从宏观到微观都展现出非凡的功力。',
      '色彩搭配和谐统一，光影效果营造出独特的氛围。',
      '环境设定完整，细节丰富，身临其境之感油然而生。'
    ];

    return {
      imagination: imaginationReasons[Math.floor(Math.random() * imaginationReasons.length)],
      composition: compositionReasons[Math.floor(Math.random() * compositionReasons.length)],
      scenery: sceneryReasons[Math.floor(Math.random() * sceneryReasons.length)]
    };
  }

  private generateRandomPrompt(): string {
    const subjects = [
      'futuristic cityscape',
      'mystical forest',
      'ancient temple ruins',
      'alien planet landscape',
      'underwater kingdom',
      'floating islands',
      'cyberpunk market',
      'crystal mountain'
    ];
    
    const styles = [
      'cyberpunk style',
      'fantasy art',
      'steampunk aesthetic',
      'art nouveau',
      'minimalist',
      'surrealist',
      'impressionist',
      'hyperrealistic'
    ];
    
    const details = [
      'neon lights, detailed architecture, cinematic lighting',
      'misty atmosphere, magical creatures, glowing elements',
      'dramatic shadows, mystical aura, ancient symbols',
      'breathtaking views, vibrant colors, lens flare',
      'intricate details, depth of field, 8k resolution',
      'dynamic composition, motion blur, action-packed'
    ];

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const detail = details[Math.floor(Math.random() * details.length)];

    return `${subject}, ${style}, ${detail}, ultra detailed, professional photography`;
  }

  getUploadsDir(): string {
    return path.join(process.cwd(), 'src', 'uploads');
  }
}
