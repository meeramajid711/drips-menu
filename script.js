const AED = "DHS"
const menu = [
  {
    id: "spanish_latte",
    name: "Spanish Latte",
    cat: "coffee",
    temps: ["hot","cold"],
    basePrice: 18,
    desc: "Rich espresso with creamy milk",
    badges: ["Best seller", "Milk"]
  },
  {
    id: "americano",
    name: "Americano",
    cat: "coffee",
    temps: ["hot","cold"],
    basePrice: 14,
    desc: "Clean coffee, strong and smooth",
    badges: ["Classic"]
  },
  {
    id: "v60",
    name: "V60 Pour Over",
    cat: "coffee",
    temps: ["hot"],
    basePrice: 22,
    desc: "Slow brew • clean flavor notes",
    badges: ["Specialty", "Filter"]
  },
  {
    id: "hot_cocoa",
    name: "Signature Molten Cocoa",
    cat: "cocoa",
    temps: ["hot"],
    basePrice: 20,
    desc: "Thick cocoa • molten chocolate vibe",
    badges: ["Signature"]
  },
  {
    id: "cookies",
    name: "Cookies",
    cat: "dessert",
    temps: ["all"],
    basePrice: 8,
    desc: "Fresh baked • perfect with coffee",
    badges: ["Snack"]
  },
  {
    id: "kinder_rolls",
    name: "Kinder Rolls",
    cat: "dessert",
    temps: ["all"],
    basePrice: 12,
    desc: "Soft roll • kinder filling",
    badges: ["Sweet"]
  }
]

let state = {
  tempFilter: "all",
  catFilter: "all",
  search: "",
  cart: [],
  sheetOpen: false,
  activeItem: null,
  activeOpts: {},
  qty: 1
}

const el = (id) => document.getElementById(id)

const menuGrid = el("menuGrid")
const searchInput = el("searchInput")
const catRow = el("catRow")

const backdrop = el("backdrop")
const itemSheet = el("itemSheet")
const cartSheet = el("cartSheet")
const infoSheet = el("infoSheet")

const openCartBtn = el("openCartBtn")
const closeCartBtn = el("closeCartBtn")
const navCart = el("navCart")
const navHome = el("navHome")
const navInfo = el("navInfo")

const closeSheetBtn = el("closeSheetBtn")
const addToCartBtn = el("addToCartBtn")
const qtyMinus = el("qtyMinus")
const qtyPlus = el("qtyPlus")
const qtyVal = el("qtyVal")
const sheetName = el("sheetName")
const sheetDesc = el("sheetDesc")
const sheetPrice = el("sheetPrice")
const cartDot = el("cartDot")

const optTemp = el("optTemp")
const optSize = el("optSize")
const optMilk = el("optMilk")
const optSugar = el("optSugar")

const cartList = el("cartList")
const cartTotal = el("cartTotal")
const cartSub = el("cartSub")
const checkoutBtn = el("checkoutBtn")
const clearCartBtn = el("clearCartBtn")
const closeInfoBtn = el("closeInfoBtn")

function money(n){
  return `${AED} ${Number(n).toFixed(0)}`
}

function filteredMenu(){
  const s = state.search.trim().toLowerCase()

  return menu.filter(item => {
    const matchSearch = !s || item.name.toLowerCase().includes(s) || item.desc.toLowerCase().includes(s)
    const matchCat = state.catFilter === "all" || item.cat === state.catFilter
    const matchTemp =
      state.tempFilter === "all" ||
      item.temps.includes(state.tempFilter) ||
      item.temps.includes("all") ||
      (state.tempFilter === "hot" && item.temps.includes("hot")) ||
      (state.tempFilter === "cold" && item.temps.includes("cold"))

    return matchSearch && matchCat && matchTemp
  })
}

function emojiFor(cat){
  if(cat === "coffee") return "☕️"
  if(cat === "cocoa") return "🍫"
  if(cat === "dessert") return "🍪"
  return "✨"
}

function renderMenu(){
  const items = filteredMenu()
  menuGrid.innerHTML = ""

  items.forEach(item => {
    const card = document.createElement("div")
    card.className = "card"

    const thumb = document.createElement("div")
    thumb.className = "thumb"
    thumb.textContent = emojiFor(item.cat)

    const main = document.createElement("div")
    main.className = "cardMain"

    const name = document.createElement("div")
    name.className = "cardName"
    name.textContent = item.name

    const meta = document.createElement("div")
    meta.className = "cardMeta"
    meta.textContent = item.desc

    const badges = document.createElement("div")
    badges.className = "badges"
    const b1 = document.createElement("span")
    b1.className = "badge"
    b1.textContent = item.cat.toUpperCase()
    badges.appendChild(b1)

    if(item.temps.includes("hot") && item.temps.includes("cold")){
      const b2 = document.createElement("span")
      b2.className = "badge"
      b2.textContent = "HOT / COLD"
      badges.appendChild(b2)
    } else if(item.temps.includes("hot")){
      const b2 = document.createElement("span")
      b2.className = "badge"
      b2.textContent = "HOT"
      badges.appendChild(b2)
    } else if(item.temps.includes("cold")){
      const b2 = document.createElement("span")
      b2.className = "badge"
      b2.textContent = "COLD"
      badges.appendChild(b2)
    }

    item.badges.slice(0,2).forEach(x=>{
      const b = document.createElement("span")
      b.className = "badge"
      b.textContent = x
      badges.appendChild(b)
    })

    const bottom = document.createElement("div")
    bottom.className = "cardBottom"

    const price = document.createElement("div")
    price.className = "price"
    price.textContent = money(item.basePrice)

    const btn = document.createElement("button")
    btn.className = "selectBtn"
    btn.textContent = "Select"
    btn.addEventListener("click", () => openItem(item.id))

    bottom.appendChild(price)
    bottom.appendChild(btn)

    main.appendChild(name)
    main.appendChild(meta)
    main.appendChild(badges)
    main.appendChild(bottom)

    card.appendChild(thumb)
    card.appendChild(main)

    menuGrid.appendChild(card)
  })
}

function setActive(groupEl, selector, activeEl){
  groupEl.querySelectorAll(selector).forEach(x => x.classList.remove("active"))
  activeEl.classList.add("active")
}

function priceFor(item, opts, qty){
  let p = item.basePrice

  if(opts.size === "M") p += 2
  if(opts.size === "L") p += 4

  if(opts.milk === "Oat") p += 3

  if(item.id === "v60" && opts.size === "L") p += 1

  return p * qty
}

function supports(item){
  const isDrink = item.cat === "coffee" || item.cat === "cocoa"
  const isDessert = item.cat === "dessert"

  return {
    temp: isDrink && item.temps.includes("hot") && item.temps.includes("cold"),
    size: isDrink && !isDessert,
    milk: item.cat === "coffee" || item.cat === "cocoa",
    sugar: isDrink
  }
}

function openSheet(which){
  backdrop.hidden = false
  which.hidden = false
}

function closeAllSheets(){
  backdrop.hidden = true
  itemSheet.hidden = true
  cartSheet.hidden = true
  infoSheet.hidden = true
}

function openItem(itemId){
  const item = menu.find(x => x.id === itemId)
  state.activeItem = item
  state.qty = 1
  qtyVal.textContent = "1"

  state.activeOpts = {}
  const sup = supports(item)

  optTemp.hidden = !sup.temp
  optSize.hidden = !sup.size
  optMilk.hidden = !sup.milk
  optSugar.hidden = !sup.sugar

  itemSheet.querySelectorAll(".seg").forEach(b => b.classList.remove("active"))

  if(!optTemp.hidden){
    const def = item.temps.includes("hot") ? "hot" : "cold"
    state.activeOpts.temp = def
    activateSeg("temp", def)
  }

  if(!optSize.hidden){
    state.activeOpts.size = "M"
    activateSeg("size", "M")
  }

  if(!optMilk.hidden){
    state.activeOpts.milk = "Regular"
    activateSeg("milk", "Regular")
  }

  if(!optSugar.hidden){
    state.activeOpts.sugar = "50%"
    activateSeg("sugar", "50%")
  }

  sheetName.textContent = item.name
  sheetDesc.textContent = item.desc
  updateSheetPrice()
  openSheet(itemSheet)
}

function activateSeg(k, v){
  itemSheet.querySelectorAll(`.seg[data-k="${k}"]`).forEach(btn => {
    btn.classList.toggle("active", btn.dataset.v === v)
  })
}

function updateSheetPrice(){
  const item = state.activeItem
  const total = priceFor(item, state.activeOpts, state.qty)
  sheetPrice.textContent = money(total)
}

itemSheet.addEventListener("click", (e) => {
  const t = e.target
  if(!(t instanceof HTMLElement)) return
  if(!t.classList.contains("seg")) return

  const k = t.dataset.k
  const v = t.dataset.v
  state.activeOpts[k] = v
  activateSeg(k, v)
  updateSheetPrice()
})

qtyMinus.addEventListener("click", () => {
  state.qty = Math.max(1, state.qty - 1)
  qtyVal.textContent = String(state.qty)
  updateSheetPrice()
})

qtyPlus.addEventListener("click", () => {
  state.qty = Math.min(20, state.qty + 1)
  qtyVal.textContent = String(state.qty)
  updateSheetPrice()
})

addToCartBtn.addEventListener("click", () => {
  const item = state.activeItem
  const entry = {
    key: cryptoKey(),
    id: item.id,
    name: item.name,
    opts: { ...state.activeOpts },
    qty: state.qty,
    unit: priceFor(item, state.activeOpts, 1)
  }
  state.cart.push(entry)
  updateCartUI()
  closeAllSheets()
})

function cryptoKey(){
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function optsText(opts){
  const parts = []
  if(opts.temp) parts.push(opts.temp.toUpperCase())
  if(opts.size) parts.push(`Size ${opts.size}`)
  if(opts.milk) parts.push(`${opts.milk} milk`)
  if(opts.sugar) parts.push(`Sugar ${opts.sugar}`)
  return parts.join(" • ")
}

function cartSum(){
  return state.cart.reduce((a, c) => a + (c.unit * c.qty), 0)
}

function updateCartUI(){
  cartList.innerHTML = ""

  const count = state.cart.reduce((a,c)=>a+c.qty,0)
  cartSub.textContent = `${count} item${count===1?"":"s"}`
  cartTotal.textContent = money(cartSum())
  cartDot.hidden = count === 0

  if(state.cart.length === 0){
    const empty = document.createElement("div")
    empty.className = "infoCard"
    empty.textContent = "Cart is empty. Select items from the menu."
    cartList.appendChild(empty)
    return
  }

  state.cart.forEach(row => {
    const wrap = document.createElement("div")
    wrap.className = "cartItem"

    const left = document.createElement("div")
    left.className = "cartLeft"

    const nm = document.createElement("div")
    nm.className = "cartName"
    nm.textContent = row.name

    const op = document.createElement("div")
    op.className = "cartOpts"
    op.textContent = optsText(row.opts) || "—"

    left.appendChild(nm)
    left.appendChild(op)

    const right = document.createElement("div")
    right.className = "cartRight"

    const pr = document.createElement("div")
    pr.className = "price"
    pr.textContent = money(row.unit * row.qty)

    const qrow = document.createElement("div")
    qrow.className = "cartQtyRow"

    const minus = document.createElement("button")
    minus.className = "smallBtn"
    minus.textContent = "−"
    minus.addEventListener("click", () => {
      row.qty = Math.max(1, row.qty - 1)
      updateCartUI()
    })

    const q = document.createElement("div")
    q.style.fontWeight = "900"
    q.textContent = String(row.qty)

    const plus = document.createElement("button")
    plus.className = "smallBtn"
    plus.textContent = "+"
    plus.addEventListener("click", () => {
      row.qty = Math.min(20, row.qty + 1)
      updateCartUI()
    })

    const del = document.createElement("button")
    del.className = "smallBtn"
    del.textContent = "🗑"
    del.addEventListener("click", () => {
      state.cart = state.cart.filter(x => x.key !== row.key)
      updateCartUI()
    })

    qrow.appendChild(minus)
    qrow.appendChild(q)
    qrow.appendChild(plus)
    qrow.appendChild(del)

    right.appendChild(pr)
    right.appendChild(qrow)

    wrap.appendChild(left)
    wrap.appendChild(right)

    cartList.appendChild(wrap)
  })
}

function openCart(){
  updateCartUI()
  openSheet(cartSheet)
}

function openInfo(){
  openSheet(infoSheet)
}

openCartBtn.addEventListener("click", openCart)
el("openCartBtn").addEventListener("click", () => setNav("cart"))
navCart.addEventListener("click", () => { setNav("cart"); openCart() })
navHome.addEventListener("click", () => { setNav("home"); closeAllSheets() })
navInfo.addEventListener("click", () => { setNav("info"); openInfo() })

closeCartBtn.addEventListener("click", () => closeAllSheets())
closeSheetBtn.addEventListener("click", () => closeAllSheets())
closeInfoBtn.addEventListener("click", () => closeAllSheets())
backdrop.addEventListener("click", () => closeAllSheets())

clearCartBtn.addEventListener("click", () => {
  state.cart = []
  updateCartUI()
})

checkoutBtn.addEventListener("click", () => {
  alert("Checkout is UI only for now. Later we can add WhatsApp order / QR / payment.")
})

function setNav(which){
  ;[navHome, navCart, navInfo].forEach(b => b.classList.remove("active"))
  if(which === "home") navHome.classList.add("active")
  if(which === "cart") navCart.classList.add("active")
  if(which === "info") navInfo.classList.add("active")
}

document.querySelectorAll(".pill").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".pill").forEach(x => x.classList.remove("active"))
    btn.classList.add("active")
    state.tempFilter = btn.dataset.temp
    renderMenu()
  })
})

document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(x => x.classList.remove("active"))
    btn.classList.add("active")
    state.catFilter = btn.dataset.cat
    renderMenu()
  })
})

searchInput.addEventListener("input", (e) => {
  state.search = e.target.value || ""
  renderMenu()
})

renderMenu()
updateCartUI()