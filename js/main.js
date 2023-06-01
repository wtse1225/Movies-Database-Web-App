/*********************************************************************************
*  WEB422 - Assignment 2
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Wai Hing William Tse   Student ID: 149 992 216     Date: 5/31/2023
*  Cyclic Link: https://blue-violet-stingray-wrap.cyclic.app
*
********************************************************************************/

/* Page Variables declarations */
let page = 1;
const perPage = 10;

/* This function is to pull movie data from the published movies API (created in A1), 
format the data, add it to the DOM, add "click" events to each row item, and populate 
a modal window with the movie data when the event fires */
function loadMovieData(title = null) {
    let url = `/api/movies?page=${page}&perPage=${perPage}`;
    let div = document.querySelector('.pagination');

    if (title) {
        url += `&title=${title}`;
        page = 1;

        // If the optional title is inputted, add a new class 'd-none' to the element in 'pagination' class
        div.classList.add('d-none');

    } else {
        div.classList.remove('d-none');
    }

    // A fetch request to the API
    fetch(url)
        .then((res) => res.json())
        .then((data) => {

            // Create the <tr> Elements to the table
            let movieRows = `
                ${data.map(movie => (
                `<tr data-id=${movie._id}>
                    <td>${movie.year}</td>
                    <td>${movie.title}</td>
                    <td>${movie.plot ? movie.plot : 'N/A'}</td>
                    <td>${movie.rated ? movie.rated : 'N/A'}</td>
                    <td>${Math.floor(movie.runtime / 60) + ":" + (movie.runtime % 60).toString().padStart(2, '0')}</td>
                </tr>`
                )).join('')}
                `;

            // Add the fetched <tr> elements to the table body
            document.querySelector('#moviesTable tbody').innerHTML = movieRows;

            // Update the "Current Page"
            document.querySelector('#current-page').innerHTML = page;

            // Add a click event listener to the show the modal for clicked rows
            document.querySelectorAll('#moviesTable tbody tr').forEach((row) => {
                row.addEventListener('click', (e) => {
                    fetch(`api/movies/${e.currentTarget.dataset.id}`)
                        .then((res) => res.json())
                        .then((data) => {

                            document.querySelector('#detailsModal .modal-header .modal-title').innerHTML = data.title;
                            
                            let page = document.querySelector('#detailsModal .modal-body').innerHTML = `
                                <img class="img-fluid w-100" src="${data.poster ? data.poster : ''}"><br><br>
                                <strong>Directed By:</strong> ${(data.directors).join(', ')}<br><br>
                                <p>${data.fullplot ? data.fullplot : 'N/A'}</p>
                                <strong>Cast:</strong> ${data.cast ? (data.cast).join(', ') : 'N/A'}<br><br>
                                <strong>Awards:</strong> ${data.awards.text}<br>
                                <strong>IMDB Rating:</strong> ${data.imdb.rating} (${data.imdb.votes} votes)
                            `
                            document.querySelector('#detailsModal .modal-body').innerHTML = page;
                        })
                })
            });
        })
        .catch((err) => {
            console.log('Failed to fetch data, detail as following: ' + err);
            document.querySelector('#title').value = "...Title Not Found";
        });
};

// Execute when the DOM is 'ready'
document.addEventListener('DOMContentLoaded', function () {

    // Initialize with movie data
    loadMovieData();

    // A click event listener for updating the page number for the previous page button
    document.querySelector('#previous-page').addEventListener('click', () => {
        if (page > 1) {
            page--;
            loadMovieData();
        }
    });

    // A click event listener for updating the page number for the next page button
    document.querySelector('#next-page').addEventListener('click', () => {
        page++;
        loadMovieData();
    });

    // Search submit form, prevent empty submission; send input title text to loadMovieData()
    document.querySelector('#searchForm').addEventListener('submit', (input) => {
        input.preventDefault();
        loadMovieData(document.querySelector('#title').value);
    });

    // Clear form button, resets value of the title field to empty string
    document.querySelector('#clearForm').addEventListener('click', () => {
        document.querySelector('#title').value = "";
        loadMovieData();
    });
});


