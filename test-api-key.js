#!/usr/bin/env node

import { Supermemory } from 'supermemory';
import { nanoid } from 'nanoid';

async function testApiKey() {
  console.log('🔑 Testing Supermemory API Key...\n');
  
  const apiKey = process.env.SUPERMEMORY_API_KEY;
  console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
  
  if (!apiKey) {
    console.error('❌ SUPERMEMORY_API_KEY environment variable is not set');
    process.exit(1);
  }
  
  try {
    const supermemory = new Supermemory({
      apiKey: apiKey,
    });
    
    const userId = 'test-user-' + nanoid();
    console.log(`User ID: ${userId}\n`);
    
    // Test adding a memory
    console.log('📝 Adding test memory...');
    await supermemory.memories.add({
      content: 'This is a test memory to verify API connectivity',
      containerTags: [userId],
    });
    console.log('✅ Memory added successfully\n');
    
    // Test searching memories
    console.log('🔍 Searching for test memory...');
    const response = await supermemory.search.execute({
      q: 'test memory',
      containerTags: [userId],
    });
    
    console.log(`✅ Search successful! Found ${response.results.length} results`);
    if (response.results.length > 0) {
      console.log('📄 First result:');
      console.log(response.results[0].chunks[0].content);
    }
    
    console.log('\n🎉 API Key is working correctly!');
    
  } catch (error) {
    console.error('❌ API Key test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testApiKey();