const axios = require('axios');

async function testGQL() {
  try {
    // Query GraphQL simple para obtener posts
    const query = `
      query {
        posts {
          id
          title
          content
          weather {
            id
            currentWeather
          }
        }
      }
    `;

    console.log('🔍 Enviando query GraphQL para obtener posts con weather...\n');
    
    const response = await axios.post('http://localhost:3000/graphql', {
      query
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.errors) {
      console.error('❌ Errores en GraphQL:', JSON.stringify(response.data.errors, null, 2));
      return;
    }

    const posts = response.data.data.posts;
    console.log(`✅ Obtenidos ${posts.length} posts\n`);

    const postsWithWeather = posts.filter(p => p.weather);
    console.log(`📊 Posts con weather: ${postsWithWeather.length}\n`);

    for (const post of postsWithWeather) {
      console.log(`📝 Post: ${post.title}`);
      console.log(`   ID: ${post.id}`);
      console.log(`   Weather ID: ${post.weather.id}`);
      console.log(`   Weather Data: ${post.weather.currentWeather}`);
      console.log('');
    }

    // Obtener un post específico con weather
    if (postsWithWeather.length > 0) {
      const postId = postsWithWeather[0].id;
      const singleQuery = `
        query {
          post(where: { id: "${postId}" }) {
            id
            title
            weather {
              id
              currentWeather
            }
          }
        }
      `;

      console.log(`\n🔍 Obteniendo post específico: ${postId}...\n`);
      
      const singleResponse = await axios.post('http://localhost:3000/graphql', {
        query: singleQuery
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (singleResponse.data.errors) {
        console.error('❌ Errores:', JSON.stringify(singleResponse.data.errors, null, 2));
      } else {
        const post = singleResponse.data.data.post;
        console.log('✅ Post obtenido:');
        console.log(`   Título: ${post.title}`);
        console.log(`   Weather: ${post.weather ? post.weather.currentWeather : 'NULL'}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    console.error('Stack:', error.stack);
  }
}

testGQL();
