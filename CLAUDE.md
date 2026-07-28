# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static food ordering website hosted on GitHub Pages. No build system, no bundler, no server — all plain HTML/CSS/JS served directly. Firebase Firestore (via CDN compat SDK) is the only backend, used for orders, admin accounts, and offers/discounts.

**Live site:** https://kshitijjpd.github.io/foodorder.github.io/

## Deployment

Push to `main` branch auto-deploys via GitHub Pages. Browser caching is aggressive — always test with Ctrl+Shift+R or Incognito after pushing.

```bash
git push origin main
```

No build step, no CI. Files are served as-is.

## Architecture

### Page Structure
- **index.html** — Landing page with hero section, uses `style.css` + `script.js`
- **popular.html** — Menu items with "Add to Cart" buttons, writes to localStorage
- **viewcart.html** — Cart display, checkout form, order confirmation overlay. Self-contained with inline styles. Loads active offers from Firestore and applies discounts.
- **orders.html** — Admin dashboard showing all orders. Self-contained with inline styles. Admin login, admin management (super_admin role), offers CRUD, order cancel/restore/delete.
- **order.html, speciality.html, gallery.html, review.html** — Static content pages using `style.css`

### Data Flow
1. `popular.html` adds items to `localStorage` key `foodCart` (JSON array of `{name, price, qty}`)
2. `viewcart.html` reads `foodCart`, renders cart, handles checkout
3. On checkout: order saved to Firestore `orders` collection, Gmail compose URL opened for email summary, cart cleared
4. `orders.html` reads `orders` collection with real-time `onSnapshot` listener

### Firebase Firestore Collections
- **orders** — Each doc ID is the order ID (format: `FD-XXXXXXXX`). Fields: `orderId`, `customerName`, `customerEmail`, `customerPhone`, `items[]`, `subtotalAmount`, `discount`, `offerApplied`, `totalAmount`, `orderDate`, `timestamp`, `status`
- **admins** — Doc ID is the admin email. Fields: `email`, `password` (plaintext in Firestore, no Firebase Auth), `role` (`super_admin` | `admin`), `can_manage_offers` (boolean), `createdBy`, `createdAt`
- **offers** — Auto-generated doc IDs. Fields: `name`, `discountType` (`percentage` | `flat`), `discountValue`, `minOrder`, `description`, `active` (boolean), `createdBy`, `createdAt`

### Firebase Config
Embedded directly in `viewcart.html` and `orders.html`. Project ID: `food-ordering-886f0`. Uses compat SDK loaded via CDN script tags — not npm modules.

### Admin System
- No Firebase Authentication — credentials stored directly in Firestore `admins` collection
- Super admin (`kkumar2k100@gmail.com`) seeded on first page load via `seedSuperAdmin()`
- Super admin controls: manage other admins, toggle `can_manage_offers` permission per admin
- Admin session stored in `sessionStorage` (key: `adminEmail`)
- Non-admin visitors see orders with masked email/phone; stats (revenue, orders, items) hidden

### Styling Pattern
- `style.css` — Global styles for pages using the original template (index, popular, gallery, review, speciality, order). Uses CSS variable `--red: #ff3838`, Nunito font, `rem` units with `html { font-size: 62.5% }`.
- `viewcart.html` and `orders.html` — Fully self-contained inline `<style>` blocks. Use Nunito font via Google Fonts CDN, own color scheme.
- `Style1.css` — Legacy, unused.

## Key Conventions

- All JavaScript uses `var` and ES5 syntax (no `let`/`const`/arrow functions in viewcart/orders) for maximum browser compatibility
- Firebase compat SDK, not modular SDK — uses `firebase.firestore()` pattern
- Cart persistence: `localStorage` key `foodCart`; applied offer: `sessionStorage` key `appliedOffer`
- Order IDs generated client-side: `FD-` prefix + 8 random alphanumeric chars
- Email delivery: Gmail compose URL opened in new tab (no email service integration)
- User's preferred language for communication is Hindi (Hinglish)
