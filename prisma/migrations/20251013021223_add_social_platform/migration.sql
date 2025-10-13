/*
  Warnings:

  - You are about to drop the column `handle` on the `social_links` table. All the data in the column will be lost.
  - Added the required column `username` to the `social_links` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('instagram', 'tiktok', 'x', 'linkedin', 'youtube', 'github');

-- AlterTable
ALTER TABLE "social_links" DROP COLUMN "handle",
ADD COLUMN     "username" TEXT NOT NULL;
