import { supabase } from './services/supabase/client';

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Testar a conexão básica
    const { data, error } = await supabase
      .from('logins')
      .select('count()', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    
    console.log('Supabase connection successful!');
    console.log('Data:', data);
    return true;
  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Executar o teste
testSupabaseConnection().then(success => {
  if (success) {
    console.log('✅ Supabase is properly configured!');
  } else {
    console.log('❌ Supabase connection failed!');
  }
});