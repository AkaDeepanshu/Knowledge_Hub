# Knowledge Hub - LLM Provider Configuration

## 🤖 Current LLM Provider: **Google Gemini AI**

This application uses **Google Gemini 2.0 Flash Experimental** model for AI-powered article summarization.

---

## 📋 Overview

### Model Details
- **Provider**: Google Gemini AI
- **Model**: `gemini-2.0-flash-exp`
- **Package**: `@google/genai` (v0.21.0+)
- **API Documentation**: https://ai.google.dev/gemini-api/docs

### Rate Limits
- **Free Tier**: 15 requests per minute
- **Application Limit**: 5 requests per 15 minutes per user (configurable)
- **Pricing**: Free tier available with generous limits

### API Key
Get your API key at: https://aistudio.google.com/app/apikey

---

## 🔧 Configuration

### 1. Environment Setup

Add to `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash-exp  # Optional, default is set in code
```

### 2. Service Implementation

Located at: `backend/services/llmService.js`

```javascript
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const summarizeWithGemini = async (content) => {
  const genModel = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  });

  const prompt = `Summarize the following article concisely in 2-3 sentences:\n\n${content}`;
  
  const result = await genModel.generateContent(prompt);
  const summary = result.response.text();
  
  return summary;
};
```

### 3. Controller Integration

Located at: `backend/controllers/articleController.js`

```javascript
import { summarizeWithGemini } from '../services/llmService.js';

export const summarizeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    // Generate summary using Gemini
    const summary = await summarizeWithGemini(article.content);
    
    // Update article with generated summary
    article.summary = summary;
    await article.save();
    
    res.status(200).json({ success: true, data: { article } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🔄 Switching LLM Providers

### Option 1: OpenAI (GPT-4 / GPT-3.5)

#### Install SDK
```bash
npm install openai
```

#### Update `.env`
```env
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4-turbo-preview  # or gpt-3.5-turbo
```

#### Create Service (`backend/services/openaiService.js`)
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const summarizeWithOpenAI = async (content) => {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that creates concise article summaries.'
      },
      {
        role: 'user',
        content: `Summarize the following article in 2-3 sentences:\n\n${content}`
      }
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0].message.content.trim();
};
```

#### Update Controller
```javascript
import { summarizeWithOpenAI } from '../services/openaiService.js';

// Replace summarizeWithGemini with summarizeWithOpenAI
const summary = await summarizeWithOpenAI(article.content);
```

---

### Option 2: Anthropic (Claude)

#### Install SDK
```bash
npm install @anthropic-ai/sdk
```

#### Update `.env`
```env
ANTHROPIC_API_KEY=your_anthropic_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

#### Create Service (`backend/services/claudeService.js`)
```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const summarizeWithClaude = async (content) => {
  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229',
    max_tokens: 150,
    messages: [
      {
        role: 'user',
        content: `Summarize the following article concisely in 2-3 sentences:\n\n${content}`
      }
    ],
  });

  return message.content[0].text.trim();
};
```

---

### Option 3: Hugging Face (Open Source Models)

#### Install SDK
```bash
npm install @huggingface/inference
```

#### Update `.env`
```env
HUGGINGFACE_API_KEY=your_hf_token_here
HUGGINGFACE_MODEL=facebook/bart-large-cnn  # Summarization model
```

#### Create Service (`backend/services/huggingfaceService.js`)
```javascript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const summarizeWithHuggingFace = async (content) => {
  const result = await hf.summarization({
    model: process.env.HUGGINGFACE_MODEL || 'facebook/bart-large-cnn',
    inputs: content,
    parameters: {
      max_length: 150,
      min_length: 50,
    }
  });

  return result.summary_text;
};
```

---

## 🧪 Mock LLM Service (Testing Without API)

For development and testing without using actual API calls:

### Create Mock Service (`backend/services/mockLlmService.js`)

```javascript
/**
 * Mock LLM service for testing without API calls
 * Returns a deterministic summary based on content analysis
 */
export const mockSummarize = async (content) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Basic content analysis
  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const firstSentence = sentences[0]?.trim() || 'No content available';
  
  // Generate mock summary
  const summary = `This article contains approximately ${wordCount} words across ${sentences.length} sentences. ${firstSentence}. The content provides detailed information on the discussed topic with comprehensive analysis.`;
  
  return summary;
};

/**
 * Mock with random variations
 */
export const mockSummarizeVaried = async (content) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const templates = [
    `This article explores key concepts with ${content.split(/\s+/).length} words of detailed analysis.`,
    `An in-depth examination of the topic, covering multiple perspectives and insights.`,
    `A comprehensive overview that synthesizes important information effectively.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};
```

### Enable Mock in Controller

Update `backend/controllers/articleController.js`:

```javascript
// Toggle between real and mock LLM
const USE_MOCK = process.env.USE_MOCK_LLM === 'true';

// Dynamic import based on environment
const llmService = USE_MOCK 
  ? await import('../services/mockLlmService.js')
  : await import('../services/llmService.js');

export const summarizeArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    // Use appropriate service
    const summary = USE_MOCK 
      ? await llmService.mockSummarize(article.content)
      : await llmService.summarizeWithGemini(article.content);
    
    article.summary = summary;
    await article.save();
    
    res.status(200).json({ success: true, data: { article } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Enable in `.env`
```env
USE_MOCK_LLM=true  # Set to false for real API calls
```

---

## 🎯 Multi-Provider Support

To support multiple LLM providers with runtime selection:

### Service Factory (`backend/services/llmFactory.js`)

```javascript
import { summarizeWithGemini } from './llmService.js';
import { summarizeWithOpenAI } from './openaiService.js';
import { summarizeWithClaude } from './claudeService.js';
import { mockSummarize } from './mockLlmService.js';

const providers = {
  gemini: summarizeWithGemini,
  openai: summarizeWithOpenAI,
  claude: summarizeWithClaude,
  mock: mockSummarize,
};

export const getSummarizer = (provider = 'gemini') => {
  const summarizer = providers[provider.toLowerCase()];
  
  if (!summarizer) {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
  
  return summarizer;
};

export const summarize = async (content, provider = 'gemini') => {
  const summarizer = getSummarizer(provider);
  return await summarizer(content);
};
```

### Update Controller for Multi-Provider

```javascript
import { summarize } from '../services/llmFactory.js';

export const summarizeArticle = async (req, res) => {
  try {
    const { provider = 'gemini' } = req.body; // Allow provider selection
    const article = await Article.findById(req.params.id);
    
    // Use selected provider
    const summary = await summarize(article.content, provider);
    
    article.summary = summary;
    await article.save();
    
    res.status(200).json({ 
      success: true, 
      data: { article, provider } 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
```

### Frontend Provider Selection

Update `frontend/src/pages/ArticleView.jsx`:

```javascript
const [selectedProvider, setSelectedProvider] = useState('gemini');

const handleSummarize = async () => {
  try {
    const response = await articleAPI.summarizeArticle(id, selectedProvider);
    setArticle(response.data.data.article);
  } catch (err) {
    setError(err.response?.data?.message);
  }
};

// In JSX
<select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
  <option value="gemini">Google Gemini</option>
  <option value="openai">OpenAI GPT</option>
  <option value="claude">Anthropic Claude</option>
  <option value="mock">Mock (Testing)</option>
</select>
```

---

## 📊 Provider Comparison

| Provider | Model | Cost (1M tokens) | Speed | Quality | Free Tier |
|----------|-------|------------------|-------|---------|-----------|
| **Gemini** | gemini-2.0-flash-exp | Free* | Very Fast | Excellent | 15 req/min |
| **OpenAI** | gpt-4-turbo | $10/$30 | Fast | Excellent | $5 credit |
| **OpenAI** | gpt-3.5-turbo | $0.50/$1.50 | Very Fast | Good | $5 credit |
| **Claude** | claude-3-sonnet | $3/$15 | Fast | Excellent | Limited |
| **HuggingFace** | bart-large-cnn | Free | Medium | Good | Unlimited |
| **Mock** | N/A | Free | Instant | N/A | Unlimited |

*Free tier limits apply. Check provider documentation for current pricing.

---

## 🔐 Security Best Practices

1. **Never commit API keys** - Use `.env` and add to `.gitignore`
2. **Use environment variables** - Store all keys in `.env`
3. **Implement rate limiting** - Prevent API abuse (already implemented)
4. **Rotate keys regularly** - Change keys periodically
5. **Monitor usage** - Track API calls and costs
6. **Use mock in development** - Save API credits during testing

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key"
**Solution**: Verify API key in `.env` is correct and active

### Issue: Rate limit exceeded
**Solution**: 
- Check provider's rate limits
- Implement request queuing
- Upgrade to paid tier
- Use mock service for testing

### Issue: Poor summary quality
**Solution**:
- Adjust prompt engineering
- Try different models
- Increase max_tokens parameter
- Provide more context in prompt

### Issue: Timeout errors
**Solution**:
- Increase request timeout
- Use faster models (flash/turbo variants)
- Implement retry logic with exponential backoff

---

## 📚 Resources

- **Gemini AI Docs**: https://ai.google.dev/gemini-api/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Hugging Face Docs**: https://huggingface.co/docs/api-inference

---

## 📝 Notes

- Current implementation uses **Google Gemini** as the default provider
- The application is designed to be LLM-agnostic
- Switching providers requires minimal code changes
- Mock service is available for offline development
- Rate limiting is implemented to prevent abuse

---

**Last Updated**: October 29, 2025  
**Current Provider**: Google Gemini AI (`gemini-2.0-flash-exp`)
