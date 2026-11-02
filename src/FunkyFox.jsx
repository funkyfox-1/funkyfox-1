// Restored from the supplied FUNKY FOX homepage. Existing storefront preserved.
import * as React from "react";
import EditorialBanner from "./components/EditorialBanner";
import Footer from "./components/Footer";
import ShopPage from "./components/ShopPage";
import ProductDetailPage from "./components/ProductDetailPage";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import CheckoutPlaceholder from "./components/CheckoutPlaceholder";
import OrderConfirmationPage from "./components/OrderConfirmationPage";
import SearchOverlay from "./components/SearchOverlay";
import AboutPage from "./components/AboutPage";
import HelpPage from "./components/HelpPage";
import HeroHighlightsStrip from "./components/HeroHighlightsStrip";
import EverydayLineup from "./components/EverydayLineup";
import ShoppingProcess from "./components/ShoppingProcess";
import FAQSection from "./components/ui/FAQSection";
import BrandStandardCTA from "./components/ui/BrandStandardCTA";
import FloatingNavbar from "./components/ui/FloatingNavbar";
import ClothingRailHero from "./components/ui/product-rail-gallery";
import JellyRadio from "./components/ui/JellyRadio";
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./components/account/AuthPages";
import AccountLayout from "./components/account/AccountLayout";
import AccountOverview from "./components/account/AccountOverview";
import AccountOrders from "./components/account/AccountOrders";
import OrderDetailPage from "./components/account/OrderDetailPage";
import AccountWishlist from "./components/account/AccountWishlist";
import AccountReviews from "./components/account/AccountReviews";
import AccountAddresses from "./components/account/AccountAddresses";
import AccountProfile from "./components/account/AccountProfile";
import { CURATED_RAIL_GARMENTS } from "./data/railProducts";
import {
  products,
  kidsProducts,
  formatPrice,
  categories,
  categoryImages,
  getCategoryFallbackImage,
} from "./data/products";
import { calculateShipping, PROVISIONAL_SHIPPING_POLICY } from "./config/shipping";
import { OfflineBanner, Toast } from "./components/feedback";
import {
  Link,
  BrowserRouter,
  useLocation,
  useNavigate,
  useSearchParams,
  useParams,
  Routes,
  Route,
} from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  X as CloseIcon,
} from "lucide-react";

function Eyebrow({ children: i }) {
  return (
    <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[.3em] text-soft sm:text-[10.5px]">
      <span aria-hidden="true" className="h-[3px] w-7 rounded-full bg-fox" />
      {i}
    </p>
  );
}
function ProductGrid({ items: i, addToCart: s }) {
  const [r, f] = React.useState({});
  return (
    <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 sm:mt-10 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4 lg:gap-x-6">
      {i.map((d) => (
        <li className="group min-w-0" key={d.id}>
          <div className="relative overflow-hidden bg-[#eeeae3] rounded-2xl shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
            <Link
              to={`/products/${d.id}`}
              aria-label={`View ${d.name}`}
              className="block focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink"
            >
              <img
                src={d.image}
                alt={d.alt}
                width="1024"
                height="1536"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getCategoryFallbackImage(d.category);
                }}
                className="aspect-[3/4] w-full object-cover object-center rounded-2xl transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </Link>
            <button
              type="button"
              onClick={() => s(d, r[d.id] || d.colors[0].name)}
              aria-label={`Quick add ${d.name} to bag`}
              title={`Add ${d.name} to bag`}
              className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition-all hover:bg-fox hover:text-white hover:scale-110 focus-visible:outline-2 focus-visible:outline-fox sm:bottom-4 sm:right-4"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          </div>
          <div className="mt-3.5 flex flex-col gap-1 sm:mt-4">
            <Link
              to={`/products/${d.id}`}
              className="w-fit text-[12px] font-semibold leading-snug text-ink transition-colors hover:text-fox-deep sm:text-[14px]"
            >
              {d.name}
            </Link>
            <p className="text-[12px] font-semibold text-ink sm:text-[14px]">
              {formatPrice(d.price)}
            </p>
          </div>
          <div
            className="mt-3 flex items-center gap-1.5"
            aria-label={`Available colours for ${d.name}`}
          >
            {d.colors.map((y) => (
              <button
                type="button"
                aria-label={`${d.name} in ${y.name}`}
                aria-pressed={(r[d.id] || d.colors[0].name) === y.name}
                title={y.name}
                onClick={() =>
                  f((T) => ({
                    ...T,
                    [d.id]: y.name,
                  }))
                }
                className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition-colors hover:border-ink sm:h-5 sm:w-5 ${(r[d.id] || d.colors[0].name) === y.name ? "border-fox ring-1 ring-fox/40" : "border-transparent"}`}
                key={y.name}
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/10 sm:h-3.5 sm:w-3.5"
                  style={{
                    backgroundColor: y.value,
                  }}
                />
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
function HomePage({ addToCart: i }) {
  return (
    <>
      <section
        id="home"
        aria-labelledby="hero-heading"
        className="relative isolate overflow-hidden bg-paper"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-[.04em] top-1/2 z-0 hidden -translate-y-1/2 select-none font-display font-black uppercase leading-[.78] tracking-[-.06em] text-ghost md:block md:text-[24vw] xl:text-[21vw]"
        >
          {"Wear"}
        </span>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-y-8 pb-3 pt-6 md:grid-cols-12 md:gap-x-6 md:pb-4 md:pt-10 lg:gap-x-10 lg:pb-4 lg:pt-12">
            <div className="order-1 flex flex-col items-start md:order-2 md:col-span-5 md:col-start-8 md:pl-2 lg:pl-6">
              <Eyebrow>{"Everyday Style. Your Way."}</Eyebrow>
              <h1
                id="hero-heading"
                className="mt-4 font-display text-[2.65rem] font-black uppercase leading-[.94] tracking-[-.035em] text-ink sm:text-6xl md:mt-5 md:text-[3.4rem] lg:mt-6 lg:text-[4.15rem] xl:text-[4.6rem]"
              >
                {"Made for"}
                <br />
                {"your "}
                <span className="relative inline-block">
                  {"everyday"}
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-[.09em] w-full bg-fox md:-bottom-1.5"
                  />
                </span>
                {"."}
              </h1>
              <p className="mt-4 max-w-[38ch] text-[13.5px] leading-relaxed text-soft sm:text-[15px] md:mt-5">
                {
                  "Men’s essentials, easy layers and everyday fits — cut well, priced fair, delivered across India."
                }
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-7">
                <a
                  href="#categories"
                  className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-fox pl-6 pr-2 text-[11px] font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox-deep sm:h-[52px] sm:pl-7 shadow-sm"
                >
                  {"Explore Collection "}
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink transition-transform group-hover:translate-x-1 sm:h-9 sm:w-9">
                    <ArrowRight size={16} />
                  </span>
                </a>
                <a
                  href="#new-arrivals"
                  className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink"
                >
                  <span className="border-b-2 border-line group-hover:border-fox group-hover:text-fox-deep">
                    {"Discover what’s new"}
                  </span>
                  <ArrowRight size={15} />
                </a>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 md:mt-8">
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-soft">
                  <Truck size={13} className="text-fox" />
                  {"Free delivery above ₹1,499"}
                </span>
                <span className="hidden h-3 w-px bg-line sm:block" />
                <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-soft">
                  <RotateCcw size={13} className="text-fox" />
                  {"Easy 15-day returns"}
                </span>
              </div>
            </div>
            <div className="relative order-2 mx-auto w-full max-w-[420px] sm:max-w-[460px] md:order-1 md:col-span-7 md:col-start-1 md:mx-0 md:max-w-none md:pr-4 lg:pr-10">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -left-3 bottom-0 top-8 w-[74%] rounded-t-full rounded-b-2xl bg-sand-deep sm:-left-5 md:top-10"
                />
                <div className="relative ml-6 mr-2 sm:ml-10 md:ml-14 md:mr-0">
                  <div className="group relative overflow-hidden rounded-t-full shadow-[0_36px_70px_-30px_rgba(20,20,18,.5)] ring-1 ring-ink/10">
                    <img
                      src="/images/hero-model.jpg"
                      alt="Funky Fox model in a beige overshirt, off-white tee and dark olive chinos"
                      width="1024"
                      height="1536"
                      fetchPriority="high"
                      className="aspect-[3/4] w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.025] md:aspect-[4/5]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -left-3 top-16 flex -rotate-3 flex-col rounded-lg border border-ink/10 bg-paper px-3 py-2 shadow-lg sm:-left-8 sm:top-20">
                    <span className="text-[8.5px] font-bold uppercase tracking-[.24em] text-fox-deep">
                      {"The Monsoon Edit"}
                    </span>
                    <span className="mt-0.5 font-display text-[12px] font-extrabold uppercase text-ink sm:text-[13px]">
                      {"Vol. 04 — SS26"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => i(products[3])}
                  aria-label="Quick add Lightweight Utility Jacket to bag"
                  className="group absolute bottom-3 left-0 flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-paper/95 p-2 pr-4 text-left shadow-xl transition-transform hover:-translate-y-1 sm:bottom-4 sm:left-2"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-deep">
                    <ShoppingBag size={21} strokeWidth={1.6} />
                  </span>
                  <span>
                    <span className="block text-[8px] font-bold uppercase tracking-[.2em] text-soft">
                      {"The hero layer"}
                    </span>
                    <span className="mt-0.5 block text-[11px] font-bold leading-tight text-ink">
                      {"Utility Jacket · ₹1,499"}
                    </span>
                    <span className="mt-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[.16em] text-fox-deep">
                      <Plus size={10} />
                      {" Add to bag — size M"}
                    </span>
                  </span>
                </button>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 bottom-40 hidden font-hand text-[21px] font-semibold leading-none text-fox-deep lg:block"
                >
                  {"your everyday,"}
                  <br />
                  {"sorted →"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <HeroHighlightsStrip />
      <EverydayLineup />
      <ClothingRailHero
        id="new-arrivals"
        className="scroll-mt-24 border-t border-line"
        items={CURATED_RAIL_GARMENTS}
        hanger="wood"
        eyebrow="The Everyday Edit"
        heading="THE EVERYDAY EDIT."
        caption="Touch, slide, or lift each piece to inspect fabric drape and craftsmanship."
        autoplay={true}
        interval={2800}
        onAddToCart={(garment) => {
          const prod = products.find((p) => p.id === garment.id);
          if (prod) i(prod);
        }}
      />
      <ShoppingProcess />
      <FAQSection />
      <BrandStandardCTA />
      <Footer />
    </>
  );
}

function Storefront() {
  const [i, s] = React.useState(() => {
      try {
        return JSON.parse(localStorage.getItem("funky-fox-cart") || "[]");
      } catch {
        return [];
      }
    }),
    [r, f] = React.useState(!1),
    [d, y] = React.useState(!1),
    [T, O] = React.useState(!1),
    [C, M] = React.useState(!1),
    [R, v] = React.useState(""),
    [D, X] = React.useState(""),
    [toastInfo, setToastInfo] = React.useState(null),
    [quickSizeModal, setQuickSizeModal] = React.useState(null),
    [isBannerDismissed, setIsBannerDismissed] = React.useState(() => {
      try {
        return sessionStorage.getItem("funky-fox-banner-dismissed") === "1";
      } catch {
        return false;
      }
    }),
    Q = useLocation(),
    Y = useNavigate();

  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleToast = (e) => {
      if (e.detail) {
        setToastInfo(e.detail);
        if (e.detail.message) {
          X(e.detail.message);
        }
      }
    };
    window.addEventListener("funky-fox-toast", handleToast);
    return () => window.removeEventListener("funky-fox-toast", handleToast);
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismissBanner = () => {
    setIsBannerDismissed(true);
    try {
      sessionStorage.setItem("funky-fox-banner-dismissed", "1");
    } catch {}
  };
  (React.useEffect(() => {
    localStorage.setItem("funky-fox-cart", JSON.stringify(i));
  }, [i]),
    React.useEffect(() => {
      const w = setTimeout(() => {
        (y(!1),
          O(!1),
          M(!1),
          Q.hash
            ? document.getElementById(Q.hash.slice(1))?.scrollIntoView({
                behavior: "smooth",
              })
            : window.scrollTo(0, 0));
      }, 50);
      return () => clearTimeout(w);
    }, [Q.pathname, Q.search, Q.hash]),
    React.useEffect(() => {
      if (!D) return;
      const w = setTimeout(() => X(""), 3500);
      return () => clearTimeout(w);
    }, [D]),
    React.useEffect(() => {
      const w = (ct) => {
        ct.key === "Escape" && (f(!1), M(!1), y(!1), O(!1), setQuickSizeModal(null));
      };
      return (
        window.addEventListener("keydown", w),
        () => window.removeEventListener("keydown", w)
      );
    }, []));
  function U(w, ct, G, qtyToAdd = 1) {
    if (!w) return;
    const selectedColor = ct || w.colors?.[0]?.name || "Default";

    // 1. Explicit check: if product has no sizes at all
    if (!w.sizes || w.sizes.length === 0) {
      X(`${w.name} is currently out of stock in all sizes`);
      return;
    }

    // 2. If no size was specified by caller:
    // Prompt user with clear size-selection interaction rather than assuming a size
    if (!G) {
      if (w.sizes.length === 1) {
        // Unambiguous single size available (e.g. Free Size)
        G = w.sizes[0];
      } else {
        // Open clear size-selection prompt
        setQuickSizeModal({ product: w, color: selectedColor, quantity: qtyToAdd });
        return;
      }
    }

    // 3. If size was provided, verify it is actually available for this product
    if (!w.sizes.includes(G)) {
      // Never silently assign an unavailable size - open selection prompt
      setQuickSizeModal({ product: w, color: selectedColor, quantity: qtyToAdd });
      return;
    }

    const validSize = G;

    (s((W) => {
      const wt = W.find(
        (jt) => jt.id === w.id && jt.size === validSize && jt.color === selectedColor,
      );
      return wt
        ? W.map((jt) =>
            jt === wt
              ? {
                  ...jt,
                  qty: jt.qty + qtyToAdd,
                }
              : jt,
          )
        : [
            ...W,
            {
              id: w.id,
              size: validSize,
              color: selectedColor,
              qty: qtyToAdd,
            },
          ];
    }),
      X(`${qtyToAdd > 1 ? `${qtyToAdd}x ` : ""}${w.name} (${validSize}) added to bag`));
  }
  function J(w, ct) {
    s((G) =>
      G.map((W, wt) =>
        wt === w
          ? {
              ...W,
              qty: W.qty + ct,
            }
          : W,
      ).filter((W) => W.qty > 0),
    );
  }
  function updateCartItemQty(id, size, color, newQty) {
    if (newQty < 1) return;
    s((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, qty: newQty }
          : item
      )
    );
  }
  function removeCartItem(id, size, color) {
    s((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.size === size && item.color === color)
      )
    );
    X("Item removed from bag");
  }
  const $ = i.reduce((w, ct) => w + ct.qty, 0),
    at = i.reduce(
      (w, ct) =>
        w + (products.find((G) => G.id === ct.id)?.price || 0) * ct.qty,
      0,
    ),
    Tt = products.filter((w) =>
      `${w.name} ${w.category}`.toLowerCase().includes(R.toLowerCase()),
    );
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <OfflineBanner />
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
        href="#main"
      >
        {"Skip to content"}
      </a>
      {Q.pathname !== "/checkout" && Q.pathname !== "/order-confirmation" && Q.pathname !== "/about" && !isBannerDismissed && (
        <div className="relative flex h-8 items-center justify-center bg-ink px-8 text-center text-[10px] font-semibold uppercase tracking-[.18em] text-paper z-50">
          <div className="flex items-center justify-center">
            <Truck size={12} className="mr-2 shrink-0 text-fox" />
            <span>{`Free shipping on orders over ₹${PROVISIONAL_SHIPPING_POLICY.freeShippingThreshold.toLocaleString('en-IN')}`}</span>
          </div>
          <button
            type="button"
            onClick={dismissBanner}
            aria-label="Dismiss shipping announcement"
            className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-paper/70 transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-white"
          >
            <CloseIcon size={12} />
          </button>
        </div>
      )}
      {Q.pathname !== "/checkout" && Q.pathname !== "/order-confirmation" && (
        <FloatingNavbar cartCount={$} onOpenSearch={() => M(!0)} />
      )}
      <main id="main" className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage addToCart={U} />} />
          <Route path="/products" element={<ShopPage addToCart={U} />} />
          <Route path="/products/:id" element={<ProductDetailPage addToCart={U} />} />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={i}
                onUpdateQuantity={updateCartItemQty}
                onRemoveItem={removeCartItem}
              />
            }
          />
          <Route
            path="/bag"
            element={
              <CartPage
                cartItems={i}
                onUpdateQuantity={updateCartItemQty}
                onRemoveItem={removeCartItem}
              />
            }
          />
          <Route
            path="/checkout"
            element={<CheckoutPage cartItems={i} />}
          />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/contact" element={<HelpPage />} />

          {/* Customer Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Customer Account & Post-Purchase Experience */}
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountOverview />} />
            <Route path="orders" element={<AccountOrders />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route
              path="wishlist"
              element={
                <AccountWishlist
                  onAddToCart={(prod, col, sz) => U(prod, col, sz, 1)}
                />
              }
            />
            <Route path="reviews" element={<AccountReviews />} />
            <Route path="addresses" element={<AccountAddresses />} />
            <Route path="profile" element={<AccountProfile />} />
          </Route>

          <Route path="*" element={<HomePage addToCart={U} />} />
        </Routes>
      </main>
      <SearchOverlay isOpen={C} onClose={() => M(!1)} />
      {r && (
        <div
          className="fixed inset-0 z-[80]"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag"
        >
          <button
            aria-label="Close bag"
            onClick={() => f(!1)}
            className="absolute inset-0 w-full bg-ink/45"
          />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-line px-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-black uppercase">
                <ShoppingBag size={19} />
                {" Your Bag "}
                <span className="text-sm text-soft">
                  {"("}
                  {$}
                  {")"}
                </span>
              </h2>
              <button
                aria-label="Close bag"
                onClick={() => f(!1)}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand"
              >
                <CloseIcon size={20} />
              </button>
            </div>
            {i.length ? (
              <>
                <div className="border-b border-line bg-sand/50 px-5 py-3 text-xs font-semibold">
                  {calculateShipping(at).isFree
                    ? "Nice — your delivery is on the house."
                    : `You're ${formatPrice(calculateShipping(at).amountNeededForFree)} away from free shipping.`}
                </div>
                <div className="flex-1 overflow-auto px-5">
                  {i.map((w, ct) => {
                    const G = products.find((W) => W.id === w.id);
                    if (!G) return null;
                    return (
                      <div
                        className="flex gap-4 border-b border-line py-5"
                        key={`${w.id}-${w.size}-${w.color}`}
                      >
                        <Link to={`/products/${G.id}`} onClick={() => f(!1)}>
                          <img
                            src={G.image}
                            alt=""
                            className="h-28 w-20 object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <Link
                            to={`/products/${G.id}`}
                            onClick={() => f(!1)}
                            className="text-sm font-bold hover:text-fox"
                          >
                            {G.name}
                          </Link>
                          <p className="mt-1 text-xs text-soft">
                            {w.color}
                            {" · Size "}
                            {w.size}
                          </p>
                          <div className="mt-auto flex items-end justify-between">
                            <div className="flex items-center border border-line">
                              <button
                                aria-label={`Remove one ${G.name}`}
                                onClick={() => J(ct, -1)}
                                className="p-2 hover:bg-sand"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="min-w-5 text-center text-xs">
                                {w.qty}
                              </span>
                              <button
                                aria-label={`Add one ${G.name}`}
                                onClick={() => J(ct, 1)}
                                className="p-2 hover:bg-sand"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <span className="text-sm font-bold">
                              {formatPrice(G.price * w.qty)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-line p-5">
                  <div className="flex justify-between font-semibold">
                    <span>{"Subtotal"}</span>
                    <span>{formatPrice(at)}</span>
                  </div>
                  <p className="mt-2 text-xs text-soft">
                    {"Shipping calculated at checkout."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      f(!1);
                      Y("/cart");
                    }}
                    className="mt-5 w-full bg-ink py-4 text-xs font-bold uppercase tracking-[.18em] text-white transition-colors hover:bg-fox"
                  >
                    {"View Bag & Checkout"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      (f(!1), Y("/products"));
                    }}
                    className="mt-4 w-full text-center text-xs font-bold uppercase tracking-[.16em] underline underline-offset-4"
                  >
                    {"Continue shopping"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag
                  size={34}
                  strokeWidth={1.4}
                  className="text-soft"
                />
                <p className="mt-5 font-display text-xl font-black uppercase">
                  {"Bag’s feeling light"}
                </p>
                <p className="mt-2 text-sm text-soft">
                  {
                    "Everyday fits are waiting — add a tee, a shirt or an easy layer."
                  }
                </p>
                <button
                  onClick={() => {
                    (f(!1), Y("/#new-arrivals"));
                  }}
                  className="mt-6 rounded-full bg-ink px-7 py-3 text-xs font-bold uppercase tracking-widest text-paper hover:bg-fox"
                >
                  {"Start shopping"}
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
      {/* Quick Size Selection Modal */}
      {quickSizeModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-size-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-sm"
          onClick={() => setQuickSizeModal(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl border border-line bg-paper p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={quickSizeModal.product.image}
                  alt={quickSizeModal.product.alt || quickSizeModal.product.name}
                  className="h-14 w-12 rounded object-cover border border-line shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = getCategoryFallbackImage(quickSizeModal.product.category);
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-soft">
                    Select Size
                  </p>
                  <h3 id="quick-size-title" className="font-display text-sm font-bold uppercase tracking-wide text-ink truncate">
                    {quickSizeModal.product.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-soft">
                    {quickSizeModal.color} · <span className="font-semibold text-ink">{formatPrice(quickSizeModal.product.price)}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickSizeModal(null)}
                aria-label="Close size selector"
                className="rounded-full p-1.5 text-soft hover:bg-sand hover:text-ink transition-colors"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-soft mb-2.5">
                Choose Fit & Size
              </p>
              <div className="overflow-x-auto pb-1 scrollbar-none">
                <JellyRadio
                  items={quickSizeModal.product.sizes}
                  defaultValue={quickSizeModal.product.sizes[0]}
                  onChange={(sz) => {
                    const { product, color, quantity } = quickSizeModal;
                    setQuickSizeModal(null);
                    U(product, color, sz, quantity);
                  }}
                  size="md"
                  gap={6}
                  radius={10}
                  activeColor="#E87535"
                  chipColor="#FAF9F6"
                  activeTextColor="#ffffff"
                  textColor="#191919"
                  ariaLabel="Quick sizes"
                />
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-4 flex items-center justify-between text-xs text-soft">
              <Link
                to={`/products/${quickSizeModal.product.id}`}
                onClick={() => setQuickSizeModal(null)}
                className="font-semibold text-ink underline underline-offset-4 hover:text-fox transition-colors"
              >
                View full details
              </Link>
              <button
                type="button"
                onClick={() => setQuickSizeModal(null)}
                className="hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {D && (
        <Toast
          message={D}
          type={toastInfo?.type || "success"}
          actionLabel={toastInfo?.actionLabel || "View Bag"}
          actionTo={toastInfo?.actionTo || "/cart"}
          onAction={toastInfo?.onAction}
          onDismiss={() => {
            X("");
            setToastInfo(null);
          }}
        />
      )}
    </div>
  );
}
function FunkyFox() {
  return (
    <BrowserRouter>
      <Storefront />
    </BrowserRouter>
  );
}

export default FunkyFox;
