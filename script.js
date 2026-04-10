// CONFIGURATION INITIALE
let score = 0, clickPower = 1, autoCPS = 0, globalMultiplier = 1.0;
let costAuto = 10, costPower = 50, costMultiplier = 500, costFrenzy = 1000;
let frenzyDecay = 0.5; // Vitesse de redescente de la barre

let totalScoreEver = 0, totalClicks = 0, startTime = Date.now();
let frenzyEnergy = 0, isFrenzy = false, isMuted = false;

// SONS
const clickSound = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg');
const frenzySound = new Audio('https://actions.google.com/sounds/v1/sci-fi/power_up.ogg');

// SAUVEGARDE
function saveGame() {
    const data = { score, clickPower, autoCPS, globalMultiplier, costAuto, costPower, costMultiplier, costFrenzy, totalScoreEver, totalClicks, frenzyDecay };
    localStorage.setItem('evoClickerSave_v3', JSON.stringify(data));
}

function loadGame() {
    const saved = JSON.parse(localStorage.getItem('evoClickerSave_v3'));
    if (saved) {
        score = saved.score; clickPower = saved.clickPower; autoCPS = saved.autoCPS;
        globalMultiplier = saved.globalMultiplier; costAuto = saved.costAuto;
        costPower = saved.costPower; costMultiplier = saved.costMultiplier;
        costFrenzy = saved.costFrenzy || 1000; frenzyDecay = saved.frenzyDecay || 0.5;
        totalScoreEver = saved.totalScoreEver; totalClicks = saved.totalClicks;
    }
}

// PARTICULES
function spawnParticle(x, y, text) {
    const p = document.createElement('div');
    p.className = 'particle'; p.innerText = text;
    if (isFrenzy) p.style.color = "red";
    p.style.left = x + 'px'; p.style.top = y + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist = 70 + Math.random() * 50;
    p.style.setProperty('--x', Math.cos(angle) * dist + "px");
    p.style.setProperty('--y', Math.sin(angle) * dist + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

// MISE À JOUR UI
function updateUI() {
    document.getElementById('score-display').innerText = Math.floor(score);
    document.getElementById('cost-auto').innerText = costAuto;
    document.getElementById('cost-power').innerText = costPower;
    document.getElementById('cost-multiplier').innerText = costMultiplier;
    document.getElementById('cost-frenzy').innerText = costFrenzy;
    document.getElementById('cps').innerText = autoCPS;
    document.getElementById('power').innerText = clickPower;
    document.getElementById('multi-val').innerText = globalMultiplier.toFixed(1);

    document.getElementById('buy-auto').disabled = score < costAuto;
    document.getElementById('buy-power').disabled = score < costPower;
    document.getElementById('buy-multiplier').disabled = score < costMultiplier;
    document.getElementById('buy-frenzy-boost').disabled = score < costFrenzy;
}

// CLIC PRINCIPAL
document.getElementById('main-btn').addEventListener('click', (e) => {
    if (!isMuted) { clickSound.currentTime = 0; clickSound.play().catch(()=>{}); }

    if (!isFrenzy) {
        frenzyEnergy = Math.min(100, frenzyEnergy + 7);
        if (frenzyEnergy >= 100) {
            isFrenzy = true;
            document.getElementById('main-btn').classList.add('frenzy-active');
            if (!isMuted) frenzySound.play().catch(()=>{});
        }
    }

    let gain = (isFrenzy ? clickPower * 2 : clickPower) * globalMultiplier;
    score += gain; totalScoreEver += gain; totalClicks++;
    spawnParticle(e.clientX, e.clientY, `+${Math.floor(gain)}`);
    updateUI();
});

// BOUTIQUE
document.getElementById('buy-auto').onclick = () => { if(score >= costAuto) { score -= costAuto; autoCPS++; costAuto = Math.round(costAuto * 1.5); updateUI(); saveGame(); } };
document.getElementById('buy-power').onclick = () => { if(score >= costPower) { score -= costPower; clickPower++; costPower = Math.round(costPower * 2.1); updateUI(); saveGame(); } };
document.getElementById('buy-multiplier').onclick = () => { if(score >= costMultiplier) { score -= costMultiplier; globalMultiplier *= 1.2; costMultiplier = Math.round(costMultiplier * 4); updateUI(); saveGame(); } };
document.getElementById('buy-frenzy-boost').onclick = () => { if(score >= costFrenzy) { score -= costFrenzy; frenzyDecay *= 0.8; costFrenzy = Math.round(costFrenzy * 5); updateUI(); saveGame(); } };

// MENU STATS
document.getElementById('stats-toggle').onclick = () => {
    document.getElementById('stat-total-ever').innerText = Math.floor(totalScoreEver);
    document.getElementById('stat-clicks').innerText = totalClicks;
    document.getElementById('stat-time').innerText = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('stats-modal').classList.remove('hidden');
};
document.getElementById('close-stats').onclick = () => document.getElementById('stats-modal').classList.add('hidden');
document.getElementById('mute-toggle').onclick = (e) => { isMuted = !isMuted; e.target.innerText = isMuted ? "🔇" : "🔊"; };
document.getElementById('reset-game').onclick = () => { if(confirm("Supprimer TOUTE la progression ?")) { localStorage.clear(); location.reload(); } };

// BOUCLE DE JEU (100ms)
setInterval(() => {
    if (autoCPS > 0) {
        let gainAuto = (isFrenzy ? autoCPS * 2 : autoCPS) * globalMultiplier / 10;
        score += gainAuto; totalScoreEver += gainAuto;
    }
    if (isFrenzy) {
        frenzyEnergy -= (frenzyDecay * 2.5);
        if (frenzyEnergy <= 0) { isFrenzy = false; document.getElementById('main-btn').classList.remove('frenzy-active'); }
    } else {
        frenzyEnergy = Math.max(0, frenzyEnergy - frenzyDecay);
    }
    document.getElementById('frenzy-bar').style.width = frenzyEnergy + "%";
    updateUI();
}, 100);

// Lancement
loadGame();
updateUI();