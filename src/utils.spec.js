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

import fs from 'fs';
import { vi, afterEach } from 'vitest';
import { getAvailableModules, getAngularMajorVersion, isAngularProject } from './utils.js';

describe('File System Utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAvailableModules', () => {
    it('should return empty array if features folder does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      expect(getAvailableModules()).toEqual([]);
    });

    it('should return only directories within features', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readdirSync').mockReturnValue(['auth', 'dashboard', 'file.txt']);
      vi.spyOn(fs, 'statSync').mockImplementation((pathStr) => ({
        isDirectory: () => !pathStr.endsWith('.txt')
      }));
      
      expect(getAvailableModules()).toEqual(['auth', 'dashboard']);
    });
  });

  describe('getAngularMajorVersion', () => {
    it('should return 0 if package.json does not exist', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(false);
      expect(getAngularMajorVersion()).toBe(0);
    });

    it('should parse version from dependencies', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        dependencies: { '@angular/core': '^18.2.0' }
      }));
      expect(getAngularMajorVersion()).toBe(18);
    });

    it('should parse version from devDependencies', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        devDependencies: { '@angular/core': '~17.1.0' }
      }));
      expect(getAngularMajorVersion()).toBe(17);
    });
  });

  describe('isAngularProject', () => {
    it('should return false if angular.json is missing', () => {
      vi.spyOn(fs, 'existsSync').mockImplementation(pathStr => !pathStr.includes('angular.json'));
      expect(isAngularProject()).toBe(false);
    });

    it('should return false if package.json has no @angular/core', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ dependencies: {} }));
      expect(isAngularProject()).toBe(false);
    });

    it('should return true if angular.json exists and package.json contains @angular/core', () => {
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
        dependencies: { '@angular/core': '^18.0.0' }
      }));
      expect(isAngularProject()).toBe(true);
    });
  });
});
