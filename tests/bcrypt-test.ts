import bcrypt from 'bcryptjs';

async function testBcrypt() {
  console.log('🧪 Testando bcrypt...');
  
  // Senhas de teste
  const password1 = '31051988';
  const password2 = '31052025';
  
  // Gerar hashes
  const hash1 = await bcrypt.hash(password1, 10);
  const hash2 = await bcrypt.hash(password2, 10);
  
  console.log('🔑 Hash para 31051988:', hash1);
  console.log('🔑 Hash para 31052025:', hash2);
  
  // Testar comparação
  const result1 = await bcrypt.compare(password1, hash1);
  const result2 = await bcrypt.compare(password2, hash2);
  const result3 = await bcrypt.compare(password1, hash2); // Deve ser falso
  
  console.log('✅ 31051988 válido com seu hash:', result1);
  console.log('✅ 31052025 válido com seu hash:', result2);
  console.log('❌ 31051988 válido com hash de 31052025:', result3);
  
  // Testar com os hashes do sistema
  const systemHash1 = '$2a$10$AU.E8u5xSnMnkwKNkr/JteRieELWZwi5WP8zRhVkJxGhjuMQnFjVy';
  const systemHash2 = '$2a$10$YE/gypSViqRQxE/DCSYYreYCiucXODtgxUssxFE9rBDm7.mQfjPCO';
  
  console.log('💾 Hash do sistema para 31051988:', systemHash1);
  console.log('💾 Hash do sistema para 31052025:', systemHash2);
  
  const systemResult1 = await bcrypt.compare(password1, systemHash1);
  const systemResult2 = await bcrypt.compare(password2, systemHash2);
  
  console.log('✅ 31051988 válido com hash do sistema:', systemResult1);
  console.log('✅ 31052025 válido com hash do sistema:', systemResult2);
}

testBcrypt().catch(console.error);