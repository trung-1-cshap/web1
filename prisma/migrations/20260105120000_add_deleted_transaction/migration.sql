-- Add deleted and deletedAt to Transaction
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "deleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
