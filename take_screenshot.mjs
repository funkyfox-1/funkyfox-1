import puppeteer from 'puppeteer-core'

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  
  // 1. Desktop capture (1280px)
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 })
  await page.goto('http://localhost:4173/about', { waitUntil: 'load', timeout: 15000 })
  await new Promise(r => setTimeout(r, 1000))
  await page.screenshot({ path: 'public/images/about/about-desktop-rendered.png', fullPage: true })
  console.log('Desktop screenshot saved to public/images/about/about-desktop-rendered.png')

  // 2. Mobile capture (390px)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
  await page.goto('http://localhost:4173/about', { waitUntil: 'load', timeout: 15000 })
  await new Promise(r => setTimeout(r, 1000))
  await page.screenshot({ path: 'public/images/about/about-mobile-rendered.png', fullPage: true })
  console.log('Mobile screenshot saved to public/images/about/about-mobile-rendered.png')

  await browser.close()
}

capture().catch(err => {
  console.error(err)
  process.exit(1)
})
