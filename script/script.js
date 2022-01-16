const accessToken = mapboxgl.accessToken = 'pk.eyJ1IjoiZHVkdWxlIiwiYSI6ImNreHN0ZGlqbjB3NmYyb21wN3kzOHViazAifQ.s-MtWZnDCNO0TqSfLOF9MA';

const map = new mapboxgl.Map({
    container: 'map', // container ID
    // style: 'mapbox://styles/dudule/ckya9kzue72on14nuevmjh1uo', // style URL
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [20.45, 44.81], // starting position [lng, lat]
    zoom: 12 // starting zoom
});

const geocoder = new MapboxGeocoder({
    accessToken: accessToken,
    countries: 'rs',
    mapboxgl: mapboxgl
});

const initMapboxInput = document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
const idToMapboxSearchInput = document.getElementsByClassName('mapboxgl-ctrl-geocoder--input')[0].setAttribute('id', 'mySearch');

const userlocation = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
})

let usercoordinates;
userlocation.on('geolocate', function(e) {
    var lng = e.coords.longitude;
    var lat = e.coords.latitude
    var position = [lng, lat];
    usercoordinates = position;
});

const initMapboxUserLocation = document.getElementById('userLocation').appendChild(userlocation.onAdd(map));

const stores = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [20.469, 44.800]
            },
            'properties': {
                'title': 'Vracar 1',
                'address': 'Nikolaja Krasnova 9, Beograd'
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [20.409, 44.825]
            },
            'properties': {
                'title': 'Fontanta',
                'address': 'Narodnih heroja 7, Beograd'
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [20.405, 44.805]
            },
            'properties': {
                'title': 'Kauwela Delta',
                'address': 'Jurija Gagarina 16, Beograd'
            }
        },
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [20.460, 44.817]
            },
            'properties': {
                'title': 'Centar',
                'address': 'Trg republike, Beograd'
            }
        }
    ]
};

stores.features.forEach((store, i) => {
    store.properties.id = i;
});

map.on('load', () => {
    map.addSource('places', {
        'type': 'geojson',
        'data': stores
    });
    addMarkers();
});

function addMarkers() {
    const list = document.getElementById('list-group-item');
    for (const marker of stores.features) {
        const el = document.createElement('div');
        el.id = `marker-${marker.properties.id}`;
        el.className = 'marker';

        //create and add marker to map
        new mapboxgl.Marker(el, { offset: [0, -23] })
            .setLngLat(marker.geometry.coordinates)
            .addTo(map);
            
        el.addEventListener('click', (e) => {
            /* Fly to the point */
            flyToStore(marker);
            /* Close all other popups and display popup for clicked store */
            // createPopUp(marker);
            /* Highlight listing in sidebar */
            const activeItem = document.getElementsByClassName('active');
            e.stopPropagation();
            if (activeItem[0]) {
                activeItem[0].classList.remove('active');
            }
            const listing = document.getElementById(
                `listing-${marker.properties.id}`
            );
            listing.classList.add('active');
        });
    }
}


function buildLocationList(stores) {
    for (const store of stores.features) {
        const listings = document.getElementById('listings');
        const list = document.getElementById('list');
        
        const listLi = list.appendChild(document.createElement('li'));
        listLi.className = 'list-group-item';
        const listing = listLi.appendChild(document.createElement('a'));

        listing.id = `listing-${store.properties.id}`;    
        listing.className = 'item';
        listing.href= "#";

        //create title
        const title = listing.appendChild(document.createElement('h3'));
        title.className = 'title';
        title.id = `link-${store.properties.id}`;
        title.innerHTML = `${store.properties.title}`;


        //to,from and distance calc
        const to = store.geometry.coordinates;
        let from = [20.45, 44.81];
        const options = {
            units: 'kilometers'
        };
        let distance = turf.distance(to, from, options);
        //end
        
        //create html
        let p1 = document.createElement("p")
        let h3 = listing.firstChild;
        listing.insertBefore(p1, h3.nextSibling)
        p1.innerHTML = distance.toFixed([2]) + " km";
        //end
        
        //user shares location
        userlocation.on('geolocate', function(e) {
            from = usercoordinates;
            distance = turf.distance(to, from, options);
            
            let something = (function() {
                var executed = false;
                return function() {
                    if (!executed) {
                        executed = true;
                        p1.innerHTML = distance.toFixed([2]) + " km";
                    }
                };
            })();
            
            something();
        });
        //end
        
        const address = listing.appendChild(document.createElement('p'));
        address.innerHTML = `${store.properties.address}`;

        
        listing.addEventListener("touchend", function() {
            setTimeout(() => {
                function isScrolledIntoView(elem) {
                    var docViewTop = $(window).scrollTop();
                    var docViewBottom = docViewTop + $(window).width();

                    var elemTop = $(elem).offset().left;
                    var elemBottom = elemTop + $(elem).width();

                    if (((elemBottom <= docViewBottom) && (elemTop >= docViewTop))) {
                        return elem[0].id;
                    }
                }
                
                const listingarr = [...document.getElementsByClassName('item')]
                for (const i of listingarr) {
                    for (const feature of stores.features) {
                        if (isScrolledIntoView([i]) === `listing-${feature.properties.id}`) {
                            getActiveItem(`marker-${feature.properties.id}`);
                            flyToStore(feature);
                        }
                    }
                }
            }, 200);
        });

        listing.addEventListener("mouseover", function() {
            for (const feature of stores.features) {
                if (this.id === `listing-${feature.properties.id}`) {
                    flyToStore(feature);
                }
            }
            getActiveItem(`marker-${store.properties.id}`);
        });
    }
}
buildLocationList(stores);


//smooth flyover to marker
function flyToStore(currentFeature) {
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 12,
        speed: 0.7
    });
}

//marker popup
// function createPopUp(currentFeature) {
//     const popUps = document.getElementsByClassName('mapboxgl-popup');

//     if (popUps[0]) popUps[0].remove();
    
//     const popup = new mapboxgl.Popup({ closeOnClick: false })
    
//     .setLngLat(currentFeature.geometry.coordinates)
//     .setHTML(
//         `<h3>${currentFeature.properties.title}</h3><h4>${currentFeature.properties.address}</h4>`
//     )
//     .addTo(map);
// }

var slider = document.getElementById('listings'),
    sliderItems = document.getElementById('list');
    
const slide = (wrapper, items) => {
    var posX1 = 0,
        posX2 = 0,
        posInitial,
        posFinal,
        threshold = 5,
        slides = items.getElementsByClassName('list-group-item'),
        slidesLength = slides.length,
        slideSize = items.getElementsByClassName('list-group-item')[0].offsetWidth,
        firstSlide = slides[0],
        lastSlide = slides[slidesLength - 1],
        cloneFirst = firstSlide.cloneNode(true),
        cloneLast = lastSlide.cloneNode(true),
        index = 0,
        allowShift = true;
    
    items.appendChild(cloneFirst);
    items.insertBefore(cloneLast, firstSlide);
    wrapper.classList.add('loaded');
    
    const slide = [...document.getElementsByClassName('item')]
    const oneSlideWidth = slide[0].offsetWidth;
    const slidelength = slide.length;
    const sliderItemsWidth = oneSlideWidth * slidelength;
    sliderItems.style.width = sliderItemsWidth + 'px';
    sliderItems.style.left = '-' + (slide[0].offsetWidth - 12) + 'px';
    
    
    items.onmousedown = dragStart;
    items.addEventListener('touchstart', dragStart);
    items.addEventListener('touchend', dragEnd);
    items.addEventListener('touchmove', dragAction);
    items.addEventListener('transitionend', checkIndex);
    
    function dragStart (e) {
        e = e || window.event;
        e.preventDefault();
        posInitial = items.offsetLeft;
        
        if (e.type == 'touchstart') {
            posX1 = e.touches[0].clientX;
        } else {
            posX1 = e.clientX;
            document.onmouseup = dragEnd;
            document.onmousemove = dragAction;
        }
    }
    
    function dragAction (e) {
        e = e || window.event;
        
        if (e.type == 'touchmove') {
            posX2 = posX1 - e.touches[0].clientX;
            posX1 = e.touches[0].clientX;
        } else {
            posX2 = posX1 - e.clientX;
            posX1 = e.clientX;
        }
        items.style.left = (items.offsetLeft - posX2) + "px";
    }
        
    function dragEnd (e) {
        posFinal = items.offsetLeft;
        if (posFinal - posInitial < -threshold) {
            shiftSlide(1, 'drag');
        } else if (posFinal - posInitial > threshold) {
            shiftSlide(-1, 'drag');
        } else {
            items.style.left = (posInitial) + "px";
        }

        document.onmouseup = null;
        document.onmousemove = null;
    }

    function shiftSlide(dir, action) {
        items.classList.add('shifting');
        
        if (allowShift) {
            if (!action) { posInitial = items.offsetLeft; }

            if (dir == 1) {
                items.style.left = (posInitial - slideSize) + "px";
                index++;
            } else if (dir == -1) {
                items.style.left = (posInitial + slideSize) + "px";
                index--;
            }
        };
        
        allowShift = false;
    }
    
    function checkIndex (){
        items.classList.remove('shifting');

        if (index == -1) {
            items.style.left = -(slidesLength * slideSize - 36) + "px";
            index = slidesLength - 1;
        }

        if (index == slidesLength) {
            items.style.left = -(1 * slideSize - 36) + "px";
            index = 0;
        }
        
        allowShift = true;
    }
}

function mobileMediaQuery() {
    if (window.matchMedia("(max-width: 768px)").matches) { // If media query matches
        slide(slider, sliderItems);
    }
}

mobileMediaQuery()


function getActiveItem(item) {
    const activeItem = document.getElementsByClassName('active');
    // stopPropagation();
    if (activeItem[0]) {
        activeItem[0].classList.remove('active');
    }
    document.getElementById(item).classList.add('active');
}