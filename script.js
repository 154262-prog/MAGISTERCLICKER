// CORE STATE
let sems = 0;
let perClick = 1;
let perSecond = 0;
let clickLevel = 1;
let autoLevel = 0;

let totalEarned = 0;
let totalLost = 0;
let highestEver = 0;

let bjWins = 0;
let bjLosses = 0;

let currentSkin = "default";

const semsEl = document.getElementById("sems");
const perClickEl = document.getElementById("perClick");
const perSecondEl = document.getElementById("perSecond");
const shopSemsEl = document.getElementById("shopSems");
const clickLevelEl = document.getElementById("clickLevel");
const autoLevelEl = document.getElementById("autoLevel");
const totalEarnedEl = document.getElementById("totalEarned");
const totalLostEl = document.getElementById("totalLost");
const highestEverEl = document.getElementById("highestEver");
const bjWinsEl = document.getElementById("bjWins");
const bjLossesEl = document.getElementById("bjLosses");

function applySkinMultipliers(baseClick, baseSecond) {
  let c = baseClick;
  let s = baseSecond;

  if (currentSkin === "skibidi") {
    c *= 1.1;
  } else if (currentSkin === "ohio") {
    s *= 1.1;
  } else if (currentSkin === "fanum") {
    c *= 1.05;
    s *= 1.05;
  } else if (currentSkin === "gyatt") {
    c *= 1.2;
    s *= 0.9;
  }

  return { click: c, second: s };
}

function updateStats() {
  const mult = applySkinMultipliers(perClick, perSecond);

  semsEl.textContent = Math.floor(sems);
  perClickEl.textContent = mult.click.toFixed(2);
  perSecondEl.textContent = mult.second.toFixed(2);
  shopSemsEl.textContent = Math.floor(sems);
  clickLevelEl.textContent = clickLevel;
  autoLevelEl.textContent = autoLevel;

  totalEarnedEl.textContent = Math.floor(totalEarned);
  totalLostEl.textContent = Math.floor(totalLost);
  highestEver = Math.max(highestEver, sems);
  highestEverEl.textContent = Math.floor(highestEver);

  bjWinsEl.textContent = bjWins;
  bjLossesEl.textContent = bjLosses;
}

function addSems(amount, fromGamble = false) {
  sems += amount;
  if (amount > 0) totalEarned += amount;
  if (amount < 0 && fromGamble) totalLost += -amount;
  updateStats();
}

// CLICKER
const clickCircle = document.getElementById("clickCircle");
clickCircle.addEventListener("click", () => {
  const mult = applySkinMultipliers(perClick, perSecond);
  addSems(mult.click);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    clickCircle.click();
  }
});

setInterval(() => {
  const mult = applySkinMultipliers(perClick, perSecond);
  if (mult.second > 0) {
    addSems(mult.second);
  }
}, 1000);

// SHOP: +1 click, +1 auto, +2 click, +2 auto, ...
const shopItemsContainer = document.getElementById("shopItems");
const upgrades = [];
for (let i = 1; i <= 10; i++) {
  const amount = i;
  upgrades.push({ type: "click", amount });
  upgrades.push({ type: "auto", amount });
}

function getUpgradeCost(index) {
  return 50 * (index + 1) * (index + 1);
}

function renderShop() {
  shopItemsContainer.innerHTML = "";
  upgrades.forEach((upg, i) => {
    const cost = getUpgradeCost(i);
    const div = document.createElement("div");
    div.className = "shop-item";

    const label = upg.type === "click"
      ? `+${upg.amount} per klik`
      : `+${upg.amount} per seconde`;

    div.innerHTML = `
      <span>${label}</span>
      <span>Prijs: ${cost} SEM's</span>
      <button class="btn secondary" data-upg="${i}">Koop</button>
    `;
    shopItemsContainer.appendChild(div);
  });

  shopItemsContainer.querySelectorAll("button[data-upg]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-upg"));
      const upg = upgrades[idx];
      const cost = getUpgradeCost(idx);
      if (sems >= cost) {
        addSems(-cost);
        if (upg.type === "click") {
          perClick += upg.amount;
          clickLevel++;
        } else {
          perSecond += upg.amount;
          autoLevel++;
        }
        updateStats();
      } else {
        alert("Niet genoeg SEM's!");
      }
    });
  });
}

// PANELS
const panelButtons = document.querySelectorAll(".menu button");
const panels = document.querySelectorAll(".panel");

panelButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-panel");
    panels.forEach(p => p.classList.remove("active"));
    const panel = document.getElementById("panel-" + target);
    if (panel) panel.classList.add("active");
  });
});

// SKINS
const appRoot = document.getElementById("appRoot");
document.querySelectorAll("[data-skin]").forEach(btn => {
  btn.addEventListener("click", () => {
    const skin = btn.getAttribute("data-skin");
    currentSkin = skin;

    appRoot.classList.remove("skin-skibidi", "skin-ohio", "skin-fanum", "skin-gyatt");
    if (skin === "skibidi") appRoot.classList.add("skin-skibidi");
    if (skin === "ohio") appRoot.classList.add("skin-ohio");
    if (skin === "fanum") appRoot.classList.add("skin-fanum");
    if (skin === "gyatt") appRoot.classList.add("skin-gyatt");

    updateStats();
  });
});

// BLACKJACK
let bjDeck = [];
let bjPlayerCards = [];
let bjDealerCards = [];

const bjSemsEl = document.getElementById("bjSems");
const bjBetEl = document.getElementById("bjBet");
const bjDealerEl = document.getElementById("bjDealer");
const bjPlayerEl = document.getElementById("bjPlayer");
const bjResultEl = document.getElementById("bjResult");

function updateBjSems() {
  bjSemsEl.textContent = Math.floor(sems);
}

function createDeck() {
  const deck = [];
  const values = [2,3,4,5,6,7,8,9,10,10,10,10,11];
  for (let i = 0; i < 4; i++) {
    for (let v of values) deck.push(v);
  }
  return deck.sort(() => Math.random() - 0.5);
}

function sum(cards) {
  let total = cards.reduce((a,b) => a+b, 0);
  while (total > 21 && cards.includes(11)) {
    cards[cards.indexOf(11)] = 1;
    total = cards.reduce((a,b) => a+b, 0);
  }
  return total;
}

document.getElementById("bjStart").addEventListener("click", () => {
  const bet = Number(bjBetEl.value);
  if (bet <= 0 || bet > sems) {
    bjResultEl.textContent = "Onvoldoende SEM's voor deze inzet.";
    return;
  }

  addSems(-bet, true);
  updateBjSems();

  bjDeck = createDeck();
  bjPlayerCards = [bjDeck.pop(), bjDeck.pop()];
  bjDealerCards = [bjDeck.pop(), bjDeck.pop()];

  bjPlayerEl.textContent = bjPlayerCards.join(" + ") + " = " + sum(bjPlayerCards);
  bjDealerEl.textContent = bjDealerCards[0] + " + ?";
  bjResultEl.textContent = "";
});

document.getElementById("bjHit").addEventListener("click", () => {
  if (!bjDeck.length) return;
  bjPlayerCards.push(bjDeck.pop());
  const total = sum(bjPlayerCards);
  bjPlayerEl.textContent = bjPlayerCards.join(" + ") + " = " + total;
  if (total > 21) {
    bjResultEl.textContent = "BUST! Je verliest.";
    bjLosses++;
    updateStats();
  }
});

document.getElementById("bjStand").addEventListener("click", () => {
  if (!bjDeck.length) return;
  const bet = Number(bjBetEl.value);

  bjDealerEl.textContent = bjDealerCards.join(" + ") + " = " + sum(bjDealerCards);
  while (sum(bjDealerCards) < 17) {
    bjDealerCards.push(bjDeck.pop());
    bjDealerEl.textContent = bjDealerCards.join(" + ") + " = " + sum(bjDealerCards);
  }

  const player = sum(bjPlayerCards);
  const dealer = sum(bjDealerCards);

  if (player > 21) {
    bjResultEl.textContent = "Je was al bust.";
    bjLosses++;
  } else if (dealer > 21 || player > dealer) {
    addSems(bet * 2, true);
    bjResultEl.textContent = "Je wint!";
    bjWins++;
  } else if (player === dealer) {
    addSems(bet, true);
    bjResultEl.textContent = "Gelijkspel.";
  } else {
    bjResultEl.textContent = "Dealer wint.";
    bjLosses++;
  }

  updateBjSems();
  updateStats();
});

// INIT
renderShop();
updateStats();
updateBjSems();
