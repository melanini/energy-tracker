-- CreateTable
CREATE TABLE "CustomTracker" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitType" TEXT NOT NULL,
    "maxValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTrackerValue" (
    "id" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "tsUtc" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTrackerValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepHygiene" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "consistentSchedule" BOOLEAN NOT NULL DEFAULT false,
    "noScreens" BOOLEAN NOT NULL DEFAULT false,
    "relaxingRoutine" BOOLEAN NOT NULL DEFAULT false,
    "optimalEnvironment" BOOLEAN NOT NULL DEFAULT false,
    "noCaffeine" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SleepHygiene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckInCustomTrackerValue" (
    "id" TEXT NOT NULL,
    "checkInId" TEXT NOT NULL,
    "trackerId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckInCustomTrackerValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SleepHygiene_checkInId_key" ON "SleepHygiene"("checkInId");

-- AddForeignKey
ALTER TABLE "CustomTracker" ADD CONSTRAINT "CustomTracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomTrackerValue" ADD CONSTRAINT "CustomTrackerValue_trackerId_fkey" FOREIGN KEY ("trackerId") REFERENCES "CustomTracker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SleepHygiene" ADD CONSTRAINT "SleepHygiene_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckInCustomTrackerValue" ADD CONSTRAINT "CheckInCustomTrackerValue_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
