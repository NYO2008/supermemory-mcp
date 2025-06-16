#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing Supermemory MCP Server connection...');

// Test server startup
const serverPath = join(__dirname, 'local-server.js');
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, SUPERMEMORY_API_KEY: process.env.SUPERMEMORY_API_KEY }
});

let output = '';
let hasInitialized = false;

server.stdout.on('data', (data) => {
  output += data.toString();
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  const message = data.toString();
  console.log('Server stderr:', message);
  if (message.includes('Supermemory MCP server running on stdio')) {
    hasInitialized = true;
    console.log('✅ Server initialized successfully!');
    
    // Test list tools
    console.log('Testing list tools...');
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    };
    
    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');
    
    // Wait a bit then test a tool call
    setTimeout(() => {
      console.log('Testing addToSupermemory tool...');
      const addMemoryRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'addToSupermemory',
          arguments: {
            thingToRemember: 'Test memory: MCP server connection test successful at ' + new Date().toISOString()
          }
        }
      };
      
      server.stdin.write(JSON.stringify(addMemoryRequest) + '\n');
      
      // Wait and then test search
      setTimeout(() => {
        console.log('Testing searchSupermemory tool...');
        const searchRequest = {
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'searchSupermemory',
            arguments: {
              informationToGet: 'MCP server connection test'
            }
          }
        };
        
        server.stdin.write(JSON.stringify(searchRequest) + '\n');
        
        // Cleanup after tests
        setTimeout(() => {
          console.log('Tests completed, shutting down server...');
          server.kill();
        }, 3000);
      }, 2000);
    }, 2000);
  }
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (hasInitialized) {
    console.log('✅ Supermemory MCP Server test completed successfully!');
  } else {
    console.log('❌ Server failed to initialize properly');
  }
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Timeout after 15 seconds
setTimeout(() => {
  if (!hasInitialized) {
    console.log('❌ Server initialization timeout');
    server.kill();
  }
}, 15000);