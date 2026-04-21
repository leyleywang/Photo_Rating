"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const image_service_1 = require("./image.service");
const uuid_1 = require("uuid");
let ImageController = class ImageController {
    constructor(imageService) {
        this.imageService = imageService;
    }
    getHighScoreImages() {
        return this.imageService.getAllHighScoreImages();
    }
    getImageById(id) {
        const image = this.imageService.getImageById(id);
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        return image;
    }
    uploadImage(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.imageService.uploadImage(file);
    }
    async rateImage(id) {
        try {
            return await this.imageService.rateImage(id);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    async generatePrompt(id) {
        try {
            return await this.imageService.generatePrompt(id);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    async deaiImage(id) {
        try {
            return await this.imageService.deaiImage(id);
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message);
        }
    }
    getDeaiImages() {
        return this.imageService.getAllDeaiImages();
    }
};
exports.ImageController = ImageController;
__decorate([
    (0, common_1.Get)('high-score'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ImageController.prototype, "getHighScoreImages", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ImageController.prototype, "getImageById", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './src/uploads',
            filename: (req, file, callback) => {
                const ext = (0, path_1.extname)(file.originalname);
                const filename = `${(0, uuid_1.v4)()}${ext}`;
                callback(null, filename);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                return callback(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImageController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)(':id/rate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "rateImage", null);
__decorate([
    (0, common_1.Post)(':id/generate-prompt'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "generatePrompt", null);
__decorate([
    (0, common_1.Post)(':id/deai'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "deaiImage", null);
__decorate([
    (0, common_1.Get)('deai/list'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ImageController.prototype, "getDeaiImages", null);
exports.ImageController = ImageController = __decorate([
    (0, common_1.Controller)('api/images'),
    __metadata("design:paramtypes", [image_service_1.ImageService])
], ImageController);
//# sourceMappingURL=image.controller.js.map