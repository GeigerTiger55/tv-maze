"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const DEFAULT_IMAGE_URL = 'https://tinyurl.com/tv-missing';


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {

  const response = await axios.get("http://api.tvmaze.com/search/shows",
    { params: { q: searchTerm } });

  const shows = [];

  for (let showAndScore of response.data) {
    let { id, image, summary, name } = showAndScore.show;
    if (image === null) {
      image = DEFAULT_IMAGE_URL;
    } else {
      image = image.medium;
    }

    const tempShowObj = {
      id,
      image,
      summary,
      name,
    };
    shows.push(tempShowObj);
  }

  return shows;

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {

  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);

  const listedEpisodes = [];

  for (let episode of response.data) {
    let { id, name, season, number } = episode;

    const tempEpisodeObj = {
      id,
      name,
      season,
      number,
    };
    listedEpisodes.push(tempEpisodeObj);

  }

  return listedEpisodes;

}




/** Given list of episodes, create markup for each and add to DOM 
 * 
*/

function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");

  for(let episode of episodes) {
    const {name, season, number} = episode;


    const $episodeLi = $(
      `<li>${name} (season ${season}, number ${number})</li>`
    )

    $episodesList.append($episodeLi);
  }

  //Show Episodes Area
  $episodesArea.css("display", "block");
}
