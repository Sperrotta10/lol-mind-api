-- CreateTable
CREATE TABLE "GameVersion" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Champion" (
    "id" TEXT NOT NULL,
    "key" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[],
    "stats" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Champion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plaintext" TEXT,
    "gold" JSONB NOT NULL,
    "stats" JSONB,
    "tags" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rune" (
    "id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "tree" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rune_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameVersion_version_key" ON "GameVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "Champion_key_key" ON "Champion"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Rune_key_key" ON "Rune"("key");
