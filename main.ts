import { readdir, readFile } from 'fs/promises';
import { resolve } from 'path';

async function getAllFilePathsInside(directoryPath: string): Promise<string[]> {
  const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
  const pathsToFiles = await Promise.all(
    directoryEntries.map(async (directoryEntry) => {
      const resolvedPath = resolve(directoryPath, directoryEntry.name);
      return directoryEntry.isDirectory()
        ? await getAllFilePathsInside(resolvedPath)
        : resolvedPath;
    })
  );
  return pathsToFiles.flat();
}



const orphanedImageCandidatesDir = '/_/l/images/badly_named_imported_from_notion/';
const importedNotionDir = '/_/l/Notion/';

// Step 1: Load list of all files inside image directory
const orphanedImageFilenameCandidates = await readdir(orphanedImageCandidatesDir);

// Step 2.1: Load recursively all files' paths from Notion directory
const importedMdDocumentsFilePaths = await getAllFilePathsInside(importedNotionDir);
// console.log('file: main.ts:35 ~ notionFiles:', notionFiles);

if (importedMdDocumentsFilePaths.some(filename => !filename.endsWith('.md'))) {
  throw new Error('Notion directory contains files that are not markdown files');
}

// Step 2.2: Read all contents of those files into one single variable as string
let allNotionDocumentsContentsCombined = '';

for (const mdFilePath of importedMdDocumentsFilePaths) {
  allNotionDocumentsContentsCombined += await readFile(mdFilePath, 'utf-8');
}

console.log('Length of all notion documents contents combined:', allNotionDocumentsContentsCombined.length);

// Step 2.3: Loop over all file names from step 1 and check if every image's filename found in the combined string
const orphanedImageFilenames: string[] = orphanedImageFilenameCandidates
  .filter(filename => !allNotionDocumentsContentsCombined.includes(filename));

// Step 3: Log the result
console.log('Orphaned image filenames:', orphanedImageFilenames);
