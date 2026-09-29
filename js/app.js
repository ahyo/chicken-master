/* =========================================================
   CHICKEN MISTER — App
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const rupiah = (n) => "Rp" + Math.max(0, n).toLocaleString("id-ID");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const compact = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".", ",") + "rb" : String(n));

  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
  const CAT_ICON = { sambal: "🌶️", minuman: "🥤", tambahan: "🍚" };
  const ITEM_ICON = { "telur-dadar": "🍳", "es-teh-manis": "🧋", "es-jeruk": "🍊" };

  const ICON_STAR = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`;
  const ICON_PLUS = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
  const ICON_TRASH = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`;
  const ICON_WA = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.44-9.43a9.4 9.4 0 0 1 9.43 9.44c0 5.2-4.24 9.43-9.44 9.43m8.03-17.46A11.3 11.3 0 0 0 12.05.72C5.8.72.7 5.8.7 12.07c0 2 .52 3.95 1.52 5.67L.6 23.28l5.67-1.49a11.3 11.3 0 0 0 5.42 1.38h.01c6.25 0 11.35-5.09 11.35-11.35 0-3.03-1.18-5.88-3.33-8.03"/></svg>`;

  /* ---------------- State ---------------- */
  const state = {
    category: "all",
    query: "",
    sort: "recommended",
    cart: loadCart(),
    checkout: { name: "", method: "antar", address: "", note: "" },
  };

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem("cm_cart") || "[]");
      return Array.isArray(raw) ? raw.filter((i) => byId[i.id]) : [];
    } catch {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem("cm_cart", JSON.stringify(state.cart)); } catch { /* storage unavailable */ }
  }

  /* ---------------- Helpers ---------------- */
  const productIcon = (p) => p.icon || ITEM_ICON[p.id] || CAT_ICON[p.category] || "🍗";

  function mediaHTML(p, { size = "card" } = {}) {
    if (p.image) {
      return `<img src="${p.image}" alt="${esc(p.name)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'swatch',style:'--sw1:#F97316;--sw2:#FACC15',innerHTML:'<div class=&quot;swatch__bowl&quot;>🍗</div>'}))" />`;
    }
    const [c1, c2] = p.swatch || ["#F97316", "#FACC15"];
    return `<div class="swatch" style="--sw1:${c1};--sw2:${c2}">
        <div class="swatch__bowl">${productIcon(p)}</div>
        ${size === "card" ? `<span class="swatch__label">${esc(catLabel[p.category] || "")}</span>` : ""}
      </div>`;
  }

  function spicyHTML(level) {
    if (!level) return `<span class="spicy" title="Tidak pedas" style="color:var(--muted)">Tidak pedas</span>`;
    return `<span class="spicy" title="Level pedas ${level}/5">${[1, 2, 3, 4, 5]
      .map((i) => `<i class="${i <= level ? "on" : ""}">🌶️</i>`)
      .join("")}</span>`;
  }

  function badgeClass(b) {
    const k = b.toLowerCase();
    if (k.includes("best")) return "badge--hot";
    if (k.includes("pedas")) return "badge--red";
    if (k.includes("hemat")) return "badge--yellow";
    if (k.includes("premium")) return "badge--dark";
    return "";
  }

  function unitPrice(p, opts = {}) {
    let total = p.price;
    for (const key of p.options || []) {
      const set = OPTION_SETS[key];
      const idx = opts[key] ?? 0;
      total += set?.choices[idx]?.price || 0;
    }
    return total;
  }

  function optionsText(p, opts = {}) {
    return (p.options || [])
      .map((key) => OPTION_SETS[key]?.choices[opts[key] ?? 0]?.label)
      .filter(Boolean)
      .join(" · ");
  }

  /* ---------------- Tabs ---------------- */
  function renderTabs() {
    const counts = PRODUCTS.reduce((acc, p) => ((acc[p.category] = (acc[p.category] || 0) + 1), acc), {});
    $("#categoryTabs").innerHTML = CATEGORIES.map((c) => {
      const count = c.id === "all" ? PRODUCTS.length : counts[c.id] || 0;
      const active = c.id === state.category;
      return `<button class="tab ${active ? "is-active" : ""}" role="tab" aria-selected="${active}" data-cat="${c.id}">
          ${esc(c.label)} <span class="tab__count">${count}</span>
        </button>`;
    }).join("");
  }

  /* ---------------- Products ---------------- */
  function filteredProducts() {
    const q = state.query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => state.category === "all" || p.category === state.category);
    if (q) {
      list = list.filter((p) =>
        [p.name, p.description, catLabel[p.category], ...(p.includes || []), ...(p.badges || [])]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    const order = (p) => PRODUCTS.indexOf(p);
    const sorters = {
      recommended: (a, b) => order(a) - order(b),
      popular: (a, b) => b.sold - a.sold,
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.sold - a.sold,
    };
    return list.sort(sorters[state.sort]);
  }

  function cardHTML(p, i) {
    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    return `<article class="card" style="animation-delay:${Math.min(i, 8) * 40}ms">
        <div class="card__media" data-open="${p.id}">
          ${mediaHTML(p)}
          ${p.badges?.length ? `<div class="card__badges">${p.badges.map((b) => `<span class="badge ${badgeClass(b)}">${esc(b)}</span>`).join("")}</div>` : ""}
          ${discount ? `<span class="card__discount">-${discount}%</span>` : ""}
        </div>
        <div class="card__body">
          <div class="card__meta">
            <span class="rating">${ICON_STAR}${p.rating.toFixed(1)} <span>(${compact(p.sold)} terjual)</span></span>
          </div>
          <h3 class="card__title" data-open="${p.id}">${esc(p.name)}</h3>
          <p class="card__desc">${esc(p.description)}</p>
          ${p.serves ? `<span class="card__serves">👥 Untuk ${esc(p.serves)}</span>` : ""}
          <div class="card__meta">${spicyHTML(p.spicy)}</div>
          <div class="card__foot">
            <div class="price">
              ${p.originalPrice ? `<s>${rupiah(p.originalPrice)}</s>` : ""}
              <strong>${rupiah(p.price)}</strong>
            </div>
            <button class="add-btn" data-add="${p.id}" aria-label="Tambah ${esc(p.name)}">${ICON_PLUS} Tambah</button>
          </div>
        </div>
      </article>`;
  }

  function renderProducts() {
    const list = filteredProducts();
    $("#productGrid").innerHTML = list.map(cardHTML).join("");
    $("#emptyState").hidden = list.length > 0;
    const where = state.category === "all" ? "semua kategori" : catLabel[state.category];
    $("#resultInfo").textContent = state.query
      ? `${list.length} hasil untuk “${state.query}” di ${where}`
      : `Menampilkan ${list.length} menu di ${where}`;
  }

  /* ---------------- Product modal ---------------- */
  let modalState = null;
  let lastFocus = null;

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    modalState = { id, qty: 1, opts: Object.fromEntries((p.options || []).map((k) => [k, defaultChoice(k, p)])), note: "" };
    lastFocus = document.activeElement;

    const groups = (p.options || [])
      .map((key) => {
        const set = OPTION_SETS[key];
        if (!set) return "";
        return `<fieldset class="opt-group ${set.type === "level" ? "opt-level" : ""}">
            <legend>${esc(set.label)} <small>Wajib pilih 1</small></legend>
            <div class="opt-list">
              ${set.choices
                .map(
                  (c, i) => `<label class="opt">
                    <input type="radio" name="opt-${key}" value="${i}" ${i === modalState.opts[key] ? "checked" : ""} data-opt="${key}" />
                    <span>${esc(c.label)}${
                    c.price ? ` <em>${c.price > 0 ? "+" : "−"}${rupiah(Math.abs(c.price)).replace("Rp", "")}</em>` : ""
                  }</span>
                  </label>`
                )
                .join("")}
            </div>
          </fieldset>`;
      })
      .join("");

    $("#modalContent").innerHTML = `
      <div class="pd__media">${mediaHTML(p, { size: "modal" })}</div>
      <div class="pd__body">
        <div>
          <span class="pd__cat">${esc(catLabel[p.category])}</span>
          <h2 class="pd__title" id="modalTitle">${esc(p.name)}</h2>
        </div>
        <div class="card__meta" style="justify-content:flex-start;gap:16px">
          <span class="rating">${ICON_STAR}${p.rating.toFixed(1)} <span>(${compact(p.sold)} terjual)</span></span>
          ${spicyHTML(p.spicy)}
          ${p.serves ? `<span class="card__serves">👥 ${esc(p.serves)}</span>` : ""}
        </div>
        <p class="pd__desc">${esc(p.description)}</p>
        ${p.includes?.length ? `<div><h4 style="font-size:14px;margin-bottom:10px">Isi paket</h4><ul class="pd__includes">${p.includes.map((x) => `<li>✓ ${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${groups}
        <label class="pd__note">
          <h4 style="font-size:14px;margin-bottom:10px">Catatan <small style="font-weight:500;color:var(--muted)">(opsional)</small></h4>
          <textarea id="pdNote" maxlength="140" placeholder="Contoh: sambal dipisah, tanpa timun"></textarea>
        </label>
        <div class="pd__foot">
          <div class="qty">
            <button type="button" data-mqty="-1" aria-label="Kurangi">−</button>
            <output id="pdQty">1</output>
            <button type="button" data-mqty="1" aria-label="Tambah">+</button>
          </div>
          <button class="btn btn--primary" id="pdAdd">Tambah · <span id="pdTotal"></span></button>
        </div>
      </div>`;
    updateModalTotal();
    $("#productModal").hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__close").focus();
  }

  function defaultChoice(key, p) {
    if (key === "level") return Math.min(p.spicy ?? 2, 3);
    return 0;
  }

  function updateModalTotal() {
    const p = byId[modalState.id];
    $("#pdQty").textContent = modalState.qty;
    $("#pdTotal").textContent = rupiah(unitPrice(p, modalState.opts) * modalState.qty);
  }

  function closeModal() {
    $("#productModal").hidden = true;
    modalState = null;
    if (!$("#cartDrawer").hidden) return;
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  /* ---------------- Cart ---------------- */
  function addToCart(id, qty = 1, opts = {}, note = "") {
    const key = id + "|" + JSON.stringify(opts) + "|" + note;
    const existing = state.cart.find((i) => i.key === key);
    if (existing) existing.qty += qty;
    else state.cart.push({ key, id, qty, opts, note });
    saveCart();
    renderCart();
    bumpCart();
    toast(`${byId[id].name} ditambahkan ke keranjang`);
  }

  function quickAdd(id) {
    const p = byId[id];
    if (p.options?.length) openProduct(id);
    else addToCart(id);
  }

  const cartCount = () => state.cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => state.cart.reduce((s, i) => s + unitPrice(byId[i.id], i.opts) * i.qty, 0);
  const deliveryFee = () =>
    state.checkout.method === "antar" && subtotal() < STORE.freeDeliveryMin && state.cart.length ? STORE.deliveryFee : 0;

  function bumpCart() {
    const b = $("#cartBtn");
    b.classList.remove("bump");
    void b.offsetWidth;
    b.classList.add("bump");
  }

  function renderCart() {
    const count = cartCount();
    const sub = subtotal();
    const cc = $("#cartCount");
    cc.textContent = count;
    cc.classList.toggle("is-visible", count > 0);
    $("#floatingCart").hidden = count === 0;
    $("#floatingCount").textContent = count;
    $("#floatingTotal").textContent = rupiah(sub);
    $("#cartTitle").textContent = count ? `Keranjang (${count})` : "Keranjang";

    if (!state.cart.length) {
      $("#cartBody").innerHTML = `<div class="cart-empty">
          <div class="cart-empty__icon">🛒</div>
          <h3>Keranjang masih kosong</h3>
          <p>Yuk pilih paket ayam & sambal favoritmu.</p>
          <button class="btn btn--primary" data-close-cart data-goto-menu>Lihat Menu</button>
        </div>`;
      $("#cartFoot").hidden = true;
      return;
    }

    const items = state.cart
      .map((i) => {
        const p = byId[i.id];
        const opt = optionsText(p, i.opts);
        return `<div class="cart-item">
            <div class="cart-item__img">${mediaHTML(p, { size: "thumb" })}</div>
            <div>
              <div class="cart-item__top">
                <div>
                  <div class="cart-item__name">${esc(p.name)}</div>
                  ${opt ? `<div class="cart-item__opts">${esc(opt)}</div>` : ""}
                  ${i.note ? `<div class="cart-item__note">“${esc(i.note)}”</div>` : ""}
                </div>
                <button class="cart-item__remove" data-remove="${esc(i.key)}" aria-label="Hapus ${esc(p.name)}">${ICON_TRASH}</button>
              </div>
              <div class="cart-item__bottom">
                <div class="qty qty--sm">
                  <button data-cqty="-1" data-key="${esc(i.key)}" aria-label="Kurangi">−</button>
                  <output>${i.qty}</output>
                  <button data-cqty="1" data-key="${esc(i.key)}" aria-label="Tambah">+</button>
                </div>
                <span class="cart-item__price">${rupiah(unitPrice(p, i.opts) * i.qty)}</span>
              </div>
            </div>
          </div>`;
      })
      .join("");

    const c = state.checkout;
    $("#cartBody").innerHTML = `${items}
      <form class="checkout" id="checkoutForm" novalidate>
        <h3>Detail Pesanan</h3>
        <div class="seg" role="radiogroup" aria-label="Metode pengambilan">
          <label><input type="radio" name="method" value="antar" ${c.method === "antar" ? "checked" : ""} /><span>🛵 Diantar</span></label>
          <label><input type="radio" name="method" value="ambil" ${c.method === "ambil" ? "checked" : ""} /><span>🏪 Ambil Sendiri</span></label>
        </div>
        <div class="field">
          <label for="coName">Nama pemesan</label>
          <input id="coName" name="name" autocomplete="name" placeholder="Nama lengkap" value="${esc(c.name)}" />
          <span class="field__err">Nama wajib diisi</span>
        </div>
        <div class="field" id="addrField" ${c.method === "ambil" ? "hidden" : ""}>
          <label for="coAddr">Alamat pengiriman</label>
          <textarea id="coAddr" name="address" autocomplete="street-address" placeholder="Jalan, nomor rumah, patokan">${esc(c.address)}</textarea>
          <span class="field__err">Alamat wajib diisi untuk pengantaran</span>
        </div>
        <div class="field">
          <label for="coNote">Catatan untuk outlet <small style="font-weight:500;color:var(--muted)">(opsional)</small></label>
          <input id="coNote" name="note" placeholder="Mis. jam antar, tambah sendok" value="${esc(c.note)}" />
        </div>
      </form>`;

    renderSummary();
    $("#cartFoot").hidden = false;
  }

  function renderSummary() {
    const sub = subtotal();
    const fee = deliveryFee();
    const isAntar = state.checkout.method === "antar";
    const remaining = STORE.freeDeliveryMin - sub;
    const pct = Math.min(100, (sub / STORE.freeDeliveryMin) * 100);

    $("#cartFoot").innerHTML = `
      ${isAntar && remaining > 0 ? `<div class="free-hint">Tambah <strong>${rupiah(remaining)}</strong> lagi untuk gratis ongkir 🎉<div class="free-hint__bar"><i style="width:${pct}%"></i></div></div>` : ""}
      <div class="summary">
        <div class="summary__row"><span>Subtotal</span><span>${rupiah(sub)}</span></div>
        ${isAntar ? `<div class="summary__row ${fee ? "" : "summary__row--free"}"><span>Ongkos kirim</span><span>${fee ? rupiah(fee) : "Gratis"}</span></div>` : ""}
        <div class="summary__row summary__row--total"><span>Total</span><span>${rupiah(sub + fee)}</span></div>
      </div>
      <button class="btn btn--wa btn--lg btn--block" id="checkoutBtn">${ICON_WA} Pesan via WhatsApp</button>`;
  }

  function changeQty(key, delta) {
    const item = state.cart.find((i) => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart = state.cart.filter((i) => i.key !== key);
    saveCart();
    renderCart();
  }

  function openCart() {
    lastFocus = document.activeElement;
    $("#cartDrawer").hidden = false;
    document.body.style.overflow = "hidden";
    $("#cartDrawer .icon-btn").focus();
  }
  function closeCart() {
    $("#cartDrawer").hidden = true;
    document.body.style.overflow = "";
    lastFocus?.focus?.();
  }

  function validateCheckout() {
    const c = state.checkout;
    let ok = true;
    const nameField = $("#coName").closest(".field");
    nameField.classList.toggle("is-invalid", !c.name.trim());
    if (!c.name.trim()) ok = false;
    const addrField = $("#addrField");
    const addrBad = c.method === "antar" && !c.address.trim();
    addrField.classList.toggle("is-invalid", addrBad);
    if (addrBad) ok = false;
    if (!ok) $(".field.is-invalid input, .field.is-invalid textarea")?.focus();
    return ok;
  }

  function checkout() {
    if (!validateCheckout()) return;
    const c = state.checkout;
    const sub = subtotal();
    const fee = deliveryFee();
    const lines = state.cart.map((i, n) => {
      const p = byId[i.id];
      const opt = optionsText(p, i.opts);
      let line = `${n + 1}. *${p.name}* x${i.qty} — ${rupiah(unitPrice(p, i.opts) * i.qty)}`;
      if (opt) line += `\n    ${opt}`;
      if (i.note) line += `\n    Catatan: ${i.note}`;
      return line;
    });
    const msg = [
      `Halo *${STORE.name}*, saya mau pesan:`,
      "",
      ...lines,
      "",
      `Subtotal: ${rupiah(sub)}`,
      c.method === "antar" ? `Ongkir: ${fee ? rupiah(fee) : "Gratis"}` : null,
      `*Total: ${rupiah(sub + fee)}*`,
      "",
      `Nama: ${c.name.trim()}`,
      `Metode: ${c.method === "antar" ? "Diantar" : "Ambil sendiri"}`,
      c.method === "antar" ? `Alamat: ${c.address.trim()}` : null,
      c.note.trim() ? `Catatan: ${c.note.trim()}` : null,
      "",
      "Terima kasih!",
    ]
      .filter((l) => l !== null)
      .join("\n");
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  /* ---------------- Toast ---------------- */
  let toastTimer;
  function toast(text) {
    const t = $("#toast");
    t.innerHTML = `<span class="toast__check">✓</span>${esc(text)}`;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), 2200);
  }

  /* ---------------- Static content ---------------- */
  function renderStatic() {
    $$("[data-free-min]").forEach((el) => (el.textContent = rupiah(STORE.freeDeliveryMin)));
    $$("[data-store]").forEach((el) => (el.textContent = STORE[el.dataset.store] || ""));
    $("#hoursList").innerHTML = STORE.hours
      .map((h) => `<div class="hours-row"><span>${esc(h.day)}</span><span>${esc(h.time)}</span></div>`)
      .join("");
    $("#mapsLink").href = STORE.mapsUrl;
    $("#year").textContent = new Date().getFullYear();
    const waHref = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Halo ${STORE.name}, saya mau tanya menu.`)}`;
    $$("[data-wa-direct]").forEach((a) => {
      a.href = waHref;
      a.target = "_blank";
      a.rel = "noopener";
    });
    $$("[data-social]").forEach((a) => {
      a.href = STORE[a.dataset.social] || "#";
      a.target = "_blank";
      a.rel = "noopener";
    });
    $("#testiGrid").innerHTML = TESTIMONIALS.map(
      (t) => `<figure class="testi reveal">
          <div class="testi__stars">${"★".repeat(t.rating)}</div>
          <blockquote class="testi__text" style="margin:0">“${esc(t.text)}”</blockquote>
          <figcaption class="testi__author">
            <span class="testi__avatar">${esc(t.name.split(" ").map((w) => w[0]).slice(0, 2).join(""))}</span>
            <div><strong>${esc(t.name)}</strong><small>${esc(t.role)}</small></div>
          </figcaption>
        </figure>`
    ).join("");
  }

  function setCategory(cat) {
    state.category = cat;
    renderTabs();
    renderProducts();
  }

  /* ---------------- Events ---------------- */
  function bindEvents() {
    // Tabs
    $("#categoryTabs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (b) setCategory(b.dataset.cat);
    });

    // Search (debounced) & sort
    let t;
    $("#searchInput").addEventListener("input", (e) => {
      clearTimeout(t);
      t = setTimeout(() => {
        state.query = e.target.value;
        renderProducts();
      }, 150);
    });
    $("#sortSelect").addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderProducts();
    });
    $("#resetFilter").addEventListener("click", () => {
      state.query = "";
      $("#searchInput").value = "";
      setCategory("all");
    });

    // Global click delegation
    document.addEventListener("click", (e) => {
      const el = e.target;
      const open = el.closest("[data-open]");
      if (open) return openProduct(open.dataset.open);

      const add = el.closest("[data-add], [data-quick-add]");
      if (add) return quickAdd(add.dataset.add || add.dataset.quickAdd);

      const jump = el.closest("[data-filter-jump]");
      if (jump) {
        e.preventDefault();
        setCategory(jump.dataset.filterJump);
        $("#menu").scrollIntoView({ behavior: "smooth" });
        return;
      }

      if (el.closest("[data-close]")) return closeModal();

      const mq = el.closest("[data-mqty]");
      if (mq && modalState) {
        modalState.qty = Math.max(1, Math.min(99, modalState.qty + Number(mq.dataset.mqty)));
        return updateModalTotal();
      }

      if (el.closest("#pdAdd") && modalState) {
        const { id, qty, opts } = modalState;
        const note = ($("#pdNote").value || "").trim();
        closeModal();
        return addToCart(id, qty, opts, note);
      }

      if (el.closest("#cartBtn, #floatingCart")) return openCart();
      if (el.closest("[data-close-cart]")) {
        closeCart();
        if (el.closest("[data-goto-menu]")) $("#menu").scrollIntoView({ behavior: "smooth" });
        return;
      }

      const cq = el.closest("[data-cqty]");
      if (cq) return changeQty(cq.dataset.key, Number(cq.dataset.cqty));
      const rm = el.closest("[data-remove]");
      if (rm) return changeQty(rm.dataset.remove, -Infinity);

      if (el.closest("#checkoutBtn")) return checkout();
    });

    // Modal option changes
    $("#productModal").addEventListener("change", (e) => {
      const r = e.target.closest("[data-opt]");
      if (r && modalState) {
        modalState.opts[r.dataset.opt] = Number(r.value);
        updateModalTotal();
      }
    });

    // Checkout form state
    $("#cartBody").addEventListener("input", (e) => {
      const f = e.target;
      if (!f.name || !(f.name in state.checkout)) return;
      state.checkout[f.name] = f.value;
      f.closest(".field")?.classList.remove("is-invalid");
      if (f.name === "method") {
        $("#addrField").hidden = f.value === "ambil";
        renderSummary();
      }
    });
    $("#cartBody").addEventListener("submit", (e) => e.preventDefault());

    // Escape to close
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!$("#productModal").hidden) closeModal();
      else if (!$("#cartDrawer").hidden) closeCart();
    });

    // Mobile nav
    const burger = $("#burger");
    const nav = $("#nav");
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });

    // Header shadow on scroll
    const header = $("#header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Active nav link by section
    const links = $$(".nav__link");
    const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            if (!en.isIntersecting) return;
            links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id));
          });
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );
      sections.forEach((s) => io.observe(s));

      // Reveal animations
      const rv = new IntersectionObserver(
        (entries) =>
          entries.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("is-in");
              rv.unobserve(en.target);
            }
          }),
        { threshold: 0.12 }
      );
      $$(".feature, .step, .testi, .promo-card, .location, .cta").forEach((el) => {
        el.classList.add("reveal");
        rv.observe(el);
      });
    }
  }

  /* ---------------- Init ---------------- */
  renderStatic();
  renderTabs();
  renderProducts();
  renderCart();
  bindEvents();
})();
