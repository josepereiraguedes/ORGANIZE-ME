import { localAuthService } from '../src/services/localAuth';

async function testLogin() {
  console.log('🧪 Testando processo de login...');
  
  // Testar login com credenciais corretas
  console.log('\n🔍 Testando login com credenciais corretas:');
  const result1 = await localAuthService.login('pereiraguedes1988@gmail.com', '31051988');
  console.log('✅ Resultado do login 1:', result1 ? 'SUCESSO' : 'FALHA');
  
  const result2 = await localAuthService.login('josepereiraguedes@yahoo.com.br', '31052025');
  console.log('✅ Resultado do login 2:', result2 ? 'SUCESSO' : 'FALHA');
  
  // Testar login com credenciais incorretas
  console.log('\n❌ Testando login com credenciais incorretas:');
  const result3 = await localAuthService.login('pereiraguedes1988@gmail.com', 'senhaerrada');
  console.log('✅ Resultado do login 3 (senha errada):', result3 ? 'SUCESSO' : 'FALHA');
  
  const result4 = await localAuthService.login('usuario@inexistente.com', '31051988');
  console.log('✅ Resultado do login 4 (usuário inexistente):', result4 ? 'SUCESSO' : 'FALHA');
}

testLogin().catch(console.error);