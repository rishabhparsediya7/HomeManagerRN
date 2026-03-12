const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');

const mapping = {
  // exact matches (ignoring extensions)
  Button: 'atoms',
  icons: 'atoms',
  rupeeIcon: 'atoms',
  'common/AppText': 'atoms',
  'common/AppGradient': 'atoms',

  'common/AppInput': 'molecules',
  'common/SegmentedControl': 'molecules',
  filterButton: 'molecules',
  dropdown: 'molecules',
  imageUploader: 'molecules',
  accordion: 'molecules',
  MonthYearPicker: 'molecules',

  'common/DonutChart': 'organisms',
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

  // Regex to catch imports like: from '../../components/Button' or import '../../components/Button'
  // Also catches dynamic imports: import('../../components/...')
  const importRegex = /(from\s+|import\s*\(?\s*)(['"])([^'"]+)(['"])/g;

  content = content.replace(
    importRegex,
    (match, prefix, quote1, importPath, quote2) => {
      // Check if the import path goes to components folder or is within components
      let resolvedPath = '';

      if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(path.dirname(file), importPath);
        // If it resolved inside src/components
        if (resolvedPath.startsWith(componentsDir)) {
          // Find the relative path from components dir
          let relFromComponents = path.relative(componentsDir, resolvedPath);

          // Remove extension if present in relFromComponents
          relFromComponents = relFromComponents.replace(/\.tsx?$|\.jsx?$/, '');

          let matchedKey = '';
          for (let key of Object.keys(mapping)) {
            if (
              relFromComponents === key ||
              relFromComponents.startsWith(key + '/')
            ) {
              if (key.length > matchedKey.length) {
                matchedKey = key;
              }
            }
          }

          if (matchedKey) {
            let aliasPrefix = `@${mapping[matchedKey]}`;
            let replacement = '';

            if (relFromComponents === matchedKey) {
              // The alias mapping handles this exact file/folder
              // Usually when mapping e.g. 'common/AppText' -> 'atoms', the actual file is atoms/AppText
              // Wait, our migration script actually put common/AppText into atoms/AppText.
              let baseName = path.basename(matchedKey);
              replacement = `${aliasPrefix}/${baseName}`;
              // UNLESS it's a folder like 'icons' -> 'atoms', and the migration moved 'icons' to 'atoms/icons'
              // Let's verify our migration script logic: targetPath = path.join(..., targetDir, path.basename(item));
              // For common/AppText -> atoms/AppText. So yes, basename is appended.
            } else {
              // it's a subpath inside a folder, e.g., 'icons/HomeIcon'
              // matchedKey 'icons', basename 'icons'.
              // relFromComponents is 'icons/HomeIcon'
              // the migrated file is in atoms/icons/HomeIcon
              // so it resolves to `@atoms/icons/HomeIcon`
              let baseName = path.basename(matchedKey);
              let suffix = relFromComponents.substring(matchedKey.length);
              replacement = `${aliasPrefix}/${baseName}${suffix}`;
            }

            updated = true;
            return `${prefix}${quote1}${replacement}${quote2}`;
          }
        }
      }
      return match;
    },
  );

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Updated imports in: ${path.relative(srcDir, file)}`);
  }
});

// Now delete the proxy files and folders
Object.keys(mapping).forEach(key => {
  // Add extension back if it's a known file from the mapping, since our mapping stripped it for the keys
  // Let's check the actual file system
  const possiblePaths = [
    path.join(componentsDir, key),
    path.join(componentsDir, key + '.tsx'),
    path.join(componentsDir, key + '.ts'),
  ];

  for (let p of possiblePaths) {
    if (fs.existsSync(p)) {
      if (fs.statSync(p).isDirectory()) {
        fs.rmSync(p, {recursive: true, force: true});
        console.log(`Deleted proxy directory: components/${path.basename(p)}`);
      } else {
        fs.unlinkSync(p);
        console.log(`Deleted proxy file: components/${path.basename(p)}`);
      }
    }
  }
});

// clean up common folder if it's empty
const commonDir = path.join(componentsDir, 'common');
if (fs.existsSync(commonDir)) {
  const list = fs.readdirSync(commonDir);
  if (list.length === 0) {
    fs.rmdirSync(commonDir);
    console.log('Deleted empty common directory');
  }
}

console.log('Cleanup and import replacement complete!');
