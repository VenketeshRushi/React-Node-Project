import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  HumanMessage,
  SystemMessage,
  AIMessageChunk,
} from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import { getRequiredEnv } from '@/config/env.loader.js';

export enum LLMProvider {
  OPENAI = 'openai',
  GOOGLE = 'google',
}

export interface LLMConfig {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  streaming?: boolean;
}

interface LLMConfigStreaming extends LLMConfig {
  streaming: true;
}

interface LLMConfigNonStreaming extends LLMConfig {
  streaming?: false;
}

interface CallOptionsBase {
  userMessage: string;
  systemMessage?: string;
}

interface CallOptionsStreaming extends CallOptionsBase {
  config: LLMConfigStreaming;
}

interface CallOptionsNonStreaming extends CallOptionsBase {
  config?: LLMConfigNonStreaming;
}

type CallOptions = CallOptionsStreaming | CallOptionsNonStreaming;

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  [LLMProvider.OPENAI]: 'gpt-4o-mini',
  [LLMProvider.GOOGLE]: 'gemini-2.0-flash',
};

const API_KEY_ENV: Record<LLMProvider, string> = {
  [LLMProvider.OPENAI]: 'OPENAI_API_KEY',
  [LLMProvider.GOOGLE]: 'GOOGLE_API_KEY',
};

/**
 * Creates an LLM instance based on the provider
 */
function createLLMInstance(config: Required<LLMConfig>): BaseChatModel {
  const apiKey = getRequiredEnv(API_KEY_ENV[config.provider]);

  switch (config.provider) {
    case LLMProvider.OPENAI:
      return new ChatOpenAI({
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        timeout: config.timeout,
        maxRetries: config.maxRetries,
        apiKey,
      });

    case LLMProvider.GOOGLE:
      return new ChatGoogleGenerativeAI({
        model: config.model,
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        maxRetries: config.maxRetries,
        apiKey,
      });

    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

// Function overloads for type-safe returns
export async function call_llm_model(
  options: CallOptionsStreaming
): Promise<IterableReadableStream<AIMessageChunk>>;

export async function call_llm_model(
  options: CallOptionsNonStreaming
): Promise<AIMessageChunk>;

export async function call_llm_model(
  options: CallOptions
): Promise<AIMessageChunk | IterableReadableStream<AIMessageChunk>>;

/**
 * Generic function to call any LLM provider
 */
export async function call_llm_model(
  options: CallOptions
): Promise<AIMessageChunk | IterableReadableStream<AIMessageChunk>> {
  const { userMessage, systemMessage, config } = options;

  const provider = config?.provider || LLMProvider.GOOGLE;
  const defaultModel = DEFAULT_MODELS[provider];

  const finalConfig: Required<LLMConfig> = {
    provider,
    model: config?.model || defaultModel,
    temperature: config?.temperature ?? 0.1,
    maxTokens: config?.maxTokens ?? 1000,
    timeout: config?.timeout ?? 10000,
    maxRetries: config?.maxRetries ?? 2,
    streaming: config?.streaming ?? false,
  };

  const llm = createLLMInstance(finalConfig);

  const messages = [];
  if (systemMessage) {
    messages.push(new SystemMessage(systemMessage));
  }
  messages.push(new HumanMessage(userMessage));

  if (finalConfig.streaming) {
    return llm.stream(messages);
  } else {
    return llm.invoke(messages);
  }
}
