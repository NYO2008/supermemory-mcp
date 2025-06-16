#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Supermemory } from 'supermemory';
import { nanoid } from 'nanoid';

class SupermemoryMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'supermemory-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Supermemory client
    this.supermemory = null;
    this.userId = 'mcp-user-' + nanoid();
    
    this.setupToolHandlers();
  }

  async initializeSupermemory() {
    if (!this.supermemory) {
      const apiKey = process.env.SUPERMEMORY_API_KEY;
      if (!apiKey) {
        throw new Error('SUPERMEMORY_API_KEY environment variable is required');
      }
      
      this.supermemory = new Supermemory({
        apiKey: apiKey,
      });
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'addToSupermemory',
            description: 'Store user information, preferences, and behaviors in Supermemory. Use this to remember important context about the user.',
            inputSchema: {
              type: 'object',
              properties: {
                thingToRemember: {
                  type: 'string',
                  description: 'The information to store in memory',
                },
              },
              required: ['thingToRemember'],
            },
          },
          {
            name: 'searchSupermemory',
            description: 'Search user memories and patterns. Use this to retrieve relevant information about the user.',
            inputSchema: {
              type: 'object',
              properties: {
                informationToGet: {
                  type: 'string',
                  description: 'The information to search for in memories',
                },
              },
              required: ['informationToGet'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        await this.initializeSupermemory();
        
        switch (request.params.name) {
          case 'addToSupermemory':
            return await this.handleAddToSupermemory(request.params.arguments);
          case 'searchSupermemory':
            return await this.handleSearchSupermemory(request.params.arguments);
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async handleAddToSupermemory(args) {
    const { thingToRemember } = args;

    if (!thingToRemember) {
      throw new Error('thingToRemember is required');
    }

    // Check memory limit
    const { memories } = await this.supermemory.memories.list({
      containerTags: [this.userId],
    });

    if (memories.length > 2000) {
      throw new Error('Memory limit of 2000 memories exceeded');
    }

    await this.supermemory.memories.add({
      content: thingToRemember,
      containerTags: [this.userId],
    });

    return {
      content: [
        {
          type: 'text',
          text: 'Memory added successfully',
        },
      ],
    };
  }

  async handleSearchSupermemory(args) {
    const { informationToGet } = args;

    if (!informationToGet) {
      throw new Error('informationToGet is required');
    }

    const response = await this.supermemory.search.execute({
      q: informationToGet,
      containerTags: [this.userId],
    });

    const results = response.results
      .map((r) => r.chunks.map((c) => c.content).join('\n\n'))
      .join('\n\n---\n\n');

    return {
      content: [
        {
          type: 'text',
          text: results || 'No memories found matching your search.',
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Supermemory MCP server running on stdio');
  }
}

const server = new SupermemoryMCPServer();
server.run().catch(console.error);