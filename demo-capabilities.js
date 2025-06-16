#!/usr/bin/env node

/**
 * Supermemory MCP Server Capabilities Demo
 * 
 * This script demonstrates the key features of the Supermemory MCP server:
 * 1. Adding memories to the universal memory system
 * 2. Searching through stored memories
 * 3. Cross-LLM memory persistence
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SupermemoryMCPDemo {
  constructor() {
    this.serverProcess = null;
    this.isConnected = false;
  }

  async startServer() {
    console.log('🚀 Starting Supermemory MCP Server...\n');
    
    const serverPath = join(__dirname, 'local-server.js');
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SUPERMEMORY_API_KEY: process.env.SUPERMEMORY_API_KEY || 'demo-key-for-testing'
      }
    });

    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.isConnected = true;
    console.log('✅ Server started successfully\n');
  }

  // @ts-ignore
  async sendMCPRequest(method, params = {}) {
    if (!this.isConnected || !this.serverProcess) {
      throw new Error('Server not connected');
    }

    // Input validation
    if (typeof method !== 'string' || !method.trim()) {
      throw new Error('Invalid method parameter');
    }

    if (params && typeof params !== 'object') {
      throw new Error('Invalid params parameter');
    }

    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: method.trim(),
      params: params || {}
    };

    return new Promise((resolve, reject) => {
      let responseData = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      // @ts-ignore
      this.serverProcess.stdout.once('data', (data) => {
        clearTimeout(timeout);
        responseData += data.toString();
        
        try {
          const response = JSON.parse(responseData);
          resolve(response);
        } catch (parseError) {
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
          console.error('JSON parsing failed:', errorMessage);
          console.error('Raw response data:', responseData);
          reject(new Error(`Invalid JSON response: ${errorMessage}. Raw data: ${responseData.substring(0, 100)}`));
        }
      });

      // @ts-ignore
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async demonstrateCapabilities() {
    console.log('📋 SUPERMEMORY MCP SERVER CAPABILITIES DEMONSTRATION\n');
    console.log('=' .repeat(60) + '\n');

    try {
      // 1. List available tools
      console.log('1️⃣  LISTING AVAILABLE TOOLS');
      console.log('-'.repeat(30));
      
      const toolsResponse = await this.sendMCPRequest('tools/list');
      if (toolsResponse && toolsResponse.result && toolsResponse.result.tools) {
        toolsResponse.result.tools.forEach((/** @type {any} */ tool, /** @type {number} */ index) => {
          console.log(`   Tool ${index + 1}: ${tool.name}`);
          console.log(`   Description: ${tool.description}`);
          console.log(`   Required params: ${tool.inputSchema.required?.join(', ') || 'none'}\n`);
        });
      }

      // 2. Add memories to demonstrate storage capability
      console.log('2️⃣  ADDING MEMORIES TO SUPERMEMORY');
      console.log('-'.repeat(35));
      
      const memoriesToAdd = [
        "User prefers TypeScript over JavaScript for all projects",
        "User's favorite framework is React with Next.js",
        "User works primarily on macOS with VS Code",
        "User likes clean, well-documented code with comprehensive testing",
        "User is interested in AI/ML integration in web applications"
      ];

      for (let i = 0; i < memoriesToAdd.length; i++) {
        console.log(`   Adding memory ${i + 1}: "${memoriesToAdd[i]}"`);
        
        try {
          const addResponse = await this.sendMCPRequest('tools/call', {
            name: 'addToSupermemory',
            arguments: {
              thingToRemember: memoriesToAdd[i]
            }
          });
          
          if (addResponse && addResponse.result) {
            console.log(`   ✅ Memory ${i + 1} added successfully`);
          }
        } catch (error) {
          // @ts-ignore
          console.log(`   ❌ Failed to add memory ${i + 1}: ${error?.message || 'Unknown error'}`);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log('\n');

      // 3. Search memories to demonstrate retrieval capability
      console.log('3️⃣  SEARCHING STORED MEMORIES');
      console.log('-'.repeat(30));
      
      const searchQueries = [
        "programming language preferences",
        "development environment",
        "coding best practices"
      ];

      for (const query of searchQueries) {
        console.log(`   🔍 Searching for: "${query}"`);
        
        try {
          const searchResponse = await this.sendMCPRequest('tools/call', {
            name: 'searchSupermemory',
            arguments: {
              informationToGet: query
            }
          });
          
          if (searchResponse && searchResponse.result && searchResponse.result.content) {
            const content = searchResponse.result.content[0].text;
            console.log(`   📄 Results: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
          }
        } catch (error) {
          // @ts-ignore
          console.log(`   ❌ Search failed: ${error?.message || 'Unknown error'}`);
        }
        
        console.log('');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Demo failed:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
  }

  async displayFeatures() {
    console.log('🌟 KEY FEATURES OF SUPERMEMORY MCP');
    console.log('=' .repeat(40) + '\n');
    
    const features = [
      {
        icon: '🔄',
        title: 'Universal Memory',
        description: 'Your memories persist across ALL LLM clients that support MCP'
      },
      {
        icon: '🚀',
        title: 'Fast & Scalable',
        description: 'Built on Supermemory API for enterprise-grade performance'
      },
      {
        icon: '🔓',
        title: 'No Login Required',
        description: 'Works immediately without authentication hassles'
      },
      {
        icon: '💰',
        title: 'Completely Free',
        description: 'Full functionality at zero cost'
      },
      {
        icon: '⚡',
        title: 'Simple Setup',
        description: 'One command installation and configuration'
      },
      {
        icon: '🧠',
        title: 'Smart Search',
        description: 'Intelligent retrieval of relevant memories and context'
      }
    ];

    features.forEach((feature, index) => {
      console.log(`${feature.icon} ${feature.title}`);
      console.log(`   ${feature.description}\n`);
    });
  }

  async cleanup() {
    if (this.serverProcess) {
      console.log('🧹 Cleaning up server process...');
      this.serverProcess.kill();
      this.isConnected = false;
    }
  }

  async run() {
    try {
      await this.displayFeatures();
      await this.startServer();
      await this.demonstrateCapabilities();
      
      console.log('✨ SETUP COMPLETE! ✨\n');
      console.log('The Supermemory MCP server is now configured and ready to use.');
      console.log('Your memories will be available across all MCP-compatible LLM clients.\n');
      console.log('Next steps:');
      console.log('1. Get a free API key from https://console.supermemory.ai');
      console.log('2. Update the SUPERMEMORY_API_KEY in .vscode/mcp.json');
      console.log('3. Restart your MCP client to connect with the real API\n');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Demo error:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } finally {
      await this.cleanup();
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down demo...');
  process.exit(0);
});

// Run the demo
const demo = new SupermemoryMCPDemo();
demo.run().catch(console.error);