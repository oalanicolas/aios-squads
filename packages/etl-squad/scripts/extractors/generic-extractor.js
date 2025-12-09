/**
 * Generic Extractor
 * Fallback extractor using Mozilla Readability
 * Works for any article/blog when platform-specific extractor not available
 */

import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { ArticleExtractor } from './article-extractor.js';

export class GenericExtractor extends ArticleExtractor {
  constructor() {
    super('generic');
  }

  /**
   * Extract using Readability algorithm
   */
  async extract(url, html) {
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document, {
      charThreshold: 100,
      keepClasses: false
    });

    const article = reader.parse();

    if (!article) {
      throw new Error('Readability failed to extract article content');
    }

    // Remove images from content
    const cleanedContent = this._removeImages(article.content);

    return {
      url,
      platform: this.platform,
      html: cleanedContent,
      metadata: {
        url,
        platform: 'generic',
        title: article.title,
        author: article.byline,
        excerpt: article.excerpt,
        length: article.length,
        site_name: article.siteName,
        extraction_method: 'readability'
      },
      raw_html: html
    };
  }

  /**
   * Remove images but keep alt text
   */
  _removeImages(html) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    doc.querySelectorAll('img').forEach(img => {
      const alt = img.alt;
      if (alt && alt.trim()) {
        const placeholder = doc.createElement('p');
        placeholder.innerHTML = `<em>[Image: ${alt.trim()}]</em>`;
        img.replaceWith(placeholder);
      } else {
        img.remove();
      }
    });

    doc.querySelectorAll('figure, picture').forEach(el => el.remove());

    return doc.body.innerHTML;
  }
}

export default GenericExtractor;
