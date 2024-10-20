const maxItemApi = "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
const pageSizeSelect = document.getElementsByName('move');
const currentPagedisplay = document.getElementById('current-page');
const story = []
const comment = []
let jobs = []
let polls = []
let VisiblePerPage = 20
let currentPage = 1;

document.querySelector('#data-per-page').addEventListener('change', (val) => {
    VisiblePerPage = parseInt(val.target.value);
    console.log(val)
});

const renderPagination = () => {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(target.length / currentPage);
    console.log('totalPages', totalPages);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });
        pagination.appendChild(button);
    }
};

pageSizeSelect.forEach(select => {
    select.addEventListener('click', (e) => {
        // currentPage = 1;
        
        if (e.target.value === '-1' && currentPage!= 1|| e.target.value=== '1') {
            currentPage = currentPage+ parseInt(e.target.value);
        }
        currentPagedisplay.textContent = currentPage
        console.log('test',e.target.value,currentPage);
        // loadData(data); // Reload the data with the new page size
    });
});

const getData = async (type, VisiblePerPage) => {
    const CONCURRENT_LIMIT = 50; // Maximum concurrent requests
    let target = [];

    try {
        const maxItemResponse = await fetch(maxItemApi);
        let currentId = await maxItemResponse.json();

        // Queue to manage active promises
        const activePromises = new Set();
        let foundItems = 0;

        const processSingleItem = async (id) => {
            try {
                const response = await fetch(
                    `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
                );
                const item = await response.json();

                if (item && item.type === type && foundItems < VisiblePerPage) {
                    target.push(item);
                    foundItems++;
                    return true;
                }
            } catch (error) {
                console.error(`Error fetching item ${id}:`, error);
            }
            return false;
        };

        while (foundItems < VisiblePerPage) {
            // Fill up the concurrent requests pool
            while (activePromises.size < CONCURRENT_LIMIT && foundItems < VisiblePerPage) {
                const promise = processSingleItem(currentId).then(result => {
                    activePromises.delete(promise);
                    return result;
                });

                activePromises.add(promise);
                currentId--;
            }

            // Wait for any promise to complete
            if (activePromises.size > 0) {
                await Promise.race(activePromises);
            }
        }

        // Optional: Wait for any remaining relevant promises
        const remainingPromises = [...activePromises];
        if (remainingPromises.length > 0) {
            await Promise.race(remainingPromises);
        }
        // renderPagination();
        let start = (currentPage - 1) * VisiblePerPage
        displayData(target.slice(start, start + VisiblePerPage));

    } catch (error) {
        console.error("Error:", error);
        return target;
    }
};

const fetchWithRetry = async (id) => {
    try {
        const response = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
        );
        return await response.json();
    } catch (error) {
        console.error(`Failed to fetch item ${id}`, error);
        return null;
    }
};
function displayData(data) {
    const main = document.querySelector('.container');
    main.innerHTML = ""
    data.forEach((item, index) => {
        index++;
        const div = document.createElement('div');
        switch (item.type) {
            case 'story':
                div.innerHTML = `
                <ul>
                <li>${index}</li>
                Story
                <li>${item.by}</li>
                <li> title : ${item.title} </li>
                <li> time : ${item.time} </li>
                <li> score : ${item.score} </li>
                <li> url : <a href="${item.url}" target="_blank">${item.url}</a> </li>
                </ul>
                `;
                break;
            case 'comment':
                div.innerHTML = `
                    <ul>
                 <li>${index}</li>
                 Comment
                 <li>${item.by}</li>
                 <li> title : ${item.title} </li>
                 <li> time : ${item.time} </li>
                 <li> score : ${item.score} </li> 
                 </ul>
                 `;
                break;
            case 'job':
                div.innerHTML = `
                     <ul>
                     <li>${index}</li>
                     Job
                     <li>${item.by}</li>
                     <li> title : ${item.title} </li>
                     <li> time : ${item.time} </li>
                     <li> score : ${item.score} </li> 
                     </ul>
                     `;
                break;
            case 'poll':
                div.innerHTML = `
                <ul>
                <li>${index}</li>
                Poll
                <li>${item.by}</li>
                <li> title : ${item.title ? item.title : 'no title'} </li>
                <li> time : ${item.time} </li>
                <li> score : ${item.score ? item.score : 0} </li> 
                </ul>
                `;
                break;
        }
        main.appendChild(div);
    })
}

function Routing() {
    let category = document.querySelector("#choice-type");
    category.addEventListener('change', (event) => {
        console.log(event.target.value, VisiblePerPage)
        getData(event.target.value, VisiblePerPage);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    Routing()
})
//getData()