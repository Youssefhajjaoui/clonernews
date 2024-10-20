
let DataPerPage = 20
let currentPage = 0;

const dataPerPage = document.getElementById('data-per-page')
dataPerPage.addEventListener('change', () => {
    DataPerPage = parseInt(dataPerPage.value);
});

const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const firstPageButton = document.getElementById('first-page');

firstPageButton.addEventListener('click', () => {
    currentPage = 0;
    document.getElementById('current-page').textContent = currentPage+1;
});

prevPageButton.addEventListener('click', () => {
    if (currentPage > 0) {
        currentPage--;
        document.getElementById('current-page').textContent = currentPage+1;
    }
});

nextPageButton.addEventListener('click', () => {
    currentPage++;
    document.getElementById('current-page').textContent = currentPage+1;
});

function emptyData(a) {
    let arr = []
    for (let i = 0; i < a; i++) {
        arr.push('')
    }
    return arr;
}