axios.defaults.headers.common['Authorization'] = 'kksZoUujYOBy6P4KbiXoQXMT';

// let currentUsers = [];
let nameInput;
let userName;
let logged = false;
let currentUser;

let intervalId;

let inputLogin = document.querySelector('.input-name')
let inputChat = document.querySelector('.input-write')

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}


function renderChats(){
  if (logged){
    axios.get('https://mock-api.driven.com.br/api/vm/uol/messages')
      .then(renderMessages)
      .catch(errorHandler);
    }
  }

function renderMessages(response) {
  const ulMessages = document.querySelector('.chats');
  const messages = response.data;
  const enteredUsers = [];
  const exitedUsers = [];
  const renderedMessages = [];

  messages.forEach((message) => {
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
        messageContent = `<strong>${message.from}</strong> reservadamente para <strong>${message.to}</strong>: ${message.text}`;
        break;
      default:
        console.error(`Unknown message type: ${message.type}`);
        return;
    }

    const renderedMessage = `
      <li data-test="message" class="${liClass}">
        <span class="time">(${message.time})</span>
        ${messageContent}
      </li>
    `;

    // Verifica se a mensagem já existe na lista de mensagens
    if (!ulMessages.innerHTML.includes(renderedMessage)) {
      // Adiciona a mensagem à lista de mensagens renderizadas
      renderedMessages.push(renderedMessage);
    }
  });

  // Renderiza apenas as novas mensagens
  ulMessages.insertAdjacentHTML('beforeend', renderedMessages.join(''));

  scrollToBottom();
}

function sendMessages(type='message'){
  if (logged){
    const now = new Date();
    const time = now.toLocaleTimeString('pt-BR');
  
    nameInput = document.querySelector(".input-name");
    const text = document.querySelector('.input-write');
    
    const message = {
      from: nameInput.value,
      to: "Todos",
      text: text.value,
      type: type, // ou "private_message" para o bônus
      time: time
    }
    if (logged){
      axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message)
      .then(responseReceived)
      .catch(erroMessage);
    }
  }
}

keepLoggedIn: () => {
  axios
  .post('https://mock-api.driven.com.br/api/vm/uol/status', user)
  .catch(()=>{
      window.confirm('Usuário deslogado.');
      window.location.reload();
  });
},

function userOnline(user) {
  // Envia a requisição POST para manter o usuário online
  return setInterval(() => {
    axios.post('https://mock-api.driven.com.br/api/vm/uol/status', user)
      .catch(() => {
        window.confirm('Usuário deslogado.');
        window.location.reload();
      });
  }, 5000);

}

// function userEntered(user) {
//   logged = true
//   axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', user)
//     .then(() => {
//         responseReceived();
//         renderChats(); // atualiza a lista de usuários
//     })
//     .catch(errorHandler);
//   // Chama a função userOnline para manter o usuário online
//   userOnline(user);
// }

// function checkIfUserExists(user) {
//   return axios.get('https://mock-api.driven.com.br/api/vm/uol/participants')
//     .then(response => {
//       const participants = response.data;
//       const existingUser = participants.find(participant => participant.name.toLowerCase() === user.name.toLowerCase() && participant.status === 'online');
      
//       if (existingUser) {
//         return Promise.reject(new Error('Já existe um usuário online com esse nome. Por favor, escolha outro nome.'));
//       } else {
//         // Fazer a requisição para o servidor
//         userEntered(user);
//       }
//     })
//     .catch(error => {
//       console.error(error.message);
//       return Promise.reject(error);
//     });
// }

function userRegister() {
  // pegar o nome do input
  nameInput = document.querySelector(".input-name");
  userName = nameInput.value

  while(nameInput === '' || nameInput === null){
    alert('Nome de usuário inválido! Digite um nome valido');
    document.querySelector('.input-screen').classList.add('visible');
  }

  // criar objeto com os dados do usuario
  const user = {
    name: userName
  };

  console.log(user)

  axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', user)
  .then(response => {
          logged = true;
          document.querySelector('.input-screen').classList.remove('visible');
          renderChats(); // atualiza a lista de usuários
          responseReceived(response);
          setInterval(() => {
            axios.post('https://mock-api.driven.com.br/api/vm/uol/status', user)
              .catch(() => {
                window.confirm('Usuário deslogado.');
                window.location.reload();
              });
          }, 5000);
        }
      )
  .catch(error => {
      if ( error.response.status === 400 ){
        alert('Nome de usuário inválido! Digite um nome valido');
        document.querySelector('.input-screen').classList.add('visible');
        setTimeout(window.location.reload(), 1000);
      }else {
        alert('Ocorreu um errinho aqui. A culpa foi nossa, apenas tente recarregar a página <3');
    }
    });
}

function errorHandler() {
    console.log('Desconectado!');
    userRegister();
}
function responseReceived(response) {
  console.log(`sucesso ${response}!!!!! :D`);
  console.log(response);
}

function erroMessage(error) {
  if (error.response && error.response.status === 400) {
    console.log('Menssagem nao enviada com sucesso!');
  }
}


function clearTextArea(){
  inputChat.value = '';
}

inputLogin.addEventListener('keypress', function(e){
    if(e.keyCode === 13){
      userRegister();
      clearTextArea();
    }
  }, false);
  
inputChat.addEventListener('keypress', function(e){
  if(e.keyCode === 13){
    sendMessages();
    clearTextArea();
  }
}, false);

setInterval(renderChats, 3000);