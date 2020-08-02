const socket = io()
const form = document.getElementById('message-form');
const formButton = document.getElementById('form-button');
const userInputField = document.getElementById('user-message');
const locationButton = document.getElementById('find-me');
const messageDisplay = document.getElementById('message-display');


// Templates
const messageTemplate = document.getElementById('message-template').innerHTML
const locationMessageTemplate = document.getElementById('location-message-template').innerHTML
const sideBarTemplate = document.getElementById('sidebar-template').innerHTML

// Options
const username = location.search.substring(1).split('&')[0].split('=')[1];
const room = location.search.substring(1).split('&')[1].split('=')[1];

// AutoScroll Behavior
const autoscroll = () => {
     // New message element
     const newMessage = messageDisplay.lastElementChild


     // Height of the new message
     const newMessageStyles = getComputedStyle(newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = newMessage.offsetHeight + newMessageMargin

     // Visible height
     const visibleHeight = newMessage.offsetHeight

     // Height of messages container
     const containerHeight = newMessage.scrollHeight

     // How far have I scrolled?
     const scrollOffset = newMessage.scrollTop + visibleHeight

     if (containerHeight - newMessageHeight <= scrollOffset) {
          newMessage.scrollTop = newMessage.scrollHeight
     }
}

socket.on('message', (message) => {
     const html = Mustache.render(messageTemplate, {
          username: message.username,
          message: message.text,
          createdAt: message.createdAt
     });
     messageDisplay.insertAdjacentHTML('beforeend', html);
     autoscroll()
})

socket.on('locationMessage', (message) => {
     const html = Mustache.render(locationMessageTemplate, {
          username: message.username,
          url: message.url,
          createdAt: message.createdAt
     })
     messageDisplay.insertAdjacentHTML('beforeend', html);
     autoscroll()
})

socket.on('roomData', (data) => {
     const html = Mustache.render(sideBarTemplate, {
          room: data.room,
          users: data.users
     })
     document.getElementById('sidebar').innerHTML = html
})


form.addEventListener('submit', (e) => {
     e.preventDefault();
     // Temporarily disable the form on submission
     formButton.setAttribute('disabled', 'disabled');
     // Get the user input from the form
     const message = userInputField.value;

     // Send the server the user input from the form
     socket.emit('sendMessage', message, (error) => {
          // Re-enable the form submit button
          formButton.removeAttribute('disabled');
          // Clear the form field
          userInputField.value = '';

          if (error) {
               return console.log(error);
          }
     })
})

function geoFindMe() {

     const status = document.querySelector('#status');
     const mapLink = document.querySelector('#map-link');

     mapLink.href = '';
     mapLink.textContent = '';

     locationButton.setAttribute('disabled', 'disabled');

     function success(position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          status.textContent = '';
          // mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
          // mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;

          socket.emit('sendLocation', {
               latitude: position.coords.latitude,
               longitude: position.coords.longitude
          }, () => {
               console.log('Location shared')
               locationButton.removeAttribute('disabled');
          })
     }

     function error() {
          status.textContent = 'Unable to retrieve your location';
     }

     if (!navigator.geolocation) {
          status.textContent = 'Geolocation is not supported by your browser';
     } else {
          status.textContent = 'Locating…';
          navigator.geolocation.getCurrentPosition(success, error);
     }

}

socket.emit('join', { username, room }, (error) => {
     if (error) {
          alert(error);
          location.href = '/'
     }

})

document.querySelector('#find-me').addEventListener('click', geoFindMe);



