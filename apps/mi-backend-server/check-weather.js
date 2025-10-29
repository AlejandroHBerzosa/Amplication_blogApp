const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando Posts con Weather...\n');
  
  const posts = await prisma.post.findMany({
    include: {
      weather: true,
    },
  });

  for (const post of posts) {
    console.log(`📝 Post: ${post.title}`);
    console.log(`   ID: ${post.id}`);
    console.log(`   Weather: ${post.weather ? 'SÍ - ' + post.weather.currentWeather : 'NO'}`);
    console.log('');
  }

  console.log('\n🌤️ Verificando WeatherDatum...\n');
  
  const weatherData = await prisma.weatherDatum.findMany({
    include: {
      posts: true,
    },
  });

  for (const weather of weatherData) {
    console.log(`🌡️ Weather ID: ${weather.id}`);
    console.log(`   currentWeather: ${weather.currentWeather}`);
    console.log(`   postsId: ${weather.postsId || 'NULL'}`);
    console.log(`   Post: ${weather.posts ? weather.posts.title : 'NULL'}`);
    console.log('');
  }

  await prisma.$disconnect();
}

main();
