const sendMsg = document.querySelector('.sendMsg-btn');
const msgToSend = document.getElementsByTagName('textarea')[0];
/* This client's user */
const username = localStorage.getItem('username');
const socket = io('/', { query: { username } });

document.querySelector('.welcome-msg').textContent = `Welcome to B-Chat, ${username}!`

/**
 * A helper function that takes an object with information about a message,
 * and a class to determine whether this is a sent or a recieved message
 * */
function renderMsg(messageObj, msgAttribute) {
  const chatbox = document.querySelector('.chatbox');
  const newMsg = document.createElement('p');
  const msgContent = document.createTextNode(messageObj.message.value);
  const msgContainer = document.createElement('div');
  newMsg.appendChild(msgContent);
  msgContainer.classList.add(msgAttribute, 'msgContainer');
  msgContainer.appendChild(newMsg);

  const userStamp = document.createElement('p');
  const stamp = document.createTextNode(`Sent by ${messageObj.username} at ${messageObj.timestamp.value}`);
  userStamp.appendChild(stamp);
  userStamp.classList.add('user-stamp');
  msgContainer.appendChild(userStamp);
  chatbox.appendChild(msgContainer);
};

/* Send the value of the text area when the send button is clicked */
sendMsg.addEventListener('click', () => {
  if (!msgToSend.value) {
    return;
  }
  const messageObj = {
    message: {
      value: msgToSend.value
    },
    username,
    timestamp: {
      value: Date()
    }
  };
  renderMsg(messageObj, 'myMsgs');
  socket.emit('message', messageObj);
  msgToSend.value = '';
});

/* Update the online users when the announce event is fired */
socket.on('announce', (users) => {
  const usernamesContainer = document.querySelector('.usernames-container');
  const usersNumberSpan = document.getElementById('users-num');
  usersNumberSpan.textContent = users.length == 1 ? 0 : users.length - 1;
  usernamesContainer.innerHTML = '';
  users.forEach(user => {
    if (user != username) {
      const span = document.createElement('span');
      span.innerText += `-> ${user}`;
      usernamesContainer.appendChild(span);
    }
  });
});

/* When a message is recieved update the page with the new message */
socket.on('message', (messageObj) => {
  renderMsg(messageObj, 'theirMsgs');
});
