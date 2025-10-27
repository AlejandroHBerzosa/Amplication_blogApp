-- CreateTable
CREATE TABLE "WeatherDatum" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentWeather" JSONB,
    "id" TEXT NOT NULL,
    "postsId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherDatum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeatherDatum_postsId_key" ON "WeatherDatum"("postsId");

-- AddForeignKey
ALTER TABLE "WeatherDatum" ADD CONSTRAINT "WeatherDatum_postsId_fkey" FOREIGN KEY ("postsId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
