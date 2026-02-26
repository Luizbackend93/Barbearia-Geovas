function scrollToAgendamento(){
  document.getElementById("agendamento").scrollIntoView({behavior:"smooth"});
}

function login(){
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if(user === "Geovas" && pass === "1234"){
    localStorage.setItem("logado", "true");
    window.location.href = "admin.html";
  } else {
    alert("Login incorreto!");
  }
}

function logout(){
  localStorage.removeItem("logado");
  window.location.href = "index.html";
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

  agendamentos.push({nome, servico, data, hora});
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));

  let mensagem = `Olá, meu nome é ${nome}. Quero agendar ${servico} no dia ${data} às ${hora}.`;
  let telefone = "5531987930848"; // COLOQUE SEU NÚMERO
  window.open(`https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`);

  alert("Agendamento realizado com sucesso!");
}

if(window.location.pathname.includes("admin.html")){
  if(localStorage.getItem("logado") !== "true"){
    window.location.href = "login.html";
  }

  let lista = document.getElementById("listaAgendamentos");
  let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

  agendamentos.forEach((ag, index) => {
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