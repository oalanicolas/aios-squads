#!/usr/bin/env python3
"""
Obsidian Help Documentation Scraper
Downloads markdown content and screenshots from help.obsidian.md
for use in course materials.
"""

import os
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
import json
from pathlib import Path

class ObsidianHelpScraper:
    def __init__(self, output_dir="downloads/obsidian-help"):
        self.base_url = "https://help.obsidian.md"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.images_dir = self.output_dir / "images"
        self.images_dir.mkdir(exist_ok=True)
        self.downloaded_images = set()

    def get_page(self, url):
        """Fetch page content"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"❌ Error fetching {url}: {e}")
            return None

    def download_image(self, img_url, context=""):
        """Download an image and return local path"""
        if img_url in self.downloaded_images:
            return self.get_image_filename(img_url)

        try:
            # Make URL absolute
            if not img_url.startswith('http'):
                img_url = urljoin(self.base_url, img_url)

            # Get image
            response = requests.get(img_url, timeout=30)
            response.raise_for_status()

            # Generate filename
            filename = self.get_image_filename(img_url)
            filepath = self.images_dir / filename

            # Save
            with open(filepath, 'wb') as f:
                f.write(response.content)

            self.downloaded_images.add(img_url)
            print(f"✅ Downloaded: {filename}")
            return filename

        except Exception as e:
            print(f"❌ Error downloading image {img_url}: {e}")
            return None

    def get_image_filename(self, url):
        """Generate filename from URL"""
        parsed = urlparse(url)
        path = parsed.path
        filename = os.path.basename(path)

        # Add context if available
        if not filename or filename == '':
            filename = "image.png"

        return filename

    def scrape_help_page(self, path, save_as=None):
        """Scrape specific help page"""
        url = urljoin(self.base_url, path)
        print(f"\n📥 Scraping: {url}")

        html = self.get_page(url)
        if not html:
            return None

        soup = BeautifulSoup(html, 'html.parser')

        # Find main content area
        content = soup.find('article') or soup.find('main') or soup.find(class_='markdown-body')

        if not content:
            print("⚠️  Could not find main content")
            return None

        # Extract and download images
        images = content.find_all('img')
        image_references = []

        for img in images:
            src = img.get('src')
            alt = img.get('alt', '')

            if src:
                local_filename = self.download_image(src, alt)
                if local_filename:
                    image_references.append({
                        'original_url': src,
                        'local_path': f"images/{local_filename}",
                        'alt_text': alt,
                        'context': img.get('title', '')
                    })
                    # Replace img tag with markdown reference
                    img.replace_with(f"\n![{alt}](images/{local_filename})\n")

        # Get text content
        # Remove navigation, footer, etc
        for unwanted in content.find_all(['nav', 'footer', 'aside']):
            unwanted.decompose()

        # Convert to text (preserve some structure)
        text_content = content.get_text('\n', strip=True)

        # Save markdown
        if save_as:
            output_file = self.output_dir / f"{save_as}.md"
        else:
            output_file = self.output_dir / f"{path.replace('/', '_')}.md"

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(f"# Source: {url}\n\n")
            f.write(text_content)

        # Save metadata
        metadata = {
            'url': url,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'images': image_references
        }

        metadata_file = output_file.with_suffix('.json')
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)

        print(f"✅ Saved to: {output_file}")
        print(f"📊 Images downloaded: {len(image_references)}")

        return {
            'content': text_content,
            'images': image_references,
            'metadata': metadata
        }

    def scrape_course_relevant_pages(self):
        """Scrape pages relevant to our Obsidian course"""

        pages = [
            # Module 1: Fundamentals
            ('Getting started/Download and install Obsidian', 'installation'),
            ('Getting started/Create a vault', 'vault-creation'),
            ('User interface/Workspace/Ribbon', 'interface-ribbon'),
            ('User interface/Workspace/Sidebar', 'interface-sidebar'),

            # Module 2: Writing
            ('Editing and formatting/Basic formatting syntax', 'markdown-basics'),
            ('Editing and formatting/Advanced formatting syntax', 'markdown-advanced'),
            ('Editing and formatting/Embed files', 'embed-files'),

            # Module 3: Organization
            ('Files and folders/Manage files', 'manage-files'),
            ('Editing and formatting/Tags', 'tags'),
            ('Editing and formatting/Properties', 'properties'),
            ('Plugins/Search', 'search'),

            # Module 4: Links and Graph
            ('Linking notes and files/Internal links', 'internal-links'),
            ('Plugins/Graph view', 'graph-view'),
            ('Plugins/Canvas', 'canvas'),

            # Module 5: Plugins
            ('Extending Obsidian/Community plugins', 'community-plugins'),
            ('Plugins/Templates', 'templates'),

            # Module 6: Workflows
            ('Plugins/Daily notes', 'daily-notes'),
            ('Import/Import data', 'import-data'),
        ]

        results = []
        for page_path, save_name in pages:
            result = self.scrape_help_page(page_path, save_name)
            if result:
                results.append(result)
            time.sleep(2)  # Be polite

        # Save summary
        summary = {
            'total_pages': len(results),
            'total_images': sum(len(r['images']) for r in results),
            'pages': [r['metadata'] for r in results]
        }

        with open(self.output_dir / 'SCRAPE_SUMMARY.json', 'w') as f:
            json.dump(summary, f, indent=2)

        print(f"\n✅ COMPLETE!")
        print(f"📄 Pages scraped: {len(results)}")
        print(f"🖼️  Images downloaded: {sum(len(r['images']) for r in results)}")
        print(f"📂 Output: {self.output_dir}")

        return results

def main():
    """Main execution"""
    print("🚀 Obsidian Help Scraper")
    print("=" * 50)

    # Create output directory
    output_dir = "downloads/obsidian-help"

    scraper = ObsidianHelpScraper(output_dir)
    scraper.scrape_course_relevant_pages()

    print("\n✅ Done! Check the downloads/obsidian-help folder")

if __name__ == "__main__":
    main()
