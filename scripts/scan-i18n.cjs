const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files
function findFiles(dir, extensions = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip node_modules and other irrelevant directories
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        results = results.concat(findFiles(filePath, extensions));
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to extract hardcoded strings and t() calls
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const hardcodedStrings = [];
  const translationKeys = [];
  
  lines.forEach((line, index) => {
    // Find hardcoded strings (text in quotes that's not a translation key)
    const stringMatches = line.match(/["']([^"']*[A-Za-z][^"']*)["']/g);
    if (stringMatches) {
      stringMatches.forEach(match => {
        const text = match.slice(1, -1); // Remove quotes
        // Skip if it's a translation key, className, or other technical strings
        if (!text.includes('t(') && 
            !text.includes('className') && 
            !text.includes('id=') &&
            !text.includes('type=') &&
            !text.includes('placeholder=') &&
            text.length > 2 &&
            /[A-Za-z]/.test(text)) {
          hardcodedStrings.push({
            file: filePath,
            line: index + 1,
            text: text
          });
        }
      });
    }
    
    // Find translation keys
    const tMatches = line.match(/t\(['"]([^'"]+)['"]\)/g);
    if (tMatches) {
      tMatches.forEach(match => {
        const key = match.match(/t\(['"]([^'"]+)['"]\)/)[1];
        translationKeys.push({
          file: filePath,
          line: index + 1,
          key: key
        });
      });
    }
  });
  
  return { hardcodedStrings, translationKeys };
}

// Main analysis
const srcDir = path.join(__dirname, '../src');
const files = findFiles(srcDir);

console.log('🔍 Scanning for i18n usage...\n');

const allHardcodedStrings = [];
const allTranslationKeys = [];

files.forEach(file => {
  const analysis = analyzeFile(file);
  allHardcodedStrings.push(...analysis.hardcodedStrings);
  allTranslationKeys.push(...analysis.translationKeys);
});

// Group hardcoded strings by file
const hardcodedByFile = {};
allHardcodedStrings.forEach(item => {
  if (!hardcodedByFile[item.file]) {
    hardcodedByFile[item.file] = [];
  }
  hardcodedByFile[item.file].push(item);
});

// Group translation keys by file
const translationKeysByFile = {};
allTranslationKeys.forEach(item => {
  if (!translationKeysByFile[item.file]) {
    translationKeysByFile[item.file] = [];
  }
  translationKeysByFile[item.file].push(item);
});

// Find files with hardcoded strings but no translations
const filesNeedingTranslation = Object.keys(hardcodedByFile).filter(file => {
  const hasHardcoded = hardcodedByFile[file].length > 0;
  const hasTranslations = translationKeysByFile[file] && translationKeysByFile[file].length > 0;
  return hasHardcoded && !hasTranslations;
});

console.log('📊 Analysis Results:');
console.log(`Total files scanned: ${files.length}`);
console.log(`Files with hardcoded strings: ${Object.keys(hardcodedByFile).length}`);
console.log(`Files with translations: ${Object.keys(translationKeysByFile).length}`);
console.log(`Files needing translation: ${filesNeedingTranslation.length}\n`);

// Display files that need translation
if (filesNeedingTranslation.length > 0) {
  console.log('🚨 Files that need i18n translation:');
  filesNeedingTranslation.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    console.log(`\n📁 ${relativePath}`);
    const hardcoded = hardcodedByFile[file];
    hardcoded.slice(0, 5).forEach(item => { // Show first 5
      console.log(`   Line ${item.line}: "${item.text}"`);
    });
    if (hardcoded.length > 5) {
      console.log(`   ... and ${hardcoded.length - 5} more`);
    }
  });
}

// Display files with both hardcoded strings and translations (partial translation)
const partiallyTranslatedFiles = Object.keys(hardcodedByFile).filter(file => {
  const hasHardcoded = hardcodedByFile[file].length > 0;
  const hasTranslations = translationKeysByFile[file] && translationKeysByFile[file].length > 0;
  return hasHardcoded && hasTranslations;
});

if (partiallyTranslatedFiles.length > 0) {
  console.log('\n⚠️  Files with partial translation:');
  partiallyTranslatedFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file);
    const hardcoded = hardcodedByFile[file];
    const translations = translationKeysByFile[file];
    console.log(`\n📁 ${relativePath}`);
    console.log(`   Hardcoded strings: ${hardcoded.length}`);
    console.log(`   Translation keys: ${translations.length}`);
  });
}

console.log('\n✅ Scan complete!');
