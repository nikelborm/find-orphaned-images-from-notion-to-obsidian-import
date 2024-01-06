import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';

async function getFiles(dir: string): Promise<string[]> {
  const dirents = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? await getFiles(res) : res;
    })
  );
  return files.flat();
}



const imageDir = '/_/l/images/badly_named_imported_from_notion/';
const notionDir = '/_/l/Notion/';

// Step 1: Load list of all files inside image directory
const imageFiles = await readdir(imageDir);

// Step 2: Initialize empty array for orphaned image filenames
const orphanedFiles: string[] = [];

// Step 3.1: Load recursively all files' paths from Notion directory
const notionFiles = await getFiles(notionDir);
// console.log('file: main.ts:35 ~ notionFiles:', notionFiles);

// write a check if there are files that have file extension other than md throw error
if (notionFiles.some(file => !file.endsWith('.md'))) {
  throw new Error('Notion directory contains files that are not markdown files');
}

// Step 3.2: Read all contents of those files into one single variable as string
let combinedString = '';
for (const file of notionFiles) {
  const content = await readFile(file, 'utf-8');
  combinedString += content;
}

console.log('combinedString.length:', combinedString.length);

// Step 3.3: Loop over all file names from step 1 and check if every image's filename found in the combined string
for (const imageFile of imageFiles) {
  if (!combinedString.includes(imageFile)) {
    orphanedFiles.push(imageFile);
  }
}

console.log('Orphaned image filenames:', orphanedFiles);
