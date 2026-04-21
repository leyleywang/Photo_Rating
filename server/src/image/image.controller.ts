import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseInterceptors, 
  UploadedFile,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImageService } from './image.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('high-score')
  getHighScoreImages() {
    return this.imageService.getAllHighScoreImages();
  }

  @Get(':id')
  getImageById(@Param('id') id: string) {
    const image = this.imageService.getImageById(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './src/uploads',
      filename: (req, file, callback) => {
        const ext = extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new BadRequestException('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.imageService.uploadImage(file);
  }

  @Post(':id/rate')
  async rateImage(@Param('id') id: string) {
    try {
      return await this.imageService.rateImage(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/generate-prompt')
  async generatePrompt(@Param('id') id: string) {
    try {
      return await this.imageService.generatePrompt(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post(':id/deai')
  async deaiImage(@Param('id') id: string) {
    try {
      return await this.imageService.deaiImage(id);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get('deai/list')
  getDeaiImages() {
    return this.imageService.getAllDeaiImages();
  }
}
