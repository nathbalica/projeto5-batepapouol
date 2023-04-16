axios.defaults.headers.common['Authorization'] = 'kksZoUujYOBy6P4KbiXoQXMT';

// let currentUsers = [];
let userName;
let keepConnected;

let messages = [];

let inputChat = document.querySelector('.input-write')

function renderMessages(response) {
    const ulMessages = document.querySelector('.chats');
    let messages = response.data;
    let enteredUsers = [];
    let exitedUsers = [];
    let renderedMessages = [];
  
    messages.forEach(message => {
      let liClass = '';
      let messageContent = '';
  
      switch (message.type) {
        case 'status':
          if (message.text === 'entra na sala...') {
            if (!enteredUsers.includes(message.from)) {
              enteredUsers.push(message.from);
            } else {
              return;
            }
          } else if (message.text === 'sai da sala...') {
            if (!exitedUsers.includes(message.from)) {
              exitedUsers.push(message.from);
            } else {
              return;
            }
          }
          liClass = 'status-message enter-out-room';
          messageContent = `<strong>${message.from}</strong> ${message.text}`;
          break;
        case 'message':
          liClass = 'message public';
          messageContent = `<strong>${message.from}</strong> para <strong>Todos:</strong> ${message.text}`;
          break;
        case 'private_message':
          liClass = 'private-message private';
          messageContent =  `<strong>${message.from}</strong> reservadamente para <strong>${message.to}</strong>: ${message.text}`;
          break;
        default:
          console.error(`Unknown message type: ${message.type}`);
          return;
      }
  
      const renderedMessage = `
      <li data-test="message" class="${liClass}">
      <span class="time">(${message.time})</span>
      ${messageContent}</li>`;
      
      if (!renderedMessages.includes(renderedMessage)) {
        renderedMessages.push(renderedMessage);
      }
    });
  
    // Renderiza apenas as novas mensagens
    const newMessages = renderedMessages.filter(message => !ulMessages.innerHTML.includes(message));
    ulMessages.innerHTML += newMessages.join('');
  
    scrollToBottom();
  }

function sendMessages(){
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR');

    const text = document.querySelector('.input-write');
    
    const message = {
      from: userName,
      to: "Todos",
      text: text.value,
      type: "message",
      time: time
    };

    axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message)
    .then(messageSentSucess)
    .catch(errorSendMessage);
}

function messageSentSucess(response){
  getMessages();
}

function getMessages(){
  axios.get("https://mock-api.driven.com.br/api/vm/uol/messages")
  .then(sucessGetMessage)
  .catch(errorGetMessage)
}

function userRegister() {
  // pegar o nome do input
  userName = prompt("Qual o seu nome?");

  // verificar se o nome é válido
  while(userName === '' || userName === null){
    alert('Nome de usuário inválido! Digite um nome valido');
    userName = prompt('Qual o seu nome?');
  }

  user = {
    'name' : userName
  }

  axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', user)
  .then(response => {
    responseReceived(response);

    // Exibe o histórico de mensagens
    getMessages();

    setInterval(getMessages, 3000);
  })
  .catch(existingdUser);


  keepConnected = setInterval(() => {
    axios.post('https://mock-api.driven.com.br/api/vm/uol/status', user)
      .catch(erroKeepConnected);
  }, 5000);

}

function sucessGetMessage(response){
  console.log(response);
  renderMessages(response);
}

function responseReceived(response) {
  console.log(`sucesso ${response.data}!!!!! :D`);
  console.log(response);
}

function erroGetMessage(error){
  console.log('Erro ao buscar as mensagens', error);
  alert('Ocorreu um erro ao buscar as mensagens do chat! Tente novamente mais tarde!');
}

function erroKeepConnected(error){
  console.log("Erro ao manter conectado...");
  console.log(error);
  alert('Ocorreu um erro inesperado, entre novamente informando um nome de usuário!');
  window.location.reload(true);
}

function errorGetMessage(error) {
  console.log('Erro ao buscar as mensagens');
  alert('Ocorreu um erro ao buscar as mensagens do chat! Tente novamente mais tarde!');
}

function errorSendMessage(error){
  console.log('Erro ao enviar mensagem');
  console.log(error);
  alert('Ocorreu um erro inesperado ao enviar a mensagem! Tente novamente mais tarde');
  window.location.reload();
}

function existingdUser(error) {
  if (error.response && error.response.status === 400) {
    alert('Já existe um usuário online com esse nome. Por favor, tente novamente.');
    window.location.reload(true);
    } else {
      alert('Ocorreu um erro no servidor! Tente novamente mais tarde');
    }
}
  
inputChat.addEventListener('keypress', function(e){
  if(e.keyCode === 13){
    sendMessages();
    inputChat.value = '';
  }
}, false);

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

userRegister();