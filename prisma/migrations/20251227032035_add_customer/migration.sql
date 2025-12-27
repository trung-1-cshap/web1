-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "depositDate" TIMESTAMP(3),
    "contractDate" TIMESTAMP(3),
    "depositAmount" DECIMAL(15,2),
    "contractAmount" DECIMAL(15,2),
    "commission" INTEGER,
    "received" BOOLEAN NOT NULL DEFAULT false,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
