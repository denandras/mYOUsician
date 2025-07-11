// Utility file with fixes for the dropdown options
const fs = require('fs');
const path = require('path');

// Path to the database page file
const databasePagePath = path.join(
  __dirname,
  'src',
  'app',
  '[locale]',
  'database',
  'page.tsx'
);

// Function to insert the fixes
function insertFix() {
  try {
    // Read the file content
    const content = fs.readFileSync(databasePagePath, 'utf8');

    // Fix for genre dropdown
    let updatedContent = content.replace(
      /<SelectContent>\s*<SelectItem value="any">\{t\('database\.filters\.any'\)\}<\/SelectItem>\s*\{genres\.map\(genre => \(\s*\)\)\}\s*<\/SelectContent>/g,
      `<SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {genres.map(genre => (
                                                <SelectItem key={genre.id} value={genre.name}>
                                                    {getLocalizedName(genre)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>`
    );

    // Fix for instrument dropdown
    updatedContent = updatedContent.replace(
      /<SelectContent>\s*<SelectItem value="any">\{t\('database\.filters\.any'\)\}<\/SelectItem>\s*\{instruments\.map\(instrument => \(\s*\)\)\}\s*<\/SelectContent>/g,
      `<SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {instruments.map(instrument => (
                                                <SelectItem key={instrument.id} value={instrument.name}>
                                                    {getLocalizedName(instrument)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>`
    );

    // Fix for category dropdown
    updatedContent = updatedContent.replace(
      /<SelectContent>\s*<SelectItem value="any">\{t\('database\.filters\.any'\)\}<\/SelectItem>\s*<SelectItem value="artist">\{locale === 'hu' \? 'művész' : 'artist'\}<\/SelectItem>\s*<SelectItem value="teacher">\{locale === 'hu' \? 'tanár' : 'teacher'\}<\/SelectItem>\s*<SelectItem value="student">\{locale === 'hu' \? 'tanuló' : 'student'\}<\/SelectItem>\s*<\/SelectContent>/g,
      `<SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            <SelectItem value="artist">{t('database.categories.artist')}</SelectItem>
                                            <SelectItem value="teacher">{t('database.categories.teacher')}</SelectItem>
                                        </SelectContent>`
    );

    // Fix for sort options dropdown
    updatedContent = updatedContent.replace(
      /<SelectContent>\s*\{sortOptions\.map\(option => \(\s*\)\)\}\s*<\/SelectContent>/g,
      `<SelectContent>
                                            {sortOptions.map(option => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>`
    );

    // Fix for truncated select items
    updatedContent = updatedContent.replace(
      /<SelectContent>\s*<SelectItem value="any"><\/SelectItem>\s*\{genres\.map\(genre => \(\s*\)\)\}\s*<\/SelectContent>/g,
      `<SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {genres.map(genre => (
                                                <SelectItem key={genre.id} value={genre.name}>
                                                    {getLocalizedName(genre)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>`
    );

    // Fix for truncated instrument select items
    updatedContent = updatedContent.replace(
      /<SelectContent>\s*<SelectItem value="any"><\/SelectItem>\s*\{instruments\.map\(instrument => \(\s*\)\)\}\s*<\/SelectContent>/g,
      `<SelectContent>
                                            <SelectItem value="any">{t('database.filters.any')}</SelectItem>
                                            {instruments.map(instrument => (
                                                <SelectItem key={instrument.id} value={instrument.name}>
                                                    {getLocalizedName(instrument)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>`
    );

    // Alternative approach - try to fix each select content section
    let lines = updatedContent.split('\n');

    // Fix for genres
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<SelectTrigger>') && 
          lines[i+1].includes('<SelectValue placeholder={t(\'database.filters.selectGenre\')}') &&
          lines[i+4].includes('genres.map(genre => (')) {
        
        // Found the genres select section
        lines[i+4] = '                                            {genres.map(genre => (';
        lines[i+5] = '                                                <SelectItem key={genre.id} value={genre.name}>';
        lines[i+6] = '                                                    {getLocalizedName(genre)}';
        lines[i+7] = '                                                </SelectItem>';
        lines[i+8] = '                                            ))}';
      }
    }

    // Fix for instruments
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<SelectTrigger>') && 
          lines[i+1].includes('<SelectValue placeholder={t(\'database.filters.selectInstrument\')}') &&
          lines[i+4].includes('instruments.map(instrument => (')) {
        
        // Found the instruments select section
        lines[i+4] = '                                            {instruments.map(instrument => (';
        lines[i+5] = '                                                <SelectItem key={instrument.id} value={instrument.name}>';
        lines[i+6] = '                                                    {getLocalizedName(instrument)}';
        lines[i+7] = '                                                </SelectItem>';
        lines[i+8] = '                                            ))}';
      }
    }

    // Fix for sort options
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('<SelectTrigger>') && 
          lines[i+1].includes('<SelectValue />') &&
          lines[i+4].includes('sortOptions.map(option => (')) {
        
        // Found the sort options select section
        lines[i+4] = '                                            {sortOptions.map(option => (';
        lines[i+5] = '                                                <SelectItem key={option.value} value={option.value}>';
        lines[i+6] = '                                                    {option.label}';
        lines[i+7] = '                                                </SelectItem>';
        lines[i+8] = '                                            ))}';
      }
    }

    const finalContent = lines.join('\n');

    // Write the updated content back to the file
    fs.writeFileSync(databasePagePath, finalContent, 'utf8');

    console.log('Successfully fixed the dropdown options!');
    return true;
  } catch (error) {
    console.error('Error fixing dropdown options:', error);
    return false;
  }
}

module.exports = { insertFix };
