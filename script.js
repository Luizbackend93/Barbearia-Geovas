function scrollToAgendamento(){
  document.getElementById("agendamento").scrollIntoView({behavior:"smooth"});
}

function login(){
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if(user === "Geovane" && pass === "171nortesul"){
    localStorage.setItem("logado","true");
    window.location.href="admin.html";
  }else{
    alert("Login incorreto!");
  }
}

function logout(){
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


function gerarHorarios(){

let data = document.getElementById("data").value;

if(!data) return;

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

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

let selectHora = document.getElementById("hora");

selectHora.innerHTML = '<option value="">Selecione o horário</option>';

horarios.forEach(h => {

let ocupado = agendamentos.some(a => a.data === data && a.hora === h);

if(!ocupado){

let option = document.createElement("option");

option.value = h;
option.textContent = h;

selectHora.appendChild(option);

}

});

}

function agendar(){

let nome = document.getElementById("nome").value;
let servico = document.getElementById("servico").value;
let data = document.getElementById("data").value;
let hora = document.getElementById("hora").value;

if(!nome || !data || !hora){
alert("Preencha todos os campos!");
return;
}

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

agendamentos.push({nome,servico,data,hora});

localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

let mensagem = `Olá, meu nome é ${nome}. Quero agendar ${servico} no dia ${data} às ${hora}.`;

let telefone = "5531987930848";

window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`);

alert("Agendamento realizado!");

location.reload();

}

if(window.location.pathname.includes("admin.html")){

if(localStorage.getItem("logado") !== "true"){
window.location.href="login.html";
}

let lista = document.getElementById("listaAgendamentos");

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

agendamentos.forEach((ag,index)=>{

lista.innerHTML += `
<div class="card">
<p><strong>Cliente:</strong> ${ag.nome}</p>
<p><strong>Serviço:</strong> ${ag.servico}</p>
<p><strong>Data:</strong> ${ag.data}</p>
<p><strong>Hora:</strong> ${ag.hora}</p>
<button onclick="excluir(${index})">Excluir</button>
</div>
`;

});

}

function excluir(index){

let agendamentos = JSON.parse(localStorage.getItem("agendamentos"));

agendamentos.splice(index,1);

localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

location.reload();

}


/* ============================= */
/* CARROSSEL DE FOTOS */
/* ============================= */

let slideIndex = 0;

function mudarSlide(direcao){

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
function mostrarAgendamentos(){

let lista = document.getElementById("lista");

if(!lista) return;

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

lista.innerHTML = "";

agendamentos.forEach((ag)=>{

let li = document.createElement("li");

li.innerHTML = `${ag.nome} - ${ag.servico} - ${ag.data} às ${ag.hora}`;

lista.appendChild(li);

});

}
