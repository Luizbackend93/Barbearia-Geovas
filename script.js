import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy  } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

window.scrollToAgendamento = function(){
  document.getElementById("agendamento").scrollIntoView({behavior:"smooth"});
}

window.login = function(){
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if(user === "Geovane" && pass === "171nortesul"){
    localStorage.setItem("logado","true");
    window.location.href="admin.html";
  }else{
    alert("Login incorreto!");
  }
}

window.logout = function(){
  localStorage.removeItem("logado");
  window.location.href="index.html";
}

window.onload = function(){

let dataInput = document.getElementById("data");
  

if(dataInput){
dataInput.addEventListener("change", gerarHorarios);
}

mostrarAgendamentos();

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

horarios = [
"12:00",
"13:30",
"15:00",
"16:30"
];

}else{

horarios = [
"15:30",
"17:00",
"18:30"
];

}

const querySnapshot = await getDocs(collection(db, "agendamentos"));

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

}

window.agendar = async function(){
  
let nome = document.getElementById("nome").value;
let servico = document.getElementById("servico").value;
let dataInput = document.getElementById("data").value;
let hoje = new Date();
let partesData = dataInput.split("-");
let dataEscolhida = new Date(partesData[0], partesData[1]-1, partesData[2]);

if(dataEscolhida < hoje.setHours(0,0,0,0)){
  alert("Não é possível agendar em datas passadas!");
  return;
}

if(!dataInput){
  alert("Escolha uma data!");
  return;
}

// Converte 2026-03-02 → 02/03/2026
let partes = dataInput.split("-");
let dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
let hora = document.getElementById("hora").value;

if(!nome || !dataInput || !hora){
alert("Preencha todos os campos!");
return;
}

await addDoc(collection(db, "agendamentos"), {
  nome: nome,
  servico: servico,
 data: dataFormatada,
  hora: hora
});

let mensagem = `Olá, meu nome é ${nome}. Quero agendar ${servico} no dia ${dataFormatada} às ${hora}.`;

let telefone = "5531987930848";

window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`);

alert("Agendamento realizado!");

location.reload();

}
/* ============================= */
/* ADMIN */
/* ============================= */

if(window.location.pathname.includes("admin.html")){

if(localStorage.getItem("logado") !== "true"){
window.location.href="login.html";
}

carregarAdmin();

}

async function carregarAdmin(){

let lista = document.getElementById("listaAgendamentos");

if(!lista) return;

lista.innerHTML = "";

import { query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const q = query(collection(db, "agendamentos"), orderBy("data"));
const querySnapshot = await getDocs(q);

querySnapshot.forEach((docItem) => {

let ag = docItem.data();
let id = docItem.id;

lista.innerHTML += `
<div class="card">
<p><strong>Cliente:</strong> ${ag.nome}</p>
<p><strong>Serviço:</strong> ${ag.servico}</p>
<p><strong>Data:</strong> ${ag.data}</p>
<p><strong>Hora:</strong> ${ag.hora}</p>
<button onclick="excluir('${id}')">Excluir</button>
</div>
`;

});

}

window.excluir = async function(id){
  
await deleteDoc(doc(db, "agendamentos", id));

alert("Agendamento excluído!");

carregarAdmin();

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

/* ============================= */
/* MOSTRAR AGENDAMENTOS */
/* ============================= */

async function mostrarAgendamentos(){

let lista = document.getElementById("lista");

if(!lista) return;

lista.innerHTML = "";

const querySnapshot = await getDocs(collection(db, "agendamentos"));

querySnapshot.forEach((doc) => {

let ag = doc.data();

let li = document.createElement("li");

li.innerHTML = `${ag.nome} - ${ag.servico} - ${ag.data} às ${ag.hora}`;

lista.appendChild(li);

});

}
