import { describe, it, expect } from 'vitest';
import { 
  formatFolderName, 
  toKebabCase, 
  toPascalCase, 
  toConstantCase, 
  toCamelCase 
} from './utils.js';

describe('Utils', () => {
  describe('formatFolderName', () => {
    it('should format correctly', () => {
      expect(formatFolderName('Test Name')).toBe('test-name');
      expect(formatFolderName('  Test@Name  ')).toBe('testname');
      expect(formatFolderName('test-name')).toBe('test-name');
    });
  });

  describe('toKebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(toKebabCase('TestName')).toBe('test-name');
      expect(toKebabCase('testName')).toBe('test-name');
      expect(toKebabCase('Test Name')).toBe('test-name');
      expect(toKebabCase('test_name')).toBe('test-name');
    });
  });

  describe('toPascalCase', () => {
    it('should convert to PascalCase', () => {
      expect(toPascalCase('test-name')).toBe('TestName');
      expect(toPascalCase('test_name')).toBe('TestName');
      expect(toPascalCase('test name')).toBe('TestName');
      expect(toPascalCase('testName')).toBe('TestName');
    });
  });

  describe('toConstantCase', () => {
    it('should convert to CONSTANT_CASE', () => {
      expect(toConstantCase('test-name')).toBe('TEST_NAME');
      expect(toConstantCase('test name')).toBe('TEST_NAME');
      expect(toConstantCase('testName')).toBe('TEST_NAME');
    });
  });

  describe('toCamelCase', () => {
    it('should convert to camelCase', () => {
      expect(toCamelCase('test-name')).toBe('testName');
      expect(toCamelCase('test_name')).toBe('testName');
      expect(toCamelCase('TestName')).toBe('testName');
    });
  });
});
