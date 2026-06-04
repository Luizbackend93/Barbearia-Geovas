import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ===================================== */
/* FIREBASE CONFIG                       */
/* ===================================== */
const firebaseConfig = {
  apiKey: "AIzaSyB_uu53SgjofpYcSRQEhuyvOKxPOd99S_s",
  authDomain: "barbearia-geovas.firebaseapp.com",
  projectId: "barbearia-geovas",
  storageBucket: "barbearia-geovas.firebasestorage.app",
  messagingSenderId: "848356421319",
  appId: "1:848356421319:web:c359ec40a1c664863698e2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ===================================== */
/* SCROLL                                */
/* ===================================== */
window.scrollToAgendamento = function () {
  const secao = document.getElementById("agendamento");
  if (secao) {
    secao.scrollIntoView({ behavior: "smooth" });
  }
};

/* ===================================== */
/* LOGIN ADMINISTRADOR                   */
/* ===================================== */
window.login = async function () {
  const emailInput = document.getElementById("user");
  const senhaInput = document.getElementById("pass");

  if (!emailInput || !senhaInput) return;

  let email = emailInput.value.trim();
  let senha = senhaInput.value;

  if (!email || !senha) {
    Swal.fire({
      icon: "warning",
      title: "Preencha todos os campos",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    Swal.fire({
      icon: "success",
      title: "Login realizado!",
      timer: 1500,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1500);

  } catch (error) {
    console.error("Erro ao logar:", error);
    Swal.fire({
      icon: "error",
      title: "Login inválido",
      text: "Email ou senha incorretos",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
  }
};

/* ===================================== */
/* LOGOUT                                */
/* ===================================== */
window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

/* ===================================== */
/* ONLOAD CONTROLLER                     */
/* ===================================== */
window.addEventListener("load", function () {
  let dataInput = document.getElementById("data");

  if (dataInput) {
    dataInput.addEventListener("change", gerarHorarios);
  }

  verificarStatus();
  setInterval(verificarStatus, 60000);
});

/* ===================================== */
/* GERAR HORÁRIOS PREMIUM (1 EM 1 HORA)  */
/* ===================================== */
async function gerarHorarios() {
  let data = document.getElementById("data").value;
  if (!data) return;

  let partes = data.split("-");
  let dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

  let dataObj = new Date(partes[0], partes[1] - 1, partes[2]);
  let dia = dataObj.getDay();

  let inicio = "";
  let fim = "";

  switch (dia) {
    case 0: // Domingo
      Swal.fire({
        icon: "warning",
        title: "Barbearia fechada aos domingos",
        confirmButtonColor: "#d4af37",
        background: "#111",
        color: "#fff"
      });
      document.getElementById("hora").innerHTML = '<option value="">Fechado</option>';
      return;

    case 1: // Segunda-feira
      Swal.fire({
        icon: "warning",
        title: "Barbearia fechada às segundas-feiras",
        confirmButtonColor: "#d4af37",
        background: "#111",
        color: "#fff"
      });
      document.getElementById("hora").innerHTML = '<option value="">Fechado</option>';
      return;

    case 2: // Terça
    case 3: // Quarta
      inicio = "09:00";
      fim = "18:00";
      break;

    case 4: // Quinta
      inicio = "09:00";
      fim = "19:30";
      break;

    case 5: // Sexta
      inicio = "08:00";
      fim = "20:00";
      break;

    case 6: // Sábado
      inicio = "07:00";
      fim = "19:00";
      break;
  }

  let horarios = [];
  let atual = new Date(`2000-01-01 ${inicio}`);
  let limite = new Date(`2000-01-01 ${fim}`);

  while (atual < limite) {
    let h = String(atual.getHours()).padStart(2, "0");
    let m = String(atual.getMinutes()).padStart(2, "0");
    horarios.push(`${h}:${m}`);
    atual.setMinutes(atual.getMinutes() + 60); 
  }

  const hoje = new Date();
  let anoHoje = hoje.getFullYear(); 
  let mesHoje = String(hoje.getMonth() + 1).padStart(2, "0");
  let diaHoje = String(hoje.getDate()).padStart(2, "0");
  const dataHojeString = `${anoHoje}-${mesHoje}-${diaHoje}`;
  
  const mesmaData = data === dataHojeString;

  try {
    const q = query(
      collection(db, "agendamentos"),
      where("data", "==", dataFormatada)
    );

    const snapshot = await getDocs(q);
    let agendados = [];

    snapshot.forEach(docSnap => {
      agendados.push(docSnap.data());
    });

    let selectHora = document.getElementById("hora");
    selectHora.innerHTML = '<option value="">Selecione o horário</option>';

    let temHorarioDisponivel = false;

    horarios.forEach(horario => {
      if (mesmaData) {
        let [h, m] = horario.split(":");
        let horarioOpcaoValor = Number(h) + Number(m) / 60;
        let horarioAtualValor = hoje.getHours() + hoje.getMinutes() / 60;

        if (horarioOpcaoValor <= horarioAtualValor) {
          return; 
        }
      }

      let ocupado = agendados.some(item => item.hora === horario);

      if (!ocupado) {
        let option = document.createElement("option");
        option.value = horario;
        option.textContent = horario;
        selectHora.appendChild(option);
        temHorarioDisponivel = true;
      }
    });

    if (!temHorarioDisponivel) {
      selectHora.innerHTML = '<option value="">Nenhum horário disponível para este dia</option>';
    }
  } catch (error) {
    console.error("Erro ao listar horários:", error);
  }
}

/* ===================================== */
/* AGENDAR HORÁRIO                       */
/* ===================================== */
window.agendar = async function () {
  let botao = document.querySelector(".agendamento button");
  if (botao) {
    botao.innerHTML = "Agendando...";
    botao.disabled = true;
  }

  let nome = document.getElementById("nome").value.trim();
  let servicoRaw = document.getElementById("servico").value;
  let dataInput = document.getElementById("data").value;
  let hora = document.getElementById("hora").value;

  if (!nome || !dataInput || !hora || !servicoRaw) {
    Swal.fire({
      icon: "warning",
      title: "Preencha todos os campos",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });

    if (botao) {
      botao.innerHTML = "Confirmar Agendamento";
      botao.disabled = false;
    }
    return;
  }

  let [servicoNome, servicoPreco] = servicoRaw.split("|");
  let servico = `${servicoNome} - R$${servicoPreco}`;
  let partes = dataInput.split("-");
  let dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

  try {
    const verificar = query(
      collection(db, "agendamentos"),
      where("data", "==", dataFormatada),
      where("hora", "==", hora)
    );

    const existe = await getDocs(verificar);

    if (!existe.empty) {
      Swal.fire({
        icon: "error",
        title: "Horário já agendado",
        text: "Escolha outro horário",
        confirmButtonColor: "#d4af37",
        background: "#111",
        color: "#fff"
      });

      if (botao) {
        botao.innerHTML = "Confirmar Agendamento";
        botao.disabled = false;
      }
      return;
    }

    await addDoc(collection(db, "agendamentos"), {
      nome,
      servico,
      preco: servicoPreco,
      data: dataFormatada,
      hora
    });

    Swal.fire({
      icon: "success",
      title: "Agendamento realizado!",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });

    let mensagem = `Olá, meu nome é ${nome}. Quero ${servicoNome} por R$${servicoPreco} no dia ${dataFormatada} às ${hora}.`;
    let url = `https://wa.me/5531987930848?text=${encodeURIComponent(mensagem)}`;

    if (botao) {
      botao.innerHTML = "Confirmar Agendamento";
      botao.disabled = false;
    }

    setTimeout(() => {
      window.location.href = url;
    }, 2000);

  } catch (error) {
    console.error("Erro ao agendar:", error);
    if (botao) {
      botao.innerHTML = "Confirmar Agendamento";
      botao.disabled = false;
    }
  }
};

/* ===================================== */
/* ADMIN LOGIN CHECK & PANEL             */
/* ===================================== */
if (window.location.pathname.includes("admin.html")) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      carregarAdmin();
    }
  });
}

async function carregarAdmin() {
  let lista = document.getElementById("listaAgendamentos");
  if (!lista) return;

  lista.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "agendamentos"));
    let agendamentos = [];
    let faturamento = 0;

    snapshot.forEach(docItem => {
      let ag = docItem.data();
      ag.id = docItem.id;
      agendamentos.push(ag);

      if (ag.preco) {
        faturamento += Number(ag.preco);
      }
    });

    agendamentos.forEach(ag => {
      lista.innerHTML += `
        <div class="agendamento-item">
          <p><strong>Cliente:</strong> ${ag.nome}</p>
          <p><strong>Serviço:</strong> ${ag.servico}</p>
          <p><strong>Data:</strong> ${ag.data}</p>
          <p><strong>Hora:</strong> ${ag.hora}</p>
          <p><strong>Preço:</strong> R$ ${ag.preco}</p>
          <button class="btn-excluir" onclick="excluir('${ag.id}')">Excluir</button>
        </div>
      `;
    });

    let faturamentoHoje = document.getElementById("faturamentoHoje");
    if (faturamentoHoje) {
      faturamentoHoje.innerText = "R$ " + faturamento;
    }
  } catch (error) {
    console.error("Erro ao carregar painel admin:", error);
  }
}

window.excluir = async function (id) {
  try {
    await deleteDoc(doc(db, "agendamentos", id));
    carregarAdmin();
  } catch (error) {
    console.error("Erro ao excluir agendamento:", error);
  }
};

/* ===================================== */
/* STATUS BARBEARIA PREMIUM              */
/* ===================================== */
function verificarStatus() {
  let agora = new Date();
  let dia = agora.getDay();
  let horaAtual = agora.getHours() + (agora.getMinutes() / 60);

  let status = document.getElementById("statusBarbearia");
  if (!status) return;

  let aberto = false;

  if (dia === 1 || dia === 0) {
    abento = false;
  }
  else if ((dia === 2 || dia === 3) && horaAtual >= 9 && horaAtual < 18) {
    aberto = true;
  }
  else if (dia === 4 && horaAtual >= 9 && horaAtual < 19.5) {
    aberto = true;
  }
  else if (dia === 5 && horaAtual >= 8 && horaAtual < 20) {
    aberto = true;
  }
  else if (dia === 6 && horaAtual >= 7 && horaAtual < 19) {
    aberto = true;
  }

  if (aberto) {
    status.innerHTML = "🟢 Aberto agora";
    status.style.color = "#2ecc71";
  } else {
    status.innerHTML = "🔴 Fechado no momento";
    status.style.color = "#ff4d4d";
  }
}

/* ===================================== */
/* CARROSSEL PREMIUM                     */
/* ===================================== */
let slideAtual = 0;
let slides = [];

function mostrarSlide(index) {
  if (!slides.length) return;

  if (index >= slides.length) slideAtual = 0;
  if (index < 0) slideAtual = slides.length - 1;

  slides.forEach((slide) => {
    slide.style.display = "none";
  });

  if (slides[slideAtual]) {
    slides[slideAtual].style.display = "block";
  }
}

window.mudarSlide = function (direcao) {
  if (!slides.length) return;
  slideAtual += direcao;
  mostrarSlide(slideAtual);
};

document.addEventListener("DOMContentLoaded", () => {
  slides = document.querySelectorAll(".slide");

  if (slides.length > 0) {
    mostrarSlide(slideAtual);

    setInterval(() => {
      slideAtual++;
      mostrarSlide(slideAtual);
    }, 4000);
  }
});

/* ==========================================================================
   SISTEMA DE AVALIAÇÕES REAIS (FIREBASE FIRESTORE INTEGRADO)               
   ========================================================================== */
const containerAval = document.getElementById("containerAvaliacoesReais");

if (containerAval) {
  const qAval = query(collection(db, "avaliacoes"), orderBy("dataEnvio", "desc"));
  
  onSnapshot(qAval, (snapshot) => {
    containerAval.innerHTML = ""; 
    
    if (snapshot.empty) {
      containerAval.innerHTML = '<p class="carregando-comentarios">Ainda sem avaliações reais. Seja o primeiro a deixar um comentário! 💈</p>';
      return;
    }
    
    snapshot.forEach((docSnap) => {
      const dados = docSnap.data();
      let estrelasStr = "⭐".repeat(parseInt(dados.nota));

      const card = document.createElement("div");
      card.className = "avaliacao-card";
      card.innerHTML = `
        <div class="estrelas">${estrelasStr}</div>
        <p>"${dados.comentario}"</p>
        <strong>${dados.nome}</strong>
      `;
      containerAval.appendChild(card);
    });
  }, (error) => {
    console.error("Erro no Listener de avaliações:", error);
  });
}

window.enviarAvaliacao = async function() {
  const nomeInput = document.getElementById("aval-nome");
  const notaSelect = document.getElementById("aval-nota");
  const comentarioInput = document.getElementById("aval-comentario");

  if (!nomeInput || !comentarioInput || !notaSelect) return;

  if (!nomeInput.value.trim() || !comentarioInput.value.trim()) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Por favor, informe seu nome e escreva uma avaliação.",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
    return;
  }

  try {
    await addDoc(collection(db, "avaliacoes"), {
      nome: nomeInput.value.trim(),
      nota: notaSelect.value,
      comentario: comentarioInput.value.trim(),
      dataEnvio: new Date()
    });

    Swal.fire({
      icon: "success",
      title: "Muito obrigado!",
      text: "Sua avaliação real foi registrada com sucesso!",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });

    nomeInput.value = "";
    comentarioInput.value = "";
    notaSelect.value = "5";

  } catch (erro) {
    console.error("Erro ao salvar comentário:", erro);
    Swal.fire({
      icon: "error",
      title: "Erro de conexão",
      text: "Não foi possível processar seu comentário. Verifique suas regras ou conexão.",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
  }
};

/* ==========================================================================
   ROTINA DO LIGHTBOX (ABRIR MÍDIA EXPANDIDA NO CLIQUE)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const figurasEspaco = document.querySelectorAll(".galeria-espaco figure");
  
  figurasEspaco.forEach(figure => {
    figure.addEventListener("click", () => {
      const midiaOriginal = figure.querySelector("img, video");
      if (!midiaOriginal) return;

      const lightbox = document.getElementById("lightbox");
      const containerConteudo = lightbox.querySelector(".lightbox-conteudo");
      
      containerConteudo.innerHTML = "";

      if (midiaOriginal.tagName.toLowerCase() === "img") {
        const novaImg = midiaOriginal.cloneNode(true);
        containerConteudo.appendChild(novaImg);
      } 
      else if (midiaOriginal.tagName.toLowerCase() === "video") {
        const novoVideo = document.createElement("video");
        novoVideo.src = midiaOriginal.src;
        novoVideo.controls = true; 
        novoVideo.autoplay = true;
        novoVideo.playsinline = true;
        containerConteudo.appendChild(novoVideo);
      }

      lightbox.style.display = "flex";
    });
  });
});

window.fecharLightbox = function() {
  const lightbox = document.getElementById("lightbox");
  const containerConteudo = lightbox.querySelector(".lightbox-conteudo");
  
  const videoRodando = containerConteudo.querySelector("video");
  if (videoRodando) {
    videoRodando.pause();
  }

  lightbox.style.display = "none";
};