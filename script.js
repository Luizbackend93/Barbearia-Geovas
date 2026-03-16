import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

window.scrollToAgendamento = function(){
  document.getElementById("agendamento").scrollIntoView({behavior:"smooth"});
}

window.login = async function(){

  let email = document.getElementById("user").value;
  let senha = document.getElementById("pass").value;

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "admin.html";
  } catch (error) {
    alert("Email ou senha incorretos!");
  }

}

window.logout = async function(){
  await signOut(auth);
  window.location.href = "index.html";
}

window.onload = function(){

let dataInput = document.getElementById("data");

if(dataInput){
dataInput.addEventListener("change", gerarHorarios);
}

// verificar se barbearia está aberta
verificarStatus();

setInterval(verificarStatus, 60000);

};


async function gerarHorarios(){

let data = document.getElementById("data").value;

if(!data) return;

// Converte para 00/00/0000
let partesFormat = data.split("-");
let dataFormatada = `${partesFormat[2]}/${partesFormat[1]}/${partesFormat[0]}`;

let partes = data.split("-");
let dataObj = new Date(partes[0], partes[1]-1, partes[2]);

let dia = dataObj.getDay();

let horarios = [];

if(dia === 0){
alert("Domingo não temos expediente");
return;
}

if(dia === 6){

// SÁBADO
horarios = [
"09:00",
"10:30",
"12:00",
"13:30",
"15:00",
"16:30"
];

}else{

// SEGUNDA A SEXTA
horarios = [
"09:00",
"10:30",
"12:00",
"13:30",
"15:00",
"16:30",
"18:00"
];

}
const q = query(
collection(db, "agendamentos"),
where("data", "==", dataFormatada)
);

const querySnapshot = await getDocs(q);


let agendamentos = [];

querySnapshot.forEach((doc) => {
  agendamentos.push(doc.data());
});
  
let selectHora = document.getElementById("hora");

selectHora.innerHTML = '<option value="">Selecione o horário</option>';

horarios.forEach(h => {

let ocupado = agendamentos.some(a => a.data === dataFormatada && a.hora === h);

if(!ocupado){

let option = document.createElement("option");

option.value = h;
option.textContent = h;

selectHora.appendChild(option);

}

});
// CONTADOR DE HORÁRIOS LIVRES
let livres = horarios.filter(h => 
!agendamentos.some(a => a.data === dataFormatada && a.hora === h)
);

// Próximo horário disponível
let proximo = livres.length > 0 ? livres[0] : null;

let proximoHorario = document.getElementById("proximoHorario");
let horariosRestantes = document.getElementById("horariosRestantes");

if(proximo){
proximoHorario.innerText = "⏰ Próximo horário disponível: " + proximo;
horariosRestantes.innerText = "📊 Horários livres hoje: " + livres.length;
}else{
proximoHorario.innerText = "❌ Não há horários disponíveis hoje";
horariosRestantes.innerText = "";
}

}

window.agendar = async function(){
  
let nome = document.getElementById("nome").value;
let servico = document.getElementById("servico").value;
let dataInput = document.getElementById("data").value;

if(!dataInput){
  alert("Escolha uma data!");
  return;
}

let hoje = new Date();
hoje.setHours(0,0,0,0);

let partesData = dataInput.split("-");
let dataEscolhida = new Date(partesData[0], partesData[1]-1, partesData[2]);

if(dataEscolhida < hoje){
  alert("Não é possível agendar em datas passadas!");
  return;
}

// Converter para 00/00/0000
let partes = dataInput.split("-");
let dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
let hora = document.getElementById("hora").value;

if(!nome || !hora){
  alert("Preencha todos os campos!");
  return;
}

await addDoc(collection(db, "agendamentos"), {
  nome: nome,
  servico: servico,
  data: dataFormatada,
  hora: hora
});

await gerarHorarios();

let mensagem = `Olá, meu nome é ${nome}. Quero agendar ${servico} no dia ${dataFormatada} às ${hora}.`;

let telefone = "5531987930848";

alert("Agendamento realizado!");

const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
window.location.href = url;
}
/* ============================= */
/* ADMIN */
/* ============================= */

if(window.location.pathname.includes("admin.html")){

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      carregarAdmin();
    }
  });

}

async function carregarAdmin(){

let lista = document.getElementById("listaAgendamentos");

if(!lista) return;

lista.innerHTML = "";

const querySnapshot = await getDocs(collection(db, "agendamentos"));

let hoje = new Date();
hoje.setHours(0,0,0,0);

let agendamentos = [];

for (const docItem of querySnapshot.docs) {

  let ag = docItem.data();
  ag.id = docItem.id;

let partes = ag.data.split("/");

// cria data + hora do agendamento
let horaParts = ag.hora.split(":");

let dataHoraAg = new Date(
  partes[2],
  partes[1]-1,
  partes[0],
  horaParts[0],
  horaParts[1]
);

let agora = new Date();

if(dataHoraAg < agora){

  await deleteDoc(doc(db, "agendamentos", ag.id));

}else{

  agendamentos.push(ag);

}

}

// ordenar por data e hora
agendamentos.sort((a,b)=>{

let da = a.data.split("/").reverse().join("-");
let db = b.data.split("/").reverse().join("-");

let dataA = new Date(da + " " + a.hora);
let dataB = new Date(db + " " + b.hora);

return dataA - dataB;

});

agendamentos.forEach((ag)=>{

lista.innerHTML += `
<div class="card">
<p><strong>Cliente:</strong> ${ag.nome}</p>
<p><strong>Serviço:</strong> ${ag.servico}</p>
<p><strong>Data:</strong> ${ag.data}</p>
<p><strong>Hora:</strong> ${ag.hora}</p>
<button onclick="excluir('${ag.id}')">Excluir</button>
</div>
`;

});

}

window.excluir = async function(id){
  
await deleteDoc(doc(db, "agendamentos", id));

alert("Agendamento excluído!");

carregarAdmin();

}
function verificarStatus(){

let agora = new Date();

let dia = agora.getDay();
let hora = agora.getHours();
let minuto = agora.getMinutes();

let horaAtual = hora + minuto/60;

let status = document.getElementById("statusBarbearia");

if(!status) return;

// Domingo
if(dia === 0){
status.innerText = "🔴 Fechado hoje";
status.style.color = "red";
return;
}

// Segunda a Sexta
if(dia >= 1 && dia <= 5){

if(horaAtual >= 9 && horaAtual < 18){
status.innerText = "🟢 Aberto agora";
status.style.color = "#2ecc71";
}else{
status.innerText = "🔴 Fechado — abre às 09:00";
status.style.color = "red";
}

}

// Sábado
if(dia === 6){

if(horaAtual >= 9 && horaAtual < 16.5){
status.innerText = "🟢 Aberto agora";
status.style.color = "#2ecc71";
}else{
status.innerText = "🔴 Fechado — abre às 09:00";
status.style.color = "red";
}

}

}


/* ============================= */
/* CARROSSEL DE FOTOS */
/* ============================= */

let slideIndex = 0;

window.mudarSlide = function(direcao){

const slides = document.querySelector(".slides");
const total = document.querySelectorAll(".slide").length;

slideIndex += direcao;

if(slideIndex < 0){
slideIndex = total - 1;
}

if(slideIndex >= total){
slideIndex = 0;
}
slides.style.transform = "translateX(" + (-slideIndex * 100) + "%)";

}
