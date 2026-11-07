/**
 * All copy for the Funky Fox About Us page lives in this single file,
 * so text and imagery can be updated easily while the brand story
 * and product range are finalized.
 */
export const aboutPageContent = {
  /** Page heading (intro section) */
  heading: "About Funky Fox",

  /** Short introduction: who we are and what we sell */
  intro: [
    "Funky Fox is an independent clothing brand built on a simple idea: clothes should feel as good as they look. We design apparel for everyday life — comfortable, well-made pieces with a playful streak that lets your personality show through.",
    "From our studio to your wardrobe, we care about honest materials, easy fits, and designs you will reach for again and again.",
  ],

  /** "What We Sell" section */
  whatWeSell: {
    eyebrow: "What We Sell",
    heading: "Made for Your Style.",
    lead: "Explore clothing that brings together everyday comfort, personal style, and a little Funky Fox attitude.",
    body: "We focus on quality fabrics, considered fits, and versatile designs made to be worn and re-worn — pieces that work as hard as you do and always feel like you.",
    images: {
      main: {
        src: "https://images.pexels.com/photos/9594682/pexels-photo-9594682.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1050&w=1400",
        alt: "Casual garments hanging on a minimal clothing rack against a white wall",
      },
      secondary: {
        src: "https://images.pexels.com/photos/30569741/pexels-photo-30569741.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
        alt: "Neatly folded knitwear stacked in warm neutral tones",
      },
    },
  },

  /** "Quality & Value" section */
  qualityValue: {
    eyebrow: "Style Within Reach",
    heading: "Quality You Can Feel. Style You Can Own.",
    body: "We believe great style should feel good and fit your budget. Explore our collection and find pieces that match your personality without making shopping complicated.",
    image: {
      src: "https://images.pexels.com/photos/10133274/pexels-photo-10133274.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=960",
      alt: "Close-up of neatly folded denim showing fabric texture and color",
    },
  },

  /** "Find Us" section */
  findUs: {
    eyebrow: "Find Us",
    heading: "Rooted Locally. Ready for You.",
    body: "Funky Fox brings its collection to customers who love expressing themselves through style. Visit our location or explore our collection online.",
    location: { lat: 16.5168591, lng: 80.628406 },
    linkLabel: "Open in Google Maps",
  },

  /** "Shopping With Confidence" section */
  shoppingConfidence: {
    eyebrow: "Customer Experience",
    heading: "Shopping With Confidence",
    body: "From exploring our collection to placing your order, we want your shopping experience to feel simple, clear, and convenient.",
    /** `icon` must be one of the keys defined in ShoppingConfidence.tsx: "explore" | "pricing" | "help" */
    points: [
      {
        icon: "explore",
        title: "Easy to Explore",
        description: "Browse our clothing collection and find styles that suit you.",
      },
      {
        icon: "pricing",
        title: "Clear Pricing",
        description: "See product prices before placing your order.",
      },
      {
        icon: "help",
        title: "Here to Help",
        description: "Have a question? Reach out to our team for assistance.",
      },
    ],
  },

  /**
   * "Founder" section — replace `name`, `introduction`, and `portrait`
   * once the final founder details and photograph are ready.
   */
  founder: {
    eyebrow: "Behind the Brand",
    name: "Syed Mehaboob",
    role: "Founder, Funky Fox",
    introduction: [
      "Funky Fox started with a simple belief: everyday clothing should feel comfortable, look considered, and let your personality come through without trying too hard.",
      "Every piece we bring into the collection is chosen with care for how it wears in real life — easy to style, honest in quality, and made to feel like yours from the very first wear.",
    ],
    portrait: {
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=900&h=1200",
      alt: "Syed Mehaboob, Founder of Funky Fox",
    },
  },
} as const;
