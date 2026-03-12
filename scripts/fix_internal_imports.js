const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');

const originalMapping = {
  // Current relative to componentsDir -> Original relative to componentsDir
  'atoms/Button.tsx': 'Button.tsx',
  'atoms/icons': 'icons',
  'atoms/rupeeIcon': 'rupeeIcon',
  'atoms/AppText.tsx': 'common/AppText.tsx',
  'atoms/AppGradient.tsx': 'common/AppGradient.tsx',

  'molecules/AppInput.tsx': 'common/AppInput.tsx',
  'molecules/SegmentedControl.tsx': 'common/SegmentedControl.tsx',
  'molecules/filterButton': 'filterButton',
  'molecules/dropdown': 'dropdown',
  'molecules/imageUploader': 'imageUploader',
  'molecules/accordion': 'accordion',
  'molecules/MonthYearPicker.tsx': 'MonthYearPicker.tsx',

  'organisms/DonutChart.tsx': 'common/DonutChart.tsx',
  'organisms/Header.tsx': 'Header.tsx',
  'organisms/categorySelector.tsx': 'categorySelector.tsx',
  'organisms/friendSelector': 'friendSelector',
  'organisms/expenseCard': 'expenseCard',
  'organisms/tabs': 'tabs',
  'organisms/customTabBar': 'customTabBar',
  'organisms/paymentMethodSelector': 'paymentMethodSelector',
  'organisms/splitMethodSelector': 'splitMethodSelector',
  'organisms/premiumGate': 'premiumGate',
  'organisms/accountOptions': 'accountOptions',
  'organisms/calendar': 'calendar',
  'organisms/modal': 'modal',
  'organisms/form': 'form',
  'organisms/CustomDrawerContent.tsx': 'CustomDrawerContent.tsx',
};

function getOriginalPath(currentAbsPath) {
  let relToComponents = path.relative(componentsDir, currentAbsPath);
  let keys = Object.keys(originalMapping).sort((a, b) => b.length - a.length);

  for (let currentKey of keys) {
    if (
      relToComponents === currentKey ||
      relToComponents.startsWith(currentKey + '/')
    ) {
      let originalKey = originalMapping[currentKey];
      let remainder = relToComponents.substring(currentKey.length);
      let origPath = path.join(componentsDir, originalKey + remainder);
      return origPath;
    }
  }
  return currentAbsPath;
}

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

const newMapping = {
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

const componentsFiles = getFiles(componentsDir);

componentsFiles.forEach(file => {
  let origPath = getOriginalPath(file);
  let content = fs.readFileSync(file, 'utf-8');
  let updated = false;

  const importRegex = /(from\s+|import\s*\(?\s*)(['"])([^'"]+)(['"])/g;

  content = content.replace(
    importRegex,
    (match, prefix, quote1, importPath, quote2) => {
      if (importPath.startsWith('.')) {
        let resolvedTarget = path.resolve(path.dirname(origPath), importPath);

        if (resolvedTarget.startsWith(componentsDir)) {
          let relTarget = path.relative(componentsDir, resolvedTarget);
          relTarget = relTarget.replace(/\.tsx?$|\.jsx?$/, '');

          let matchedKey = '';
          for (let key of Object.keys(newMapping)) {
            if (relTarget === key || relTarget.startsWith(key + '/')) {
              if (key.length > matchedKey.length) {
                matchedKey = key;
              }
            }
          }
          if (matchedKey) {
            let aliasPrefix = `@${newMapping[matchedKey]}`;
            let baseName = path.basename(matchedKey);
            let suffix = relTarget.substring(matchedKey.length);
            let replacement = `${aliasPrefix}/${baseName}${suffix}`;

            if (replacement !== importPath) {
              updated = true;
              return `${prefix}${quote1}${replacement}${quote2}`;
            }
          }
        }

        let newRelPath = path.relative(path.dirname(file), resolvedTarget);
        if (!newRelPath.startsWith('.')) {
          newRelPath = './' + newRelPath;
        }

        if (newRelPath !== importPath) {
          updated = true;
          return `${prefix}${quote1}${newRelPath}${quote2}`;
        }
      }
      return match;
    },
  );

  if (updated) {
    fs.writeFileSync(file, content);
    console.log(
      `Updated internal imports in: ${path.relative(componentsDir, file)}`,
    );
  }
});

console.log('Internal components imports fixed!');
