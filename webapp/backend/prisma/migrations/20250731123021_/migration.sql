-- CreateTable
CREATE TABLE `face_verifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference_image` VARCHAR(255) NOT NULL,
    `uploaded_image` VARCHAR(255) NOT NULL,
    `image_type` ENUM('uploaded', 'captured') NOT NULL,
    `result` ENUM('success', 'failure', 'pending') NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitation_requests` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `invited_by_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `token_id` VARCHAR(191) NULL,
    `invited_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `registered_at` DATETIME(3) NULL,

    UNIQUE INDEX `invitation_requests_email_key`(`email`),
    UNIQUE INDEX `invitation_requests_token_id_key`(`token_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `medias` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `libelle` VARCHAR(191) NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `type` ENUM('PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG', 'TIFF', 'BMP') NOT NULL DEFAULT 'PNG',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `medias_url_key`(`url`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tokens` (
    `id` VARCHAR(191) NOT NULL,
    `owned_by_id` VARCHAR(191) NULL,
    `token` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `scopes` VARCHAR(191) NOT NULL,
    `device_name` VARCHAR(191) NULL,
    `device_ip` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `browser_name` VARCHAR(191) NULL,
    `browser_version` VARCHAR(191) NULL,
    `os_name` VARCHAR(191) NULL,
    `os_version` VARCHAR(191) NULL,
    `device_type` VARCHAR(191) NULL,
    `device_vendor` VARCHAR(191) NULL,
    `device_model` VARCHAR(191) NULL,
    `location_city` VARCHAR(191) NULL,
    `location_country` VARCHAR(191) NULL,
    `location_lat` DOUBLE NULL,
    `location_lon` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `unvailable_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `roles` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `face_verifications` ADD CONSTRAINT `face_verifications_reference_image_fkey` FOREIGN KEY (`reference_image`) REFERENCES `medias`(`url`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `face_verifications` ADD CONSTRAINT `face_verifications_uploaded_image_fkey` FOREIGN KEY (`uploaded_image`) REFERENCES `medias`(`url`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitation_requests` ADD CONSTRAINT `invitation_requests_token_id_fkey` FOREIGN KEY (`token_id`) REFERENCES `tokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitation_requests` ADD CONSTRAINT `invitation_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitation_requests` ADD CONSTRAINT `invitation_requests_invited_by_id_fkey` FOREIGN KEY (`invited_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_owned_by_id_fkey` FOREIGN KEY (`owned_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
