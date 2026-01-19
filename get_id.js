const axios = require('axios');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

console.log('\n🤖 OBTENEDOR DE ID DE TELEGRAM');
console.log('--------------------------------');

readline.question('Pegue aquí el TOKEN que le dio BotFather: ', async (token) => {
  if (!token) { console.log('❌ Token vacío.'); process.exit(0); }
  
  console.log('\n🔄 Consultando a Telegram...');
  try {
    const res = await axios.get(`https://api.telegram.org/bot${token.trim()}/getUpdates`);
    
    if (res.data.result.length === 0) {
      console.log('⚠️ No se encontraron mensajes. Asegúrate de haberle escrito "Hola" a tu bot antes de ejecutar esto.');
    } else {
      const chatID = res.data.result[res.data.result.length - 1].message.chat.id;
      const user = res.data.result[res.data.result.length - 1].message.chat.first_name;
      console.log('\n✅ ¡EXITO! TUS DATOS SON:');
      console.log(`Token: ${token.trim()}`);
      console.log(`Chat ID: ${chatID}`);
      console.log('\n👉 GUARDA ESTOS DOS NUMEROS, LOS USAREMOS AHORA.');
    }
  } catch (err) {
    console.error('❌ Error: El token parece incorrecto o no hay conexión.');
  }
  process.exit(0);
});
