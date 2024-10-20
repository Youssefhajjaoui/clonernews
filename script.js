const maxItemApi = "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
const story = []
const comment = []
let jobs = []
let polls = []
let itemWonted = 30

const getData = async (type, itemWonted) => {
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

                if (item && item.type === type && foundItems < itemWonted) {
                    target.push(item);
                    foundItems++;
                    return true;
                }
            } catch (error) {
                console.error(`Error fetching item ${id}:`, error);
            }
            return false;
        };

        while (foundItems < itemWonted) {
            // Fill up the concurrent requests pool
            while (activePromises.size < CONCURRENT_LIMIT && foundItems < itemWonted) {
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
        displayData(target.slice(0, itemWonted));

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
        getData(event.target.value, itemWonted);
    });
}
Routing()
//getData()