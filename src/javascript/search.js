import {PictureModel} from "./PictureModel.js";
import {updateNumberNextToCart} from "./cart.js";

updateNumberNextToCart();
const urlParams = new URLSearchParams(window.location.search);
let searchQuery = urlParams.get('q');
console.log(urlParams.get('q'))
if (searchQuery  === null){
    searchQuery = '';
}
const searchInfo = document.getElementById('search-info');
let searchInfoResults = '';


function onStart(){

    searchInfo.textContent = 'Searching for “' + searchQuery + '”...';
    const seachBox = (localStorage.getItem('lastSearch'));
        let lastQuery = null;
    try {
        lastQuery = seachBox ? JSON.parse(seachBox) : '';
    }catch (e) {
        console.log('fehler bei searchBox')
    }
    console.log(lastQuery)
    if (lastQuery === null || lastQuery.lastSearchQuery !== searchQuery){
        getHighlightImages();
    }else{
        const cacheData = localStorage.getItem('searchCache');
        searchInfoResults = searchQuery !== '' ? lastQuery.foundArtworks : 'Search our collection of more than 400,000 artworks.';
        // console.log(JSON.parse(cacheData))
        try {
            renderGall( cacheData ? JSON.parse(cacheData) : [])
        } catch (e) {
            console.log('Fehler beim LocalStoragecache')
            renderGall([])

        }
    }

}
async function getHighlightImages() {

    let responseArray ;

    if (searchQuery === '') {
        localStorage.setItem('lastSearch', JSON.stringify({lastSearchQuery: '', foundArtworks: 0}));

        searchInfoResults = 'Search our collection of more than 400,000 artworks.';

        let highlightList = await fetch('./highlights.json')

        let highlightListArray = await highlightList.json();

        console.log(highlightListArray.highlights);
        return await renderBild(highlightListArray.highlights);
    } else {

        let jsonFile = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=' + searchQuery)
            .then(resp => {
                if (!resp.ok) {
                    throw Error('no artowrks')
                }else {
                    return resp.json()
                }
            }).then( response => {
                responseArray = response.objectIDs;
                if (responseArray.length === 1){
                    searchInfoResults = 'Found '+ responseArray.length +' artwork for “' + searchQuery + '”';
                }else {
                    searchInfoResults = 'Found '+ responseArray.length +' artworks for “' + searchQuery + '”';

                }
                localStorage.setItem('lastSearch', JSON.stringify({lastSearchQuery: searchQuery, foundArtworks: searchInfoResults}));

                if (responseArray.length >= 100) {
                    return  renderBild(responseArray.splice(0, 100));
                } else {
                    return  renderBild(responseArray);
                }
            })
            .catch(error => {
                console.log(error)
                searchInfoResults = 'Found 0 artworks for “' + searchQuery + '”';
                searchInfo.textContent = searchInfoResults;
                localStorage.setItem('searchCache', '');
                localStorage.setItem('lastSearch', JSON.stringify({lastSearchQuery: searchQuery, foundArtworks: searchInfoResults}));

                return;
            })



    }

}

async function renderBild(arrayus) {

    const container = document.querySelector('#gallery');
    container.innerHTML = '';

    let pictureCollection = undefined;
    try {
        const response = await Promise.all(arrayus.map((entry, i) =>

            fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects/' + entry).then(resp => resp.json())
        )).then(json => {
            console.log('json response')
            console.log(json)
            pictureCollection = json.map(
                bilder => new PictureModel(bilder.objectID, bilder.primaryImageSmall, bilder.title, bilder.artistDisplayName, bilder.objectDate)
            );
        })
    } catch (e) {
        console.log(e)

    }
    console.log(pictureCollection)
    localStorage.setItem('searchCache', JSON.stringify(pictureCollection));
    renderGall(pictureCollection)

}

async function renderGall(pictureArray) {
    searchInfo.textContent = searchInfoResults;
    pictureArray.forEach((pictureEntry) => {
        const container = document.querySelector('#gallery');
        const pictureElement = generatePicureElement(pictureEntry);
        container.appendChild(pictureElement);
    })

}

function generatePicureElement(pictureData) {
    const pictureEntry = document.createElement('div');
    pictureEntry.classList.add('thumb');
    pictureEntry.innerHTML =
        `
        <a href="framing.html?objectID=${pictureData.objectID}">
          <img src="${pictureData.primaryImage}" alt="">
          <div class="museum-label">
            <span class="artist">${pictureData.artistDisplayName}</span>
            <span class="title">${pictureData.title}</span>,
            <span class="date">${pictureData.objectDate}</span>
          </div>
        </a>
      `
    return pictureEntry;
}

onStart()

