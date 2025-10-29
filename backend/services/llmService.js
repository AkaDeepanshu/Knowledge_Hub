const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Abstract LLM Service - Supports multiple AI providers
 * Providers: OpenAI (GPT-3.5/GPT-4) and Google Gemini Pro
 */

class LLMService {
  constructor() {
    // Initialize OpenAI
    this.openai = process.env.OPENAI_API_KEY 
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;

    // Initialize Gemini
    this.gemini = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;

    // Default provider
    this.defaultProvider = process.env.DEFAULT_LLM_PROVIDER || 'gemini';
  }

  /**
   * Summarize content using specified LLM provider
   * @param {string} content - Article content to summarize
   * @param {string} provider - 'openai' or 'gemini'
   * @param {object} options - Additional options (maxLength, style, etc.)
   * @returns {Promise<string>} Generated summary
   */
  async summarizeWithLLM(content, provider = null, options = {}) {
    const selectedProvider = provider || this.defaultProvider;

    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }

    // Validate content length (max 10000 characters for safety)
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }

    try {
      switch (selectedProvider.toLowerCase()) {
        case 'openai':
          return await this.summarizeWithOpenAI(content, options);
        
        case 'gemini':
          return await this.summarizeWithGemini(content, options);
        
        default:
          throw new Error(`Unsupported LLM provider: ${selectedProvider}`);
      }
    } catch (error) {
      console.error(`LLM summarization error (${selectedProvider}):`, error.message);
      throw new Error(`Failed to generate summary using ${selectedProvider}: ${error.message}`);
    }
  }

  /**
   * Generate summary using OpenAI GPT models
   * @private
   */
  async summarizeWithOpenAI(content, options = {}) {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    const {
      maxLength = 150,
      model = 'gpt-3.5-turbo',
      temperature = 0.7
    } = options;

    const systemPrompt = `You are a professional content summarizer. Create a concise, informative summary that captures the key points and main ideas of the article. The summary should be clear, engaging, and approximately ${maxLength} words or less.`;

    const userPrompt = `Please summarize the following article:\n\n${content}`;

    const response = await this.openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: temperature,
      max_tokens: Math.ceil(maxLength * 1.5), // Rough token estimate
    });

    const summary = response.choices[0].message.content.trim();
    
    // Validate summary length (max 500 chars as per schema)
    return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
  }

  /**
   * Generate summary using Google Gemini Pro
   * @private
   */
  async summarizeWithGemini(content, options = {}) {
    if (!this.gemini) {
      throw new Error('Gemini API key not configured');
    }

    const {
      maxLength = 150,
      model = 'gemini-pro',
      temperature = 0.7
    } = options;

    const genModel = this.gemini.getGenerativeModel({ model: model });

    const prompt = `You are a professional content summarizer. Create a concise, informative summary of approximately ${maxLength} words that captures the key points and main ideas of the following article. Make it clear and engaging.\n\nArticle:\n${content}\n\nSummary:`;

    const result = await genModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: Math.ceil(maxLength * 1.5),
      },
    });

    const response = await result.response;
    const summary = response.text().trim();

    // Validate summary length (max 500 chars as per schema)
    return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
  }

  /**
   * Check which providers are available
   * @returns {object} Available providers and default
   */
  getAvailableProviders() {
    return {
      openai: !!this.openai,
      gemini: !!this.gemini,
      default: this.defaultProvider
    };
  }

  /**
   * Validate if a provider is configured
   * @param {string} provider - Provider name
   * @returns {boolean}
   */
  isProviderAvailable(provider) {
    const providers = this.getAvailableProviders();
    return providers[provider.toLowerCase()] || false;
  }
}

// Export singleton instance
module.exports = new LLMService();
