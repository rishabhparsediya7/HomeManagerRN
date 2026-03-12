const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');

const mapping = {
  // atoms
  'Button.tsx': 'atoms',
  icons: 'atoms',
  rupeeIcon: 'atoms',
  'common/AppText.tsx': 'atoms',
  'common/AppGradient.tsx': 'atoms',

  // molecules
  'common/AppInput.tsx': 'molecules',
  'common/SegmentedControl.tsx': 'molecules',
  filterButton: 'molecules',
  dropdown: 'molecules',
  imageUploader: 'molecules',
  accordion: 'molecules',
  'MonthYearPicker.tsx': 'molecules',

  // organisms
  'common/DonutChart.tsx': 'organisms',
  'Header.tsx': 'organisms',
  'categorySelector.tsx': 'organisms',
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
  'CustomDrawerContent.tsx': 'organisms',
};

['atoms', 'molecules', 'organisms'].forEach(dir => {
  const dirPath = path.join(componentsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }
});

for (const [item, targetDir] of Object.entries(mapping)) {
  const sourcePath = path.join(componentsDir, item);
  const targetPath = path.join(componentsDir, targetDir, path.basename(item));

  if (!fs.existsSync(sourcePath)) {
    console.log(`Skipping ${item}, not found.`);
    continue;
  }

  const isFile = fs.statSync(sourcePath).isFile();

  try {
    fs.renameSync(sourcePath, targetPath);
  } catch (e) {
    console.log(`Failed to move ${item}:`, e);
    continue;
  }

  const itemDirname = path.dirname(item);

  if (isFile) {
    let depth = itemDirname === '.' ? 0 : itemDirname.split('/').length;
    let relativeStr =
      depth === 0
        ? `./${targetDir}/${path.parse(item).name}`
        : `${'../'.repeat(depth)}${targetDir}/${path.parse(item).name}`;

    const proxyContent = `export * from '${relativeStr}';\nexport { default } from '${relativeStr}';\n`;
    fs.writeFileSync(sourcePath, proxyContent);
    console.log(`Migrated file: ${item} -> ${targetPath}`);
  } else {
    fs.mkdirSync(sourcePath, {recursive: true});
    let depth = itemDirname === '.' ? 1 : itemDirname.split('/').length + 1;
    let relativeStr = `${'../'.repeat(depth)}${targetDir}/${path.basename(
      item,
    )}`;

    // We add an empty default export in case it doesn't exist, but typically re-exporting default is tricky for folders without default exports.
    // However, if the old folder had an index that exported default, we want to capture it.
    // TypeScript might complain if we "export { default }" and the target has no default.
    // To be safe, let's read the target's index.ts or index.tsx to check for default.
    const targetIndexPath = ['index.ts', 'index.tsx', 'index.js']
      .map(f => path.join(targetPath, f))
      .find(f => fs.existsSync(f));
    let hasDefault = false;
    if (targetIndexPath) {
      const content = fs.readFileSync(targetIndexPath, 'utf-8');
      if (
        content.includes('export default') ||
        content.match(/export\s+\{.*default.*\}/)
      ) {
        hasDefault = true;
      }
    }

    let proxyContent = `export * from '${relativeStr}';\n`;
    if (hasDefault) {
      proxyContent += `export { default } from '${relativeStr}';\n`;
    }

    fs.writeFileSync(path.join(sourcePath, 'index.ts'), proxyContent);
    console.log(`Migrated folder: ${item} -> ${targetPath}`);
  }
}
console.log('Done!');
