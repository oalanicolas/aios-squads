#!/usr/bin/env node
/**
 * Blog Post Discovery CLI
 * Discovers blog posts using smart rules and generates sources YAML
 *
 * Usage:
 *   node discover-blog-posts.js <blog-url> [output-file]
 *
 * Example:
 *   node discover-blog-posts.js https://blog.samaltman.com sam-blog-sources.yaml
 */

import { BlogDiscovery } from './scripts/utils/blog-discovery.js';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import path from 'path';

async function main() {
  const blogUrl = process.argv[2];
  const outputFile = process.argv[3] || 'discovered-posts.yaml';

  if (!blogUrl) {
    console.error('❌ Usage: node discover-blog-posts.js <blog-url> [output-file]');
    console.error('\nExample:');
    console.error('  node discover-blog-posts.js https://blog.samaltman.com sam-blog-sources.yaml');
    process.exit(1);
  }

  console.log('🔍 Blog Post Discovery');
  console.log(`📍 Blog URL: ${blogUrl}`);
  console.log(`📄 Output: ${outputFile}\n`);

  try {
    // Initialize discovery
    const discovery = new BlogDiscovery({
      minPostsForFilter: 50,
      yearsToCapture: 3
    });

    // Discover posts
    console.log('⏳ Discovering posts...\n');
    const posts = await discovery.discoverPosts(blogUrl);

    if (posts.length === 0) {
      console.error('❌ No posts found!');
      process.exit(1);
    }

    // Generate sources YAML
    const sourcesData = discovery.generateSourcesYAML(posts, {
      idPrefix: path.basename(blogUrl).replace(/[^a-z0-9]/gi, '-')
    });

    // Save to file
    const yamlContent = yaml.dump(sourcesData, {
      indent: 2,
      lineWidth: 120,
      noRefs: true
    });

    await fs.writeFile(outputFile, yamlContent, 'utf-8');

    // Summary
    console.log('\n📊 Discovery Summary:');
    console.log(`   Total posts: ${sourcesData.sources.length}`);
    console.log(`   Featured: ${sourcesData.sources.filter(s => s.featured).length}`);
    console.log(`   Rules applied: ${sourcesData.metadata.rules_applied.join(', ')}`);
    console.log(`\n✅ Sources saved to: ${outputFile}`);

    // Show first 5 posts
    console.log('\n📝 First 5 posts:');
    sourcesData.sources.slice(0, 5).forEach((source, i) => {
      const featured = source.featured ? ' ⭐' : '';
      console.log(`   ${i + 1}. ${source.title}${featured}`);
      console.log(`      ${source.url}`);
    });

    if (sourcesData.sources.length > 5) {
      console.log(`   ... and ${sourcesData.sources.length - 5} more`);
    }

    console.log('\n🚀 Next step:');
    console.log(`   node run-collection.js ${outputFile} <output-dir>\n`);

  } catch (error) {
    console.error(`\n❌ Discovery failed: ${error.message}`);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
