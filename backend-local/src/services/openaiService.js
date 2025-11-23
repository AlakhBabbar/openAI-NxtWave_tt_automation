import OpenAI from 'openai';
import { config } from '../config/index.js';

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.model = 'gpt-4o-mini'; // Using GPT-4o-mini as default model
  }

  /**
   * Generate text content using OpenAI
   * @param {string} prompt - The input prompt
   * @param {Object} options - Additional options for generation
   * @returns {Promise<string>} Generated text response
   */
  async generateText(prompt, options = {}) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: options.model || this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error generating text with OpenAI:', error);
      throw new Error('Failed to generate text response');
    }
  }

  /**
   * Generate text with streaming response
   * @param {string} prompt - The input prompt
   * @returns {Promise<AsyncGenerator>} Streaming response
   */
  async generateTextStream(prompt) {
    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
      return stream;
    } catch (error) {
      console.error('Error generating streaming text with OpenAI:', error);
      throw new Error('Failed to generate streaming response');
    }
  }

  /**
   * Chat conversation with context
   * @param {Array} history - Previous chat messages (format: [{role: 'user'|'assistant', content: 'text'}])
   * @param {string} message - Current message
   * @returns {Promise<string>} Chat response
   */
  async chat(history = [], message) {
    try {
      const messages = [
        ...history,
        { role: 'user', content: message }
      ];

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 1000,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Error in chat with OpenAI:', error);
      throw new Error('Failed to process chat message');
    }
  }

  /**
   * Analyze and process timetable data
   * @param {Object} timetableData - Timetable information
   * @param {string} analysisType - Type of analysis to perform
   * @returns {Promise<string>} Analysis results
   */
  async analyzeTimetable(timetableData, analysisType = 'general') {
    try {
      let prompt = '';
      
      switch (analysisType) {
        case 'conflicts':
          prompt = `Analyze the following timetable data for scheduling conflicts and provide recommendations: ${JSON.stringify(timetableData)}`;
          break;
        case 'optimization':
          prompt = `Suggest optimizations for the following timetable to improve efficiency: ${JSON.stringify(timetableData)}`;
          break;
        case 'load':
          prompt = `Analyze the workload distribution in this timetable and suggest improvements: ${JSON.stringify(timetableData)}`;
          break;
        default:
          prompt = `Provide a general analysis of this timetable data: ${JSON.stringify(timetableData)}`;
      }

      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error analyzing timetable:', error);
      throw new Error('Failed to analyze timetable data');
    }
  }
}

export default new OpenAIService();