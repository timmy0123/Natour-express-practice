/* eslint-disable */

export const displayMap = (locations) => {
  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
  }).setView([31.111745, -118.113491], 5);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const markerArray = [];
  locations.forEach((loc) => {
    const reversedArr = [...loc.coordinates].reverse();

    const myIcon = L.icon({
      iconUrl: './../img/pin.png',
      iconSize: [30, 35],
      iconAnchor: [15, 35],
    });

    L.marker(reversedArr, { icon: myIcon }).addTo(map);
    L.popup({ offset: [0, -20] })
      .setLatLng(reversedArr)
      .setContent(`Day ${loc.day}: ${loc.description}`)
      .addTo(map);
    markerArray.push(reversedArr);
  });
  const bounds = L.latLngBounds(markerArray);
  map.fitBounds(bounds);
};
