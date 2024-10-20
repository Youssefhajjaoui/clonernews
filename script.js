
const story = []
const comment = []
let jobs = []
let polls = []
let type = '';
let itemWonted = 30

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

const getData = async (type, itemWonted) => {
    const MAX_CONCURRENT = 50;
    let target = [];
    let maxItemApi;

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
            for (const elem of maxItem) {
                try {
                    while (target.length < itemWonted) {
                        const item = await fetchItem(elem);
                        console.log('Fetched item:', item);
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
            if (foundItems >= itemWonted) return;
            // console.log(id);
            const item = await fetchItem(id);

            // Accept item if either type matches or type is null (default case)
            if (item && (type === null || item.type === type)) {
                target.push(item);
                foundItems++;
            }
        };

        while (foundItems < itemWonted) {
            while (activeRequests.size < MAX_CONCURRENT && foundItems < itemWonted) {
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

        displayData(target.slice(0, itemWonted));

    } catch (error) {
        console.error("Error fetching data:", error);
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
        type = event.target.value
        itemWonted = 30
        getData(type, itemWonted);
    });
}

function reloading() {
    let buttom = document.querySelector('#More');
    buttom.addEventListener('click', (elem) => {
        itemWonted += 30
        getData(type, itemWonted);
    })
}

function clonernews() {
    Routing()
    reloading()
}
clonernews()