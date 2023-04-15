axios.defaults.headers.common['Authorization'] = 'kksZoUujYOBy6P4KbiXoQXMT';

// let currentUsers = [];
let nameInput;

let inputLogin = document.querySelector('.input-name')
let inputChat = document.querySelector('.input-write')

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function renderMessages({messages}) {
  const ulMessages = document.querySelector('.chats');
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
      <li class="${liClass}">
        <span class="time">(${message.time})</span>
        <span data-test="message" class="span-message">${messageContent}</span>
      </li>
    `;
    
    if (!renderedMessages.includes(renderedMessage)) {
      renderedMessages.push(renderedMessage);
    }
  });

  // Renderiza apenas as novas mensagens
  const newMessages = renderedMessages.filter(message => !ulMessages.innerHTML.includes(message));
  ulMessages.innerHTML += newMessages.join('');

  scrollToBottom();
}

async function sendMessages(type='message'){
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
  
    try{
      await axios.post("https://mock-api.driven.com.br/api/vm/uol/messages", message);
    }catch(err){
      alert('Não foi possível enviar a mensagem desejada.');
    }
}

const chatIntervals = {
  status:null,
  messages:null,
  participants: null
};

/**
 * Quando usuário acaba de entrar em uma sala.
 */
async function onUserEntered({name}) {
  const data = {
    participants: [],
    messages:[],
  };

  // Lidar com o DOM
  inputChat.addEventListener('keypress', function(e){
    if(e.keyCode === 13){
      sendMessages();
      clearTextArea();
    }
  }, false);

  document.querySelector('.input-screen').classList.remove('visible');

  /**
   * Renderiza chat.
   */
  function render(){
    renderMessages({messages:data.messages});
  }

  async function fetchMessagesAndRender(){
    const {data: currentMessages} = await axios.get('https://mock-api.driven.com.br/api/vm/uol/messages');
      data.messages = currentMessages;
      render();
  }
  fetchMessagesAndRender();
  
  chatIntervals.messages = setInterval(fetchMessagesAndRender, 1000)

  chatIntervals.participants = setInterval(async ()=>{
    const {data:currentParticipants} = await axios.get('https://mock-api.driven.com.br/api/vm/uol/participants',{
      Accept:'application/json'
    });
    data.participants = currentParticipants;
    render();
  },5000);

  // Lida com request de status do usuário uma vez logado.  
  chatIntervals.status = setInterval( async ()=>{
    await axios.post('https://mock-api.driven.com.br/api/vm/uol/status',{name},{
      headers:{
        'Content-type':'application/json'
      }
    });
  }, 5000);
}


/**
 * Quando o usuário acaba de sair de uma sala.
 */
function onUserExited(){
  for(const i in chatIntervals){
    clearInterval(chatIntervals[i]);
    chatIntervals[i] = null;
  }
  inputChat.removeEventListener('keypress',onUserMessage, false);
}

/**
 * Quando o usuário deseja enviar uma mensagem.
 */
function onUserMessage(e){
  if(e.keyCode === 13){
    sendMessages();
    clearTextArea();
  }
}

/**
 * Quando o usuário deseja entrar na sala.
 */
async function onUserRegister() {
  // pegar o nome do input
  nameInput = document.querySelector(".input-name");
  console.log(nameInput);
  const name = nameInput.value

  // verificar se o nome é válido
  if (!name) {
    console.log('Nome inválido.');
    return;
  }
  console.info(`Tentando entrar com o usuário ${name}...`);

  try{
    await  axios.post('https://mock-api.driven.com.br/api/vm/uol/participants', {name},{
      'Content-type':"application/json"
    })
    console.info(`Usuário ${name} agora esta presente na sala.`);
  }catch(err){
    if(err?.response?.status >= 400){ 
        if(err?.response?.status === 400){
          return alert(`Um usuário ja existe com o nome ${name}`)
      }else{
        return alert(`Não foi possível entrar nesta sala, tente novamente mais tarde.`);
      }
    }
  }

  onUserEntered({name});
}


function clearTextArea(){
  inputChat.value = '';
}

inputLogin.addEventListener('keypress', function(e){
    if(e.keyCode === 13){
      onUserRegister();
      clearTextArea();
    }
  }, false);
  

