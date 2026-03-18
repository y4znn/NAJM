import { CATEGORIES, type Category } from '@/types/intelligence';

const MAX_QUESTION_LENGTH = 1000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_ANSWER_LENGTH = 5000;

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

export function sanitizeInput(input: string, maxLength = MAX_MESSAGE_LENGTH): string {
  return stripHtml(input).trim().slice(0, maxLength);
}

export function sanitizeQuestion(input: string): string {
  return sanitizeInput(input, MAX_QUESTION_LENGTH);
}

export function sanitizeAnswer(input: string): string {
  return sanitizeInput(input, MAX_ANSWER_LENGTH);
}

export function sanitizeAmount(value: string): number | null {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

export function validateCategory(cat: string): cat is Category {
  return CATEGORIES.includes(cat as Category);
}
