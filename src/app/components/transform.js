const fs = require('fs');

let content = fs.readFileSync('c:/Users/HarishKumarMahto/source/repos/HUL_Global_Claims_Management/src/app/components/AdvancedProjectSearch.tsx', 'utf-8');

// Replace Product specific imports with Project ones
content = content.replace(
  /import \{\n\s*ProductItem,[\s\S]*?\} from '\.\/productData';/,
  `import type { Project as ProjectItem } from '../types';\nimport { initialProjects } from '../types';`
);

// Remove specific product enums and replace with simpler ones or use existing ones
content = content.replace(/const SEARCH_COLUMNS = \[[\s\S]*?\];/, `const SEARCH_COLUMNS = [
  { id: 'name', label: 'Project Name' },
  { id: 'projectId', label: 'Project ID' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'businessGroup', label: 'Business Group' },
  { id: 'category', label: 'Category' },
];`);

content = content.replace(/const ENUM_VALUES: Record<string, string\[\]> = \{[\s\S]*?\};/, `const ENUM_VALUES: Record<string, string[]> = {
  businessGroup: BUSINESS_GROUPS,
  category: Object.values(CATEGORIES).flat(),
};`);

content = content.replace(/interface AdvancedProductSearchProps/g, 'interface AdvancedProjectSearchProps');
content = content.replace(/AdvancedProductSearchProps/g, 'AdvancedProjectSearchProps');
content = content.replace(/AdvancedProductSearch/g, 'AdvancedProjectSearch');
content = content.replace(/initialProducts/g, 'initialProjects');
content = content.replace(/onCreateProduct/g, 'onCreateProject');
content = content.replace(/ProductType/g, 'string');
content = content.replace(/ProductItem/g, 'ProjectItem');
content = content.replace(/selectedProducts/g, 'selectedProjects');

// Replace table columns
content = content.replace(/\[\s*\{\s*id: 'name', label: 'Product Name' \},[\s\S]*?\].map\(col => \(/, `[
                    { id: 'name', label: 'Project Name' },
                    { id: 'projectId', label: 'Project ID' },
                    { id: 'type', label: 'Type' },
                    { id: 'status', label: 'Status' },
                    { id: 'businessGroup', label: 'Business Group' },
                  ].map(col => (`);

// Replace table row
content = content.replace(/const lcStyle = getLifecycleBadgeStyle\(product.lifecycleState\);[\s\S]*?<\!-- Type -->/g, ''); // Wait, regex might fail here.

fs.writeFileSync('c:/Users/HarishKumarMahto/source/repos/HUL_Global_Claims_Management/src/app/components/AdvancedProjectSearch.tsx', content);
console.log('done');
