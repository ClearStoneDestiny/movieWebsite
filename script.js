const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=04c35731a5ee918f014970082a0088b1&query=";
const GENRESAPI = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&with_genres=";
const PAGEAPI = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=";


// 2584e2785b3d1e998120475cf4713590

const mainDiv = document.querySelector('.movie');
const form = document.querySelector('#form');
const search = document.querySelector('.search');
const logo = document.querySelector('.logo');
const leftArrow = document.querySelector('.left');
const rightArrow = document.querySelector('.right');
let currentPage = 1;
let totalPages = 0;
let currentSearchTerm = '';
let currentGenreId = '';


document.addEventListener('DOMContentLoaded', () => {
    setupGenres();
});

form.addEventListener('submit', function(e) {
    e.preventDefault();
    currentSearchTerm = search.value;
    currentGenreId = '';
    if (currentSearchTerm) {
        resetPagination();
        getMovies(SEARCHAPI + currentSearchTerm + "&page=1");
        search.value = '';
    }
});

function setupPagination(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            totalPages = data.total_pages;
            $('#pagination-container').pagination({
                dataSource: Array(totalPages).fill().map((_, i) => i + 1),
                pageSize: 1,
                callback: function(data, pagination) {
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

function setupGenres() {
    const genres = document.querySelectorAll('.genre');
    const selectedGenreId = localStorage.getItem('selectedGenreId') || "";

    genres.forEach(genre => {
        if (genre.dataset.genreId === selectedGenreId) {
            genre.classList.add('selected');
            currentGenreId = selectedGenreId;
        }
    });

    genres.forEach(genre => {
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

    if (selectedGenreId) {
        getMoviesByPageAndGenre(selectedGenreId, 1);
    } else {
        setupPagination(APIURL);
    }
}

function resetPagination() {
    currentPage = 1;
    const apiUrl = currentSearchTerm ? SEARCHAPI + currentSearchTerm + "&page=1" : (currentGenreId ? GENRESAPI + currentGenreId + "&page=1" : APIURL);
    setupPagination(apiUrl);
}


function getMoviesByPageAndGenre(genreId, pageId) {
    let apiUrl;
    if (genreId) {
        apiUrl = GENRESAPI + genreId + "&page=" + pageId;
    } else {
        apiUrl = PAGEAPI + pageId;
    }

    getMovies(apiUrl);
}


function getMovies(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            mainDiv.innerHTML = '';
            data.results.forEach(movie => {
                // console.log(movie);
                createMovieTile(movie)
            });
        })
        .catch(error => console.error('Error fetching movies:', error));
}

getMovies(APIURL);


function createMovieTile(movie){
    const img = document.createElement('img');
    img.src = IMGPATH + movie.poster_path;
    img.alt = movie.title;

    // console.log(movie.genre_ids[0]);

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
    const btnMovieLink = document.createElement('a');
    btnMovieLink.href = '#';
    btnMovieLink.textContent = 'Watch Movie';
    buttonMovie.classList.add('buttonMovie');

    buttonMovie.append(btnMovieLink);

    movieTileDiv.append(movieFrontDiv);
    movieTileDiv.append(movieBackDiv);

    movieFrontDiv.append(img);
    movieFrontDiv.append(movieAboutDiv);

    movieAboutDiv.append(title);
    movieAboutDiv.append(voteAverage);
    movieAboutDiv.append(releaseDate);
    
    movieBackDiv.append(overView);
    movieBackDiv.append(buttonMovie);

    movieTileDiv.addEventListener('mouseenter', function() {
        movieTileDiv.classList.add('flip');
    });

    movieTileDiv.addEventListener('mouseleave', function() {
        movieTileDiv.classList.remove('flip');
    });


    mainDiv.append(movieTileDiv);

    return mainDiv;
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
    console.log(text.innerText);
    let titleText = text.innerText;
    if(titleText.length > 50){
        text.style.fontSize = '14px'
    }
    else if(titleText.length > 25){
        text.style.fontSize = '16px'
    }

}

function cutOverView(text){
    let movieText = text;
    if(movieText.length > 250){
        movieText = text.substring(0, 250) + '...';
    }

    return movieText;
}

form.addEventListener('submit', function(e){
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
})

