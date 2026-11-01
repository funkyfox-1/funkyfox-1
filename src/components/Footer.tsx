import * as React from 'react'
import PushpinTearFooter from './ui/pushpin-tear-footer'

export default function Footer() {
  return (
    <PushpinTearFooter
      brand="funkyfox."
      name="funky fox menswear"
      sheet="#141414"
      paper="#FAF9F6"
      sheetInk="#ffffff"
      paperInk="#191919"
      pinBase="#E87535"
      email="support@funkyfox.in"
      mark="FF / 2026"
      timeZone="Asia/Kolkata"
      timeLabel="IST"
      status={{
        label: "free pan-india delivery over ₹1,499",
        href: "/help?topic=Shipping",
      }}
      columns={[
        {
          title: "shop",
          links: [
            { label: "All Products", href: "/products" },
            { label: "T-Shirts", href: "/products?category=T-Shirts" },
            { label: "Shirts", href: "/products?category=Shirts" },
            { label: "Trousers & Jeans", href: "/products?category=Trousers%20%26%20Jeans" },
            { label: "Jackets", href: "/products?category=Jackets" },
          ],
          cta: { label: "shop.", href: "/products" },
        },
        {
          title: "help",
          links: [
            { label: "Contact Us", href: "/help#contact" },
            { label: "Shipping Info", href: "/help?topic=Shipping" },
            { label: "Returns & Exchanges", href: "/help?topic=Returns%20%26%20Exchanges" },
            { label: "FAQs", href: "/#faq" },
          ],
          cta: { label: "help.", href: "/help" },
        },
      ]}
      sideLinks={[
        { icon: "shield", label: "privacy policy", href: "/about#privacy" },
        { icon: "doc", label: "terms of service", href: "/about#terms" },
      ]}
      copyright="© 2026 FUNKY FOX · ALL RIGHTS RESERVED"
      credit="everyday menswear · crafted for real life"
      handle={{ label: "@funkyfox.in", href: "https://instagram.com" }}
    />
  )
}
