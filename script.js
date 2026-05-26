import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ===================================== */
/* FIREBASE CONFIG */
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
/* SCROLL */
/* ===================================== */
window.scrollToAgendamento = function () {
  document
    .getElementById("agendamento")
    .scrollIntoView({
      behavior: "smooth"
    });
};

/* ===================================== */
/* LOGIN */
/* ===================================== */
window.login = async function () {
  let email = document.getElementById("user").value;
  let senha = document.getElementById("pass").value;

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
/* LOGOUT */
/* ===================================== */
window.logout = async function () {
  await signOut(auth);
  window.location.href = "index.html";
};

/* ===================================== */
/* ONLOAD */
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
/* GERAR HORÁRIOS PREMIUM */
/* ===================================== */
async function gerarHorarios() {
  let data = document.getElementById("data").value;
  if (!data) return;

  let partesFormat = data.split("-");
  let dataFormatada = `${partesFormat[2]}/${partesFormat[1]}/${partesFormat[0]}`;

  let dataObj = new Date(
    partesFormat[0],
    partesFormat[1] - 1,
    partesFormat[2]
  );

  let dia = dataObj.getDay();
  let horarios = [];

  /* SEGUNDA */
  if (dia === 1) {
    Swal.fire({
      icon: "warning",
      title: "Fechado na Segunda-feira",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
    return;
  }

  /* DOMINGO */
  if (dia === 0) {
    Swal.fire({
      icon: "warning",
      title: "Fechado no Domingo",
      confirmButtonColor: "#d4af37",
      background: "#111",
      color: "#fff"
    });
    return;
  }

  /* TERÇA E QUARTA */
  if (dia === 2 || dia === 3) {
    horarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  }

  /* QUINTA */
  if (dia === 4) {
    horarios = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:30"];
  }

  /* SEXTA */
  if (dia === 5) {
    horarios = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
  }

  /* SÁBADO */
  if (dia === 6) {
    horarios = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
  }

  /* BUSCAR AGENDAMENTOS */
  const q = query(
    collection(db, "agendamentos"),
    where("data", "==", dataFormatada)
  );

  const snapshot = await getDocs(q);
  let agendados = [];

  snapshot.forEach(doc => {
    agendados.push(doc.data());
  });

  let selectHora = document.getElementById("hora");
  selectHora.innerHTML = '<option value="">Selecione o horário</option>';

  horarios.forEach(h => {
    let ocupado = agendados.some(a => a.hora === h);

    if (!ocupado) {
      let option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      selectHora.appendChild(option);
    }
  });
}

/* ===================================== */
/* AGENDAR */
/* ===================================== */
window.agendar = async function () {
  let botao = document.querySelector(".agendamento button");
  botao.innerHTML = "Agendando...";
  botao.disabled = true;

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

    botao.innerHTML = "Confirmar Agendamento";
    botao.disabled = false;
    return;
  }

  let [servicoNome, servicoPreco] = servicoRaw.split("|");
  let servico = `${servicoNome} - R$${servicoPreco}`;
  let partes = dataInput.split("-");
  let dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;

  /* ===================================== */
  /* VERIFICAR DUPLICIDADE */
  /* ===================================== */
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

    botao.innerHTML = "Confirmar Agendamento";
    botao.disabled = false;
    return;
  }

  /* ===================================== */
  /* SALVAR AGENDAMENTO */
  /* ===================================== */
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

  botao.innerHTML = "Confirmar Agendamento";
  botao.disabled = false;

  setTimeout(() => {
    window.location.href = url;
  }, 2000);
};

/* ===================================== */
/* ADMIN LOGIN CHECK */
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

/* ===================================== */
/* CARREGAR ADMIN */
/* ===================================== */
async function carregarAdmin() {
  let lista = document.getElementById("listaAgendamentos");
  if (!lista) return;

  lista.innerHTML = "";

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
}

/* ===================================== */
/* EXCLUIR */
/* ===================================== */
window.excluir = async function (id) {
  await deleteDoc(doc(db, "agendamentos", id));
  carregarAdmin();
};

/* ===================================== */
/* STATUS BARBEARIA PREMIUM */
/* ===================================== */
function verificarStatus() {
  let agora = new Date();
  let dia = agora.getDay();
  let horaAtual = agora.getHours() + (agora.getMinutes() / 60);

  let status = document.getElementById("statusBarbearia");
  if (!status) return;

  let aberto = false;

  /* SEGUNDA */
  if (dia === 1) {
    aberto = false;
  }
  /* DOMINGO */
  else if (dia === 0) {
    aberto = false;
  }
  /* TERÇA E QUARTA */
  else if ((dia === 2 || dia === 3) && horaAtual >= 9 && horaAtual < 18) {
    aberto = true;
  }
  /* QUINTA */
  else if (dia === 4 && horaAtual >= 9 && horaAtual < 19.5) {
    aberto = true;
  }
  /* SEXTA */
  else if (dia === 5 && horaAtual >= 8 && horaAtual < 20) {
    aberto = true;
  }
  /* SÁBADO */
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
/* CARROSSEL PREMIUM */
/* ===================================== */
let slideAtual = 0;
let slides = [];

function mostrarSlide(index) {
  if (!slides.length) return;

  if (index >= slides.length) {
    slideAtual = 0;
  }

  if (index < 0) {
    slideAtual = slides.length - 1;
  }

  slides.forEach((slide) => {
    slide.style.display = "none";
  });

  slides[slideAtual].style.display = "block";
}

window.mudarSlide = function (direcao) {
  if (!slides.length) return;

  slideAtual += direcao;

  if (slideAtual >= slides.length) {
    slideAtual = 0;
  }

  if (slideAtual < 0) {
    slideAtual = slides.length - 1;
  }

  mostrarSlide(slideAtual);
};

document.addEventListener("DOMContentLoaded", () => {
  slides = document.querySelectorAll(".slide");

  if (slides.length > 0) {
    mostrarSlide(slideAtual);

    setInterval(() => {
      slideAtual++;

      if (slideAtual >= slides.length) {
        slideAtual = 0;
      }

      mostrarSlide(slideAtual);
    }, 4000);
  }
});
