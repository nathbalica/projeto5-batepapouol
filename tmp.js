function renderChats() {
    axios.get('https://mock-api.driven.com.br/api/vm/uol/messages')
      .then(renderMessages)
      .catch(errorHandler);
  
    function renderMessages(response) {
      const ulMessages = document.querySelector('.chats');
      let messages = response.data;
  
      messages.forEach(message => {
        let liClass = '';
        let messageContent = '';
  
        switch (message.type) {
          case 'status':
            liClass = 'status-message enter-out-room';
            messageContent = `${message.text}`;
            break;
          case 'message':
            liClass = 'message public';
            messageContent = `${message.from} para Todos: ${message.text}`;
            break;
          case 'private_message':
            liClass = 'private-message private';
            messageContent = `${message.from} reservadamente para ${message.to}: ${message.text}`;
            break;
          default:
            console.error(`Unknown message type: ${message.type}`);
            return;
        }
  
        ulMessages.innerHTML += `
          <li class="${liClass}">
            <span class="time">(${message.time})</span>
            <span class="user">${message.from}</span>
            ${messageContent}
          </li>
        `;
      });
    }
  }