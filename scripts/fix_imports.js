const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');

const mapping = {
  // exact matches (ignoring extensions)
  Button: 'atoms',
  icons: 'atoms',
  rupeeIcon: 'atoms',
  'common/AppText': 'atoms/AppText',
  'common/AppGradient': 'atoms/AppGradient',

  'common/AppInput': 'molecules/AppInput',
  'common/SegmentedControl': 'molecules/SegmentedControl',
  filterButton: 'molecules',
  dropdown: 'molecules',
  imageUploader: 'molecules',
  accordion: 'molecules',
  MonthYearPicker: 'molecules',

  'common/DonutChart': 'organisms/DonutChart',
  Header: 'organisms',
  categorySelector: 'organisms',
  friendSelector: 'organisms',
  expenseCard: 'organisms',
  tabs: 'organisms',
  customTabBar: 'organisms',
  paymentMethodSelector: 'organisms',
  splitMethodSelector: 'organisms',
  premiumGate: 'organisms',
  accountOptions: 'organisms',
  calendar: 'organisms',
  modal: 'organisms',
  form: 'organisms',
  CustomDrawerContent: 'organisms',
};

function getFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, files);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      files.push(filePath);
    }
  }
  return files;
}

const allFiles = getFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let updated = false;

  // Regex to catch imports like: from '../../components/Button' or from '../components/common/AppText'
  // and also catch imports like from './common/AppText' if inside a component

  // We'll replace the full path based on checking mapping
  const importRegex = /from\s+['"]([^'"]+)['"]/g;

  content = content.replace(importRegex, (match, importPath) => {
    // Check if the import path goes to components folder or is within components
    let resolvedPath = '';

    if (importPath.startsWith('.')) {
      resolvedPath = path.resolve(path.dirname(file), importPath);
      // If it resolved inside src/components
      if (resolvedPath.startsWith(componentsDir)) {
        // Find the relative path from components dir
        let relFromComponents = path.relative(componentsDir, resolvedPath);

        // Remove extension if present in relFromComponents (just in case)
        relFromComponents = relFromComponents.replace(/\.tsx?$|\.jsx?$/, '');

        // does relFromComponents match our mapping keys?
        // Since some maps go inside folders (like atoms, molecules), let's see if relFromComponents starts with a mapping key
        // We will find the longest matching key

        let longestKey = '';
        for (let key of Object.keys(mapping)) {
          if (
            relFromComponents === key ||
            relFromComponents.startsWith(key + '/')
          ) {
            // e.g., icons/HomeIcon
            if (key.length > longestKey.length) {
              longestKey = key;
            }
          }
        }

        if (longestKey) {
          let base = mapping[longestKey]; // e.g., 'atoms' or 'atoms/AppText'
          // If base contains a slash, it means we mapped a specific file (like common/AppText -> atoms/AppText)
          // We need to construct the new import.
          // Usually the alias is @atoms or @molecules...

          let kind = base.split('/')[0]; // 'atoms'
          // Create alias prefix
          let aliasPrefix = `@${kind}`;

          let replacement = '';
          if (relFromComponents === longestKey) {
            // exact match, use the mapped path directly
            let aliasPath = base; // e.g., atoms/AppText
            replacement = `@${aliasPath}`;
          } else {
            // it's a subpath, e.g., mapped key 'icons', relFromComponents 'icons/HomeIcon'
            // base is 'atoms', remainder is relFromComponents.substring(longestKey.length) string e.g. '/HomeIcon'
            let aliasPath =
              base + relFromComponents.substring(longestKey.length);
            replacement = `@${aliasPath}`;
          }

          updated = true;
          return `from '${replacement}'`;
        }
      }
    }
    return match;
  });

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in: ${file}`);
  }
});
