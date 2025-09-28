-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ageRange" TEXT,
    "gender" TEXT,
    "maritalStatus" TEXT,
    "cep" TEXT,
    "frequency" TEXT,
    "wineStyle" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wineType" TEXT,
    "classification" TEXT,
    "priceRange" TEXT,
    "alcoholFreeWine" TEXT,
    "grapeVarieties" TEXT,
    "tryNewVarieties" TEXT,
    "preferredOrigins" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "purchaseChannels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "attractiveFactors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wineEvents" TEXT,
    "cannedWines" TEXT,
    "naturalWines" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "communicationPreference" TEXT,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);