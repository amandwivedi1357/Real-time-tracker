const socket = io();


const map = L.map('map').setView([0, 0], 10);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const markers = {};


if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
    }, (error) => {
        console.log(error);
    }, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
} else {
    console.log('Geolocation is not supported by your browser.');
}


socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;

    
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
       
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ${id}`)
            .openPopup();
    }
});


socket.on('initial-locations', (users) => {
    Object.keys(users).forEach(id => {
        const { latitude, longitude } = users[id];
     
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`User ${id}`)
            .openPopup();
    });
});


socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
