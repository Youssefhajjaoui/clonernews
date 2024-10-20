
const story = []
const comment = []
let jobs = []
let polls = []
let type = '';
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

function getLink(prelink) {
    return `https://hacker-news.firebaseio.com/v0/${prelink}.json?print=pretty`
}

const fetchItem = async (id) => {
    try {
        const response = await fetch(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
        );
        return await response.json();
    } catch {
        return null;
    }
};

const getData = async (type) => {
    const MAX_CONCURRENT = 50;
    let target = [];
    let maxItemApi;

    displayData(emptyData(DataPerPage))
    switch (type) {
        case 'story':
            maxItemApi = getLink('topstories');
            target = story;
            break;
        case 'jobs':
            maxItemApi = getLink("jobstories");
            target = jobs;
            break;
        case 'polls':
            maxItemApi = getLink('maxitem')
            target = polls;
            break;
        case 'comment':
            maxItemApi = getLink('maxitem')
            target = comment;
            break;
        default:
            maxItemApi = getLink('maxitem')
            type = null;
    }

    try {
        const maxItem = await fetch(maxItemApi).then(res => res.json());
        if (Array.isArray(maxItem)) {
            for (let elem of maxItem) {
                try {
                    while (target.length < DataPerPage) {
                        const item = await fetchItem(elem);
                        // console.log('Fetched item:', item);
                        target.push(item);

                    }
                } catch (error) {
                    console.error('Error processing item:', error);
                }
            }
            displayData(target)
            return
        } else {
            console.error('maxItem is not an array:', maxItem);
        }
        let currentId = maxItem;
        let foundItems = 0;
        const activeRequests = new Set();

        const processItem = async (id = currentId) => {
            if (foundItems >= DataPerPage) return;
            const item = await fetchItem(id);

            // Accept item if either type matches or type is null (default case)
            if (item && (type === null || item.type === type)) {
                target.push(item);
                foundItems++;
            }
        };

        let start = currentPage * dataPerPage;
        while (foundItems < start + DataPerPage) {
            while (activeRequests.size < MAX_CONCURRENT && foundItems < DataPerPage) {
                const request = processItem();
                activeRequests.add(request);

                request.finally(() => {
                    activeRequests.delete(request);
                })
                currentId--
            }

            if (activeRequests.size > 0) {
                await Promise.race([...activeRequests]);
            }
        }
        displayData(target.slice(start, start + DataPerPage));

    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

function displayData(data) {
    const main = document.querySelector('#container');
    main.innerHTML = ""
    data.forEach((item, index) => {
        index++;
        const div = document.createElement('tr');
        div.className = 'data';
        switch (item.type) {
            case 'story':
                div.innerHTML = `
                <td>${index}</td>
                <td>Story</td>
                <td>${item.by}</td>
                <td> title : ${item.title} </td>
                <td> time : ${item.time} </td>
                <td> score : ${item.score} </td>
                <td> url : <a href="${item.url}" target="_blank">${item.url}</a> </td>

                `;
                break;
            case 'comment':
                div.innerHTML = `
                 <td>${index}</td>
                 <td>Comment</td>
                 <td>${item.by}</td>
                 <td> title : ${item.title} </td>
                 <td> time : ${item.time} </td>
                 <td> score : ${item.score} </td> 

                 `;
                break;
            case 'job':
                div.innerHTML = `
                     <ul class="data">
                     <td>${index}</td>
                     <td>Job</td>
                     <td>${item.by}</td>
                     <td> title : ${item.title} </td>
                     <td> time : ${item.time} </td>
                     <td> score : ${item.score} </td> 
                     </ul>
                     `;
                break;
            case 'poll':
                div.innerHTML = `
                <ul class="data">
                <td>${index}</td>
                <td>Poll</td>
                <td>${item.by}</td>
                <td> title : ${item.title ? item.title : 'no title'} </td>
                <td> time : ${item.time} </td>
                <td> score : ${item.score ? item.score : 0} </td> 
                </ul>
                `;
                break;
            default:
                div.innerHTML = `
                <ul class="data">
                <td>Loading data</td> 
                </ul>
                `;
        }
        main.appendChild(div);
    })
}

function Routing() {
    let category = document.querySelector("#choice-type");
    category.addEventListener('change', (event) => {
        type = event.target.value
        getData(type);
    });
}

function reloading() {
    let buttom = document.querySelector('#More');
    buttom.addEventListener('click', (elem) => {
        // DataPerPage += 30
        getData(type);
    })
}

function clonernews() {
    Routing()
    reloading()
}
clonernews()

function emptyData(a) {
    let arr = []
    for (let i = 0; i < a; i++) {
        arr.push('')
    }
    return arr;
}