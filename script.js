let selectHora = document.getElementById("hora");
let inputData = document.getElementById("data");

inputData.addEventListener("change", gerarHorarios);

function gerarHorarios(){

let data = new Date(inputData.value);

let dia = data.getDay();

selectHora.innerHTML = "<option>Selecione o horário</option>";

let horarios = [];

if(dia === 0){

alert("Domingo não temos expediente");

return;

}

if(dia === 6){

horarios = [
"12:00",
"13:30",
"15:00"
];

}else{

horarios = [
"15:30",
"17:00"
];

}

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

horarios.forEach(horario => {

let ocupado = agendamentos.some(ag => 
ag.data === inputData.value && ag.hora === horario
);

if(!ocupado){

let option = document.createElement("option");

option.value = horario;

option.textContent = horario;

selectHora.appendChild(option);

}

});

}

function agendar(){

let nome = document.getElementById("nome").value;

let servico = document.getElementById("servico").value;

let data = document.getElementById("data").value;

let hora = document.getElementById("hora").value;

if(!nome || !data || hora === "Selecione o horário"){

alert("Preencha todos os campos");

return;

}

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

agendamentos.push({nome,servico,data,hora});

localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

let mensagem = `Olá, meu nome é ${nome}. Quero agendar ${servico} no dia ${data} às ${hora}`;

let telefone = "5531987930848";

window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`);

alert("Agendamento realizado!");

location.reload();

}
