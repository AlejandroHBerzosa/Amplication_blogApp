const axios = require('axios');

async function testAPI() {
  try {
    // Primero hacer login para obtener el token
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post('http://localhost:3000/api/login', {
      username: 'admin',
      password: 'admin'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login exitoso\n');

    // Obtener lista de posts
    console.log('📋 Obteniendo lista de posts...');
    const postsResponse = await axios.get('http://localhost:3000/api/posts', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(`✅ Obtenidos ${postsResponse.data.length} posts\n`);

    // Mostrar solo los posts con weather
    const postsWithWeather = postsResponse.data.filter(p => p.weather);
    console.log(`📊 Posts con weather: ${postsWithWeather.length}\n`);

    for (const post of postsWithWeather) {
      console.log(`📝 Post: ${post.title}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Weather:`, post.weather);
      console.log('');
    }

    // Obtener un post específico
    if (postsWithWeather.length > 0) {
      const postId = postsWithWeather[0].id;
      console.log(`\n🔍 Obteniendo post específico: ${postId}...`);
      const postResponse = await axios.get(`http://localhost:3000/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('✅ Post obtenido:');
      console.log(`   Título: ${postResponse.data.title}`);
      console.log(`   Weather:`, postResponse.data.weather);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
