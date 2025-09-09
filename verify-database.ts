import { createClient } from '@supabase/supabase-js';

// Load environment variables directly since we can't use import.meta.env in this context
const supabaseUrl = "https://ordbtxqeamcmdeqbksix.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yZGJ0eHFlYW1jbWRlcWJrc2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwOTY0MjEsImV4cCI6MjA3MjY3MjQyMX0.NoApUB_5GEjrxlQmOcY6gUfUQGt4pWtsyFMioH74znA";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL and Anon Key are required");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the interfaces directly since we can't import them
interface Product {
  id?: number;
  name: string;
  category: string;
  cost: number;
  sale_price: number;
  quantity: number;
  supplier: string;
  min_stock: number;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id?: number;
  type: 'sale' | 'purchase' | 'adjustment';
  product_id: number;
  client_id?: number;
  quantity: number;
  unit_price: number;
  total: number;
  payment_status: 'paid' | 'pending';
  description?: string;
  created_at: string;
}

async function verifyDatabase() {
  console.log('🔍 Verifying Supabase database configuration...\n');
  
  try {
    // Test 1: Check products table
    console.log('🧪 Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (productsError) {
      console.error('❌ Error accessing products table:', productsError.message);
      return false;
    }
    
    console.log('✅ Products table accessible');
    console.log(`📊 Found ${products?.length || 0} products\n`);
    
    // Test 2: Check clients table
    console.log('🧪 Testing clients table...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (clientsError) {
      console.error('❌ Error accessing clients table:', clientsError.message);
      return false;
    }
    
    console.log('✅ Clients table accessible');
    console.log(`📊 Found ${clients?.length || 0} clients\n`);
    
    // Test 3: Check transactions table
    console.log('🧪 Testing transactions table...');
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (transactionsError) {
      console.error('❌ Error accessing transactions table:', transactionsError.message);
      return false;
    }
    
    console.log('✅ Transactions table accessible');
    console.log(`📊 Found ${transactions?.length || 0} transactions\n`);
    
    // Test 4: Test inserting and deleting a product
    console.log('🧪 Testing CRUD operations...');
    const testProduct: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
      name: 'Test Product - Database Verification',
      category: 'Test',
      cost: 10.50,
      sale_price: 15.75,
      quantity: 5,
      supplier: 'Test Supplier',
      min_stock: 2
    };
    
    const { data: insertedProduct, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Error inserting test product:', insertError.message);
      return false;
    }
    
    console.log('✅ Product insertion successful');
    
    // Test 5: Delete the test product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', insertedProduct.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test product:', deleteError.message);
      return false;
    }
    
    console.log('✅ Product deletion successful\n');
    
    // Test 6: Verify table structure
    console.log('🧪 Checking table structures...');
    
    // Check products table structure
    const productFields = ['id', 'name', 'category', 'cost', 'sale_price', 'quantity', 'supplier', 'min_stock', 'image', 'created_at', 'updated_at'];
    const { data: productSample, error: productSampleError } = await supabase
      .from('products')
      .select(productFields.join(','))
      .limit(1);
    
    if (productSampleError) {
      console.error('❌ Error checking products table structure:', productSampleError.message);
      return false;
    }
    
    console.log('✅ Products table structure verified');
    
    // Check clients table structure
    const clientFields = ['id', 'name', 'email', 'phone', 'address', 'created_at', 'updated_at'];
    const { data: clientSample, error: clientSampleError } = await supabase
      .from('clients')
      .select(clientFields.join(','))
      .limit(1);
    
    if (clientSampleError) {
      console.error('❌ Error checking clients table structure:', clientSampleError.message);
      return false;
    }
    
    console.log('✅ Clients table structure verified');
    
    // Check transactions table structure
    const transactionFields = ['id', 'type', 'product_id', 'client_id', 'quantity', 'unit_price', 'total', 'payment_status', 'description', 'created_at'];
    const { data: transactionSample, error: transactionSampleError } = await supabase
      .from('transactions')
      .select(transactionFields.join(','))
      .limit(1);
    
    if (transactionSampleError) {
      console.error('❌ Error checking transactions table structure:', transactionSampleError.message);
      return false;
    }
    
    console.log('✅ Transactions table structure verified\n');
    
    console.log('🎉 All database verification tests passed!');
    console.log('✅ Database is fully configured and connected');
    return true;
    
  } catch (error: any) {
    console.error('❌ Unexpected error during database verification:', error.message);
    return false;
  }
}

// Run the verification
verifyDatabase().then(success => {
  if (!success) {
    process.exit(1);
  }
});