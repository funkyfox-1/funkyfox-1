import * as React from 'react';

export interface ProductStructuredData {
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  price: number;
  currency?: string;
  inStock?: boolean;
  category?: string;
  url?: string;
}

export interface SEOHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product';
  product?: ProductStructuredData;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  product,
}) => {
  React.useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title.includes('Funky Fox') ? title : `${title} | Funky Fox`;
    }

    // 2. Meta description
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', description);
    }

    // 3. Canonical URL
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // 4. OpenGraph tags
    const updateOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (title) updateOg('og:title', title);
    if (description) updateOg('og:description', description);
    if (canonicalUrl) updateOg('og:url', canonicalUrl);
    if (ogImage) updateOg('og:image', ogImage);
    updateOg('og:type', ogType);

    // 5. Product JSON-LD Structured Data
    const scriptId = 'ff-json-ld-product';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    if (product) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      const schemaData = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description || `${product.name} - Everyday menswear essentials by Funky Fox India.`,
        image: product.image ? [product.image] : [],
        sku: product.sku || product.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        brand: {
          '@type': 'Brand',
          name: 'Funky Fox',
        },
        offers: {
          '@type': 'Offer',
          url: product.url || canonicalUrl || window.location.href,
          priceCurrency: product.currency || 'INR',
          price: product.price,
          availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Funky Fox Menswear',
          },
        },
      };
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [title, description, canonicalUrl, ogImage, ogType, product]);

  return null;
};

