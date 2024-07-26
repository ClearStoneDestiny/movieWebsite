const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";
const GENRESAPI = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&with_genres=";
const PAGEAPI = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=";
const APIKEY = "2584e2785b3d1e998120475cf4713590";
const API = "https://api.themoviedb.org/3/movie/";
const APISORT = "https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1";
// const topRatedMovies = "https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&sort_by=vote_average.desc";
// const latestMovies = "https://api.themoviedb.org/3/discover/movie?api_key=04c35731a5ee918f014970082a0088b1&sort_by=release_date.desc";


// 2584e2785b3d1e998120475cf4713590

const mainDiv = document.querySelector('.movie');
const mainPageDiv = document.querySelector('.movie-page');
const years = document.querySelector('.years');
const form = document.querySelector('#form');
const search = document.querySelector('.search');
const logo = document.querySelector('.logo');
const page = document.querySelector('#page');
const searchIcon = document.querySelector('.searchIcon');


let currentIndex = 0;
const visibleActors = 5;

let currentPage = 1;
let totalPages = 0;
let currentSearchTerm = '';
let currentGenreId = '';
let activeTile = null;


document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector('.menu');
    const menuElements = document.querySelector('.menu-elements');
    const overlay = document.querySelector('.overlay');

    menuIcon.addEventListener('click', () => {
        const iconSrc = menuIcon.src.split('/').pop();

        if(iconSrc === 'close-menu.svg'){
            menuIcon.src = './icons/burger-menu.svg';
            menuElements.classList.remove('animate__bounceInRight');
            menuElements.classList.add('animate__fadeOutRight');

            setTimeout(() =>{
                menuElements.classList.remove('active');
                menuElements.classList.remove('animate__fadeOutRight');
            }, 1000); 
        } 
        else{
            menuIcon.setAttribute('src', './icons/close-menu.svg');
            menuElements.classList.add('active');
            menuElements.classList.remove('animate__fadeOutRight');
            menuElements.classList.add('animate__bounceInRight');
        }

        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        menuIcon.src = './icons/burger-menu.svg';
        menuElements.classList.remove('animate__bounceInRight');
        menuElements.classList.add('animate__fadeOutRight');

        setTimeout(() => {
            menuElements.classList.remove('active');
            menuElements.classList.remove('animate__fadeOutRight');
        }, 1000);

        overlay.classList.remove('active');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    setupGenres();
    setupFilters();
});


searchIcon.addEventListener('click', (e) => {
    e.preventDefault();

    const search = document.querySelector('.menu-search');
    
    currentSearchTerm = search.value;
    console.log(currentSearchTerm);
    currentGenreId = '';
    if(currentSearchTerm){
        resetPagination();
        getMovies(SEARCHAPI + currentSearchTerm + "&page=1");
        search.value = '';
    }
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    currentSearchTerm = search.value;
    currentGenreId = '';
    if(currentSearchTerm){
        resetPagination();
        getMovies(SEARCHAPI + currentSearchTerm + "&page=1");
        search.value = '';
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const searchTerm = search.value;
    if(searchTerm){
        getMovies(SEARCHAPI + searchTerm);
        search.value = '';
    }
});

logo.addEventListener('click', function(){
    localStorage.removeItem('selectedGenreId');
    localStorage.removeItem('selectedPageId');
    mainPageDiv.innerHTML = '';
});

function setupPagination(apiUrl){
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            totalPages = data.total_pages;
            $('#pagination-container').pagination({
                dataSource: Array(totalPages).fill().map((_, i) => i + 1),
                pageSize: 1,
                callback: function(data, pagination){
                    if (currentSearchTerm) {
                        getMovies(SEARCHAPI + currentSearchTerm + "&page=" + pagination.pageNumber);
                    } else if (currentGenreId) {
                        getMoviesByPageAndGenre(currentGenreId, pagination.pageNumber);
                    } else {
                        getMovies(PAGEAPI + pagination.pageNumber);
                    }
                }
            });
        })
        .catch(error => console.error('Error fetching movies:', error));
}

function setupGenres(){
    const genres = document.querySelectorAll('.genre');
    const selectedGenreId = localStorage.getItem('selectedGenreId') || "";

    genres.forEach(genre =>{
        if (genre.dataset.genreId === selectedGenreId) {
            genre.classList.add('selected');
            currentGenreId = selectedGenreId;
        }
    });

    genres.forEach(genre =>{
        genre.addEventListener('click', function() {
            genres.forEach(g => g.classList.remove('selected'));
            this.classList.add('selected');
            localStorage.setItem('selectedGenreId', this.dataset.genreId);
            currentGenreId = this.dataset.genreId;
            currentSearchTerm = '';

            resetPagination();
            getMoviesByPageAndGenre(this.dataset.genreId, 1);
        });
    });

    if (selectedGenreId){
        getMoviesByPageAndGenre(selectedGenreId, 1);
    } else {
        setupPagination(APIURL);
    }
}

function setupFilters(){
    let navigation;
    if(window.innerWidth < 1024){
        navigation = document.querySelector('.filters');
    }
    else{
        navigation = document.querySelector('.filters1');
    }

    const filtersContainer = document.createElement('div');
    filtersContainer.classList.add('filters-container');

    const filtersTitle = document.createElement('h2');
    filtersTitle.innerText = 'Filters';
    filtersContainer.appendChild(filtersTitle);

    const releaseDateFilter = document.createElement('div');
    releaseDateFilter.classList.add('filter');
    
    const releaseDateTitle = document.createElement('h3');
    releaseDateTitle.innerText = 'Release Date';
    releaseDateFilter.appendChild(releaseDateTitle);

    const releaseDateSelect = document.createElement('select');
    releaseDateSelect.classList.add('filter-input');
    const currentYear = new Date().getFullYear();

    const allYearsOption = document.createElement('option');
    allYearsOption.value = 'all';
    allYearsOption.innerText = 'All Years';
    releaseDateSelect.appendChild(allYearsOption);

    for (let year = currentYear; year >= 2000; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.innerText = year;
        releaseDateSelect.appendChild(option);
    }

    releaseDateFilter.appendChild(releaseDateSelect);
    filtersContainer.appendChild(releaseDateFilter);

    const actorContainer = document.createElement('div');
    actorContainer.classList.add('actor-container');

    const actorName = document.createElement('h3');
    actorName.innerText = 'Actor name';
    actorContainer.appendChild(actorName);

    const actorNameForm = document.createElement('form'); 
    const actorNameInput = document.createElement('input');
    actorNameInput.classList.add('actor-input');
    actorNameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        applyFilters();
        resetPagination();
    });
    
    actorNameForm.appendChild(actorNameInput);
    actorContainer.appendChild(actorNameForm);
    filtersContainer.appendChild(actorContainer);

    const ratingFilter = document.createElement('div');
    ratingFilter.classList.add('filter');
    
    const ratingTitle = document.createElement('h3');
    ratingTitle.innerText = 'Sort By Rating';
    ratingFilter.appendChild(ratingTitle);

    const highRatingCheckbox = document.createElement('input');
    highRatingCheckbox.type = 'checkbox';
    highRatingCheckbox.id = 'high-rating-checkbox';
    highRatingCheckbox.classList.add('filter-checkbox');

    const highRatingLabel = document.createElement('label');
    highRatingLabel.htmlFor = 'high-rating-checkbox';
    highRatingLabel.innerText = 'High';

    const mediumRatingCheckbox = document.createElement('input');
    mediumRatingCheckbox.type = 'checkbox';
    mediumRatingCheckbox.id = 'medium-rating-checkbox';
    mediumRatingCheckbox.classList.add('filter-checkbox');

    const mediumRatingLabel = document.createElement('label');
    mediumRatingLabel.htmlFor = 'medium-rating-checkbox';
    mediumRatingLabel.innerText = 'Medium';

    ratingFilter.appendChild(highRatingCheckbox);
    ratingFilter.appendChild(highRatingLabel);
    ratingFilter.appendChild(mediumRatingCheckbox);
    ratingFilter.appendChild(mediumRatingLabel);

    filtersContainer.appendChild(ratingFilter);

    navigation.appendChild(filtersContainer);

    releaseDateSelect.addEventListener('change', applyFilters);
    actorNameInput.addEventListener('change', applyFilters);
    highRatingCheckbox.addEventListener('change', applyFilters);
    mediumRatingCheckbox.addEventListener('change', applyFilters);       

}


async function applyFilters(){
    const selectedYear = document.querySelector('.filter-input').value;
    const sortByHighRating = document.getElementById('high-rating-checkbox').checked;
    const sortByMediumRating = document.getElementById('medium-rating-checkbox').checked;
    const actorName = document.querySelector('.actor-input').value;
    console.log(actorName);

    let apiUrl = APISORT;

    if(selectedYear && selectedYear !== 'all'){
        apiUrl += `&primary_release_year=${selectedYear}`;
    }

    if(actorName){
        try{
            const actorId = await getActorId(actorName);
            apiUrl += `&with_cast=${actorId}`;
            console.log(apiUrl);
        } catch (error){
            console.error('Actor not found:', error);
            return;
        }
    }

    if(sortByHighRating){
        apiUrl += '&vote_average.gte=8';
    } 
    else if(sortByMediumRating){
        apiUrl += '&vote_average.gte=5&vote_average.lte=7';
    }

    getMovies(apiUrl);
}

async function getActorId(actorName){
    const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=04c35731a5ee918f014970082a0088b1&query=${actorName}`);
    const data = await response.json();
    
    // console.log('Search actor response data:', data); 
    if(data.results.length > 0) {
        const actorId = data.results[0].id;
        // console.log(`Found actor ID for ${actorName}: ${actorId}`); 
        return actorId;
    } 
    else{
        throw new Error('Actor not found');
    }
}

function resetPagination(){
    currentPage = 1;
    const apiUrl = currentSearchTerm ? SEARCHAPI + currentSearchTerm + "&page=1" : (currentGenreId ? GENRESAPI + currentGenreId + "&page=1" : APIURL);
    setupPagination(apiUrl);
}


function getMoviesByPageAndGenre(genreId, pageId){
    let apiUrl;
    if (genreId) {
        apiUrl = GENRESAPI + genreId + "&page=" + pageId;
    } else {
        apiUrl = PAGEAPI + pageId;
    }

    getMovies(apiUrl);
}

function getMovies(apiUrl){
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            mainPageDiv.innerHTML = '';
            mainDiv.innerHTML = '';
            mainDiv.classList.add('movie');
            document.querySelector('.paginationjs').style.display = 'block';
            data.results.forEach(movie => {
                // console.log(movie);
                createMovieTile(movie);
            });
        })
        .catch(error => console.error('Error fetching movies:', error));
}

getMovies(APIURL);


function createMovieTile(movie){
    const movieId = movie.id;

    const img = document.createElement('img');
    img.src = IMGPATH + movie.poster_path;
    img.alt = movie.title;

    const title = document.createElement('h3');
    title.innerText = movie.title;
    cutTitle(title);

    const voteAverage = document.createElement('span');
    voteAverage.classList.add('rating');
    voteAverage.innerText = movie.vote_average ? movie.vote_average : '';

    if (movie.vote_average) {
        correctRating(voteAverage);
    }

    const releaseDate = document.createElement('small');
    releaseDate.innerText = movie.release_date;
    releaseDate.innerText = movie.release_date ? movie.release_date : '';

    if (movie.release_date) {
        changeDate(releaseDate);
    }

    const overView = document.createElement('p');
    overView.classList.add('overView');
    overView.innerText = cutOverView(movie.overview);


    const movieTileDiv = document.createElement('div');
    const movieAboutDiv = document.createElement('div');
    const movieFrontDiv = document.createElement('div');
    const movieBackDiv = document.createElement('div');

    movieAboutDiv.classList.add('movie-info');
    movieTileDiv.classList.add('movie-tile');
    movieFrontDiv.classList.add('movie-front');
    movieBackDiv.classList.add('movie-back');

    const buttonMovie = document.createElement('button');
    
    buttonMovie.textContent = 'Watch Movie';
    buttonMovie.classList.add('buttonMovie');

    buttonMovie.addEventListener('click', () => {
        createMoviePage(movieId)
    });


    movieTileDiv.append(movieFrontDiv);
    movieTileDiv.append(movieBackDiv);

    movieTileDiv.addEventListener('click', () => {
        toggleInfo(event);
    })

    movieFrontDiv.append(img);
    movieFrontDiv.append(movieAboutDiv);

    movieAboutDiv.append(title);
    movieAboutDiv.append(voteAverage);
    movieAboutDiv.append(releaseDate);
    
    movieBackDiv.append(overView);
    movieBackDiv.append(buttonMovie);

    mainDiv.append(movieTileDiv);

    return mainDiv;
}

function toggleInfo(event){
    if(window.innerWidth <= 1024){
        if(window.innerWidth <= 1024){
            const clickedTile = event.currentTarget;
            const movieBackDiv = clickedTile.querySelector('.movie-back');

            if(activeTile && activeTile !== clickedTile){
                const activeBack = activeTile.querySelector('.movie-back');
                activeBack.style.transform = 'translateY(100%)';
            }

            if(movieBackDiv.style.transform === 'translateY(0%)'){
                movieBackDiv.style.transform = 'translateY(100%)';
                activeTile = null;
            }
            else{
                movieBackDiv.style.transform = 'translateY(0%)';
                activeTile = clickedTile;
            }
        }
    }
}


function correctRating(rating){
    let ratingElement = rating;
    let ratingValue = parseFloat(ratingElement.textContent);
    ratingElement.textContent = ratingValue.toFixed(2);

    if(ratingValue >= 7){
        ratingElement.classList.add('good-rating');
    }
    else if(ratingValue >= 4){
        ratingElement.classList.add('average-rating');
    }
    else{
        ratingElement.classList.add('bad-rating');
    }

    return ratingElement;
}

function changeDate(releaseDate){
    let dateElement = releaseDate;
    let dataValue = dateElement.textContent;
    let dateParts = dataValue.split("-");
    let formattedDate = dateParts[2] + "." + dateParts[1] + "." + dateParts[0];
    // let formattedDate = dateParts[2] + "/" + dateParts[1] + "/" + dateParts[0];

    dateElement.textContent = formattedDate;

    return dateElement;
}

function cutTitle(text){
    let titleText = text.innerText;
    if(titleText.length > 50){
        text.style.fontSize = '14px'
    }
    else if(titleText.length > 25){
        text.style.fontSize = '16px'
    }

}

function cutOverView(text){
    let maxLength = window.innerWidth <= 800 ? 150 : 250;
    let movieText = text;
    if (movieText.length > maxLength) {
        movieText = text.substring(0, maxLength) + '...';
    }

    return movieText;
}


async function createMoviePage(movieId){
    mainDiv.innerHTML = '';
    mainDiv.classList.remove('movie');
    document.querySelector('.paginationjs').style.display = 'none';

    const generalMovieInfo = API + movieId + '?api_key=' + APIKEY + '&language=en-US';
    const actorsInfo = API + movieId + '/credits?api_key=' + APIKEY + '&language=en-US';
    const movieVideo = API + movieId +'/videos?api_key=' + APIKEY +'&language=en-US';
    console.log(actorsInfo);

    try{
        const actorDiv = await getMovieCredits(actorsInfo);
        const movieDiv = await getMovieVideos(movieVideo);

        const response = await fetch(generalMovieInfo);
        const movieData = await response.json();

        const captionDiv = document.createElement('div');
        captionDiv.classList.add('caption-div');
        captionDiv.classList.add('animate__animated', 'animate__bounceInDown');

        const mainText = document.createElement('div');
        mainText.classList.add('main-text');

        const img = document.createElement('img');
        img.classList.add('poster');
        img.src = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;
        img.alt = movieData.title;

        const titleContainer = document.createElement('div');
        titleContainer.classList.add('title-container');

        const titleText = document.createElement('div');
        titleText.classList.add('title-container-text');

        const title = document.createElement('h3');
        title.innerText = movieData.title;

        const slogan = document.createElement('p');
        slogan.classList.add('slogan');
        slogan.innerText = movieData.tagline;

        const rateContainer = document.createElement('div');
        rateContainer.classList.add('rate-container');

        const voteAverage = document.createElement('span');
        voteAverage.classList.add('rating');
        voteAverage.innerText = movieData.vote_average ? movieData.vote_average : '';

        if(movieData.vote_average){
            correctRating(voteAverage);
        }

        const status = document.createElement('p');
        status.innerText = movieData.status;

        titleText.append(title);
        titleText.append(slogan);
        rateContainer.append(voteAverage);
        rateContainer.append(status);
        titleContainer.append(titleText);
        titleContainer.append(rateContainer);

        captionDiv.append(img);
        mainText.append(titleContainer);

        const textContainer = document.createElement('div');
        textContainer.classList.add('text-container');

        const budget = document.createElement('p');
        budget.innerHTML = `<span class="text-container-info">Budget:</span> ${movieData.budget.toLocaleString()}$`;

        const revenue = document.createElement('p');
        revenue.innerHTML = `<span class="text-container-info">Revenue:</span> ${movieData.revenue.toLocaleString()}$`;

        const releaseSpan = document.createElement('span');
        releaseSpan.classList.add('text-container-info');
        releaseSpan.innerHTML = 'Release Date: '

        const release = new Date(movieData.release_date).toLocaleDateString();
        const releaseDate = document.createElement('p');
        releaseDate.innerHTML = release;

        releaseDate.append(releaseSpan);

        const runtime = document.createElement('p');
        runtime.innerHTML = `<span class="text-container-info">Runtime:</span> ${movieData.runtime} mins`;

        const language = document.createElement('p');
        language.innerHTML = `<span class="text-container-info">Spoken languages:</span> ${movieData.spoken_languages.map(lang => lang.name).join(', ')}`;

        textContainer.append(budget);
        textContainer.append(revenue);
        textContainer.append(releaseDate);
        textContainer.append(runtime);
        textContainer.append(language)

        mainText.append(textContainer);
        captionDiv.append(mainText);

        const overView = document.createElement('p');
        overView.classList.add('overview-main-page');
        overView.classList.add('animate__animated', 'animate__bounceInRight');
        overView.innerText = movieData.overview;

        const companySection = document.createElement('div');
        companySection.classList.add('company-section');

        const companyLogo = document.createElement('img');
        companyLogo.src = `https://image.tmdb.org/t/p/w500${movieData.production_companies[0].logo_path}`;
        companyLogo.alt = 'Logo';

        const companyName = document.createElement('p');
        companyName.classList.add('company-name');
        companyName.innerText = movieData.production_companies[0].name;

        const country = document.createElement('p');
        country.innerText = movieData.production_countries.map(country => country.name).join(', ');

        companySection.append(companyLogo);
        companySection.append(companyName);
        companySection.append(country);

        const horLine = document.createElement('hr');
        horLine.classList.add('horizontal-line');

        mainPageDiv.append(captionDiv);

        if(window.innerWidth < 800){
            mainPageDiv.append(actorDiv);
        } 
        else{
            mainText.append(actorDiv);
        }

        mainPageDiv.append(horLine);
        mainPageDiv.append(overView);

        if(movieDiv){
            mainPageDiv.append(movieDiv);
        }

        mainPageDiv.append(companySection);
        

    } catch (error){
        console.error('Error fetching movie data:', error);
    }
}

async function getMovieCredits(actorsAPI){
    try{
        const response = await fetch(actorsAPI);
        const actorsData = await response.json();

        const actorDiv = document.createElement('div');
        actorDiv.classList.add('actor-section');

        const heading = document.createElement('h3');
        heading.innerHTML = 'Actors';
        actorDiv.append(heading);

        const glideWrapper = document.createElement('div');
        glideWrapper.classList.add('glide__wrapper');

        const glideDiv = document.createElement('div');
        glideDiv.classList.add('glide');

        const glideTrackDiv = document.createElement('div');
        glideTrackDiv.classList.add('glide__track');
        glideTrackDiv.setAttribute('data-glide-el', 'track');

        const glideList = document.createElement('ul');
        glideList.classList.add('glide__slides');

        for(let i = 0; i < 10; i++){
            const glideSlide = document.createElement('li');
            glideSlide.classList.add('glide__slide');

            const actorProfileDiv = document.createElement('div');
            actorProfileDiv.classList.add('actor-profile');

            const actorImg = document.createElement('img');
            actorImg.src = `https://image.tmdb.org/t/p/w500${actorsData.cast[i].profile_path}`;
            actorImg.alt = actorsData.cast[i].name;
            actorImg.classList.add('actor-img');

            const characterName = document.createElement('h4');
            characterName.classList.add('character-name');
            characterName.innerText = actorsData.cast[i].character;

            const actorName = document.createElement('h5');
            actorName.classList.add('actor-name');
            actorName.innerText = actorsData.cast[i].name;

            actorProfileDiv.append(actorImg);
            actorProfileDiv.append(characterName);
            actorProfileDiv.append(actorName);
            glideSlide.append(actorProfileDiv);
            glideList.append(glideSlide);
        }

        glideTrackDiv.append(glideList);
        glideDiv.append(glideTrackDiv);

        const glideArrows = document.createElement('div');
        glideArrows.className = 'glide__arrows';
        glideArrows.setAttribute('data-glide-el', 'controls');

        const buttonPrev = document.createElement('button');
        buttonPrev.className = 'glide__arrow glide__arrow--left';
        buttonPrev.setAttribute('data-glide-dir', '<');
        buttonPrev.textContent = '<';

        const buttonNext = document.createElement('button');
        buttonNext.className = 'glide__arrow glide__arrow--right';
        buttonNext.setAttribute('data-glide-dir', '>');
        buttonNext.textContent = '>';

        glideArrows.appendChild(buttonPrev);
        glideArrows.appendChild(buttonNext);
        glideDiv.append(glideArrows);
        glideWrapper.append(glideDiv);

        actorDiv.append(glideWrapper);
        document.body.append(actorDiv);

        // Initialize Glide.js
        new Glide('.glide', {
            type: 'carousel',
            startAt: 0,
            perView: 6,
            gap: 20,
            autoplay: 3000,
            hoverpause: true,
            animationDuration: 800,
            animationTimingFunc: 'ease-in-out',
            focusAt: 'center',
            perTouch: 1,
            breakpoints: {
                800: {
                    perView: 3
                },
                480: {
                    perView: 2
                }
            },
        }).mount();

        return actorDiv;

    } catch (error){
        console.error('Error fetching actor data:', error);
    }
}

async function getMovieVideos(movieAPI){
    const response = await fetch(movieAPI);
    const movieData = await response.json();
    let movieLink;

    movieData.results.filter(movie => {
        if(movie.name === 'Official Trailer' && movie.site === 'YouTube'){
            movieLink = showMovieVideos(movie.key)
        }
    });

    // console.log(movieLink);
    return movieLink;

}

async function showMovieVideos(movieId){
    const movieDiv = document.createElement('div');
    movieDiv.classList.add('movie-container');

    const iframeContainer = document.createElement('div');
    iframeContainer.classList.add('iframe-container');

    const iframe = document.createElement('iframe');
    iframe.classList.add('iframe');
    // iframe.width = '560';
    // iframe.height = '315';
    iframe.src = `https://www.youtube.com/embed/${movieId}`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    iframeContainer.append(iframe);
    movieDiv.append(iframeContainer);

    return movieDiv;

}