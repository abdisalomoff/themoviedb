// GET ELEMENT IN HTML****************************
const form = document.getElementById("form");
const input = document.getElementById("search-input");
const moviesList = document.getElementById("movies-list");
let paginationWrapper = document.querySelector(".pagination-wrapper")
const pagination = document.getElementById("pagination");


// OPTION AND LINKS******************************
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjNjdhNTI1NmQwNWZkMTM5ZjA2ZDk0NjcwZTY3ZWM5NSIsInN1YiI6IjY1NDlmODgwNDFhNTYxMzM2Yjc5NDA4NCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KCSo44bFstaEm1ThHLdgVUdS7EHT8cgxx6pAPRU5g1Y'
  }
};

let page = 1
const moviesUrl = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc`;
const searchUrl = `https://api.themoviedb.org/3/search/movie?query=`;
const imageUrl = 'https://image.tmdb.org/t/p/w500';

// FETCH TO URL FUNCTION**************************
async function getMoives(url) {
  try {
    const response = await fetch(url, options);
    if (response.status !== 200) {
      console.log(`${response.status}`);
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error(error);
  }
}

// RENDER FUNCTION**************************
function renderMovies(movies) {
  moviesList.innerHTML = '';

  movies.forEach(movie => {
    const {
      backdrop_path,
      original_title,
      overview,
      vote_average
    } = movie;

    const movieCard = document.createElement('li');
    movieCard.className = "card";

    const cardImg = document.createElement('img');
    cardImg.src = imageUrl + backdrop_path;
    cardImg.alt = original_title;
    cardImg.className = "card-img";

    const cardBody = document.createElement('div');
    cardBody.className = "card-body";

    const cardTitle = document.createElement('h3');
    cardTitle.textContent = original_title;
    cardTitle.className = "title";

    const cardOverview = document.createElement('p');
    cardOverview.className = "card-overview";
    const trimmedOverview = overview.substring(0, 100);
    cardOverview.textContent = trimmedOverview;

    const readMoreButton = document.createElement('button');
    readMoreButton.textContent = "read more...";
    readMoreButton.className = "read-more-button";
    readMoreButton.addEventListener('click', () => {
      cardOverview.textContent = overview;
      readMoreButton.style.display = "none";
    })

    const cardRatingBox = document.createElement('div');

    const cardRating = document.createElement('span');
    cardRating.className = "card-rating"
    cardRating.textContent = vote_average;

    if (vote_average < 4) {
      cardRatingBox.className = "rating-low-box"
      cardRating.className = "rating-low"
    } else if (vote_average < 7.5) {
      cardRating.className = "rating-medium"
      cardRatingBox.className = "rating-medium-box"
    } else {
      cardRating.className = "rating-high"
      cardRatingBox.className = "rating-high-box"
    }

    movieCard.appendChild(cardImg);
    movieCard.appendChild(cardBody)
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardOverview);
    cardBody.appendChild(readMoreButton);

    cardBody.appendChild(cardRatingBox);
    cardRatingBox.appendChild(cardRating)

    moviesList.appendChild(movieCard);

  });
}

getMoives(moviesUrl).then((data) => renderMovies(data.results));


// SEARCH MOVIES***************************************
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const inputValue = input.value.trim().toLowerCase();
  const movies = await getMoives(searchUrl + inputValue);
  if (movies.total_results === 0) {
    moviesList.innerHTML = `<h3 class="error-message">movie not found!</h3>`
    paginationWrapper.style.display = 'none'
  } else {
    renderMovies(movies.results);
    const totalPages = movies.total_pages;
    page = 1;
    paginationButtons(totalPages);
  }

  form.reset()
});


// PAGINATION FUNCTION**********************************
function paginationButtons(totalPages) {
  pagination.innerHTML = ''; // Clear previous buttons

  const pagesShow = Math.min(totalPages, 5); // Show up to 5 buttons
  const middlePages = Math.max(pagesShow - 2, 0);

  let startPage = 1;
  if (page > middlePages) {
    startPage = Math.max(1, page - Math.floor(middlePages / 2));
  }

  for (let i = startPage; i < startPage + pagesShow; i++) {
    const pageButton = document.createElement('li');
    pageButton.textContent = i;
    if (i === page) {
      pageButton.className = 'active';
    }

    pageButton.addEventListener('click', async () => {
      page = i;
      const url = `https://api.themoviedb.org/3/discover/movie?include_adult=true&include_video=true&language=en-US&page=${page}&sort_by=popularity.desc`;
      const moviesData = await getMoives(url);
      renderMovies(moviesData.results);
      paginationButtons(totalPages);
    });

    pagination.appendChild(pageButton);
  }
}


getMoives(moviesUrl).then((data) => {
  const totalPages = data.total_pages;
  paginationButtons(totalPages);
  renderMovies(data.results);
});