export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  guid?: string;
}

export function cleanCDATA(str: string): string {
  if (!str) return "";
  // Strip CDATA wrapper if present: <![CDATA[ content ]]>
  let cleaned = str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  // Clean basic HTML tags to keep text content readable and safe
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, "");
  // Trim spaces and decode common XML entities
  return cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

export function parseRSS(xmlText: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Find all <item> ... </item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    
    // Extract individual fields using regex
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const descMatch = itemContent.match(/<description>([\s\S]*?)<\/description>/);
    const guidMatch = itemContent.match(/<guid[^>]*>([\s\S]*?)<\/guid>/);
    
    if (titleMatch && linkMatch) {
      const title = cleanCDATA(titleMatch[1]);
      const link = cleanCDATA(linkMatch[1]);
      const pubDate = pubDateMatch ? cleanCDATA(pubDateMatch[1]) : new Date().toISOString();
      const description = descMatch ? cleanCDATA(descMatch[1]) : "";
      const guid = guidMatch ? cleanCDATA(guidMatch[1]) : undefined;
      
      items.push({
        title,
        link,
        pubDate,
        description,
        guid
      });
    }
  }
  
  return items;
}
