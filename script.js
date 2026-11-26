const params = new URLSearchParams(window.location.search);
const telaAtual = window.location.pathname.endsWith("product-page-control.html")
    ? "A"
    : "B";
let versao = params.get("versao");
if (versao !== "A" && versao !== "B") {
    versao = telaAtual === "A" ? "A" : localStorage.getItem("versaoTeste");
    if (versao !== "A" && versao !== "B") {
         versao = Math.random() < 0.5 ? "A" : "B";
         localStorage.setItem("versaoTeste", versao);
    }
}
if (versao !== telaAtual) {
    const pagina = versao === "A" ? "product-page-control.html" : "index.html";
    window.location.replace(pagina + "?versao=" + versao);
} else {
document.getElementById("current-version").textContent = versao;
const CHAVE = "officeSupplyTesteAB";
function carregarDados() {
   return JSON.parse(localStorage.getItem(CHAVE)) || {
       A: { visualizacoes: 0, cliques: {} },
       B: { visualizacoes: 0, cliques: {} }
   };
}
function salvarDados(dados) {
   localStorage.setItem(CHAVE, JSON.stringify(dados));
}

//visualizações registradas
const chaveSessao = "office_imp_" + versao;
if (!sessionStorage.getItem(chaveSessao)) {
   const dados = carregarDados();
   dados[versao].visualizacoes++;
   salvarDados(dados);
   sessionStorage.setItem(chaveSessao, "sim");
}
// contagem dos cliques
document.querySelectorAll(".track-click").forEach(botao => {
   botao.addEventListener("click", function() {
       const proximaVersao = this.dataset.switchVersion;
       if (proximaVersao) {
           localStorage.setItem("versaoTeste", proximaVersao);
       }
       const acao = this.dataset.action;
       const produto = this.dataset.product;
       const dados = carregarDados();
       const identificacao = produto + " - " + acao;
       dados[versao].cliques[identificacao] =
           (dados[versao].cliques[identificacao] || 0) + 1;
       salvarDados(dados);
       // Destaca visualmente o elemento clicado
       document.querySelectorAll(".click-focus")
           .forEach(el => el.classList.remove("click-focus"));
       this.classList.add("click-focus");
       console.log({
           versao: versao,
           produto: produto,
           acao: acao,
           elemento: this.tagName
       });
       atualizarPainel();
   });
});

// atualização instantânea do painel de resultados
function atualizarPainel() {
   const dados = carregarDados();
   const atual = dados[versao];
   const totalCliques = Object.values(atual.cliques)
       .reduce((total, quantidade) => total + quantidade, 0);
   const ctr = atual.visualizacoes > 0
       ? (totalCliques / atual.visualizacoes) * 100
       : 0;
   document.getElementById("impressions").textContent =
       atual.visualizacoes;
   document.getElementById("total-clicks").textContent =
       totalCliques;
   document.getElementById("ctr").textContent =
       ctr.toFixed(2) + "%";
   const detalhes = document.getElementById("click-details");
   detalhes.innerHTML = "";
   Object.entries(atual.cliques).forEach(([nome, quantidade]) => {
       const linha = document.createElement("p");
       linha.textContent = nome + ": " + quantidade + " clique(s)";
       detalhes.appendChild(linha);
   });
}

//limpexa e reinicialização dos dados
document.getElementById("reset-results").addEventListener("click", () => {
   if (confirm("Deseja apagar os resultados deste navegador?")) {
       localStorage.removeItem(CHAVE);
       sessionStorage.removeItem("office_imp_A");
       sessionStorage.removeItem("office_imp_B");
       location.reload();
   }
});
atualizarPainel();
}