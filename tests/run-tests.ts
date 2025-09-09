// Simple test runner for the stock management system

import { runBasicTests } from './basic-functionality.test';
import { runCrudTests } from './crud-operations.test';
import { runExportTests } from './export-functionality.test';

// Note: The comprehensive integration test is run separately due to its async nature

console.log('Starting unit and functional tests for Stock Management System...\n');

// Run basic functionality tests
try {
  runBasicTests();
  console.log('\n✅ Basic functionality tests passed!\n');
} catch (error) {
  console.error('❌ Basic functionality tests failed:', error);
  process.exit(1);
}

// Run CRUD operations tests
try {
  runCrudTests();
  console.log('\n✅ CRUD operations tests passed!\n');
} catch (error) {
  console.error('❌ CRUD operations tests failed:', error);
  process.exit(1);
}

// Run export functionality tests
try {
  runExportTests();
  console.log('\n✅ Export functionality tests passed!\n');
} catch (error) {
  console.error('❌ Export functionality tests failed:', error);
  process.exit(1);
}

console.log('🎉 All unit and functional tests passed! Test execution completed successfully.');
console.log('\nℹ️  Note: For comprehensive integration tests, run:');
console.log('   npx tsx tests/comprehensive-integration-test.ts');