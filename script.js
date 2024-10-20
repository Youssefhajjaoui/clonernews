const story = []
const comment = []
let jobs = []
let polls = []
let type = 'live';
let lastversion;
let itemWonted = 30
let maxItemApi;

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

    switch (type) {
        case 'story':
            maxItemApi = getLink('maxitem');
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
            break; lastversion
        case 'live':
            maxItemApi = getLink('maxitem')
            type = null;
    }

    try {
        const maxItem = await fetch(maxItemApi).then(res => res.json());
        if (Array.isArray(maxItem)) {
            for (const elem of maxItem) {
                console.log(elem);
                const item = await fetchItem(elem);
                target.push(item);
                displayData(target.slice(0, itemWonted))
                if (target.length === itemWonted) {
                    break
                }
            }
            return
        }
        lastversion = maxItem;
        let currentId = maxItem;
        let foundItems = 0;
        const activeRequests = new Set();

        const processItem = async (id = currentId) => {
            if (foundItems >= itemWonted) return;
            const item = await fetchItem(id);

            if (item && (type === null || item.type === type)) {
                target.push(item);
                displayData(target.slice(0, itemWonted));
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
                <li> time : ${item.time} </li>
                <li> score : ${item.score} </li>
                <li> url : <a href="${item.url}" target="_blank">${item.url}</a> </li>
                </ul>
                `;
                break;
            case 'comment':
                div.innerHTML = `
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

async function notify() {
    let isDisplay = false;
    setInterval(async () => {
        try {
            const max = await fetch(maxItemApi).then(res => res.json());
            if (max !== lastversion && !isDisplay) {
                const notification = document.createElement('div');
                notification.className = 'new-content-alert';
                notification.innerHTML = `
                    <div class="alert-content">
                        New stories available! 
                        <button onclick="window.location.reload()">Reload</button>
                    </div>
                `;
                document.body.appendChild(notification);
                isDisplay = true;
                lastversion = max; 
            }
        } catch (error) {
            console.error("Error fetching data:", error);  
        }
    }, 5000);
}


function clonernews() {
    getData("live", 30)
    Routing()
    reloading()
    notify()
}
clonernews()