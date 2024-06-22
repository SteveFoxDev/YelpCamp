
mapboxgl.accessToken = mapBoxToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: campCoordinates, // starting position [lng, lat]
    zoom: 13, // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(campCoordinates)
    .addTo(map);
