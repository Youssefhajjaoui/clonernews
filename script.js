const story = []
const comment = []
let jobs = []
let polls = []
let type = 'live';
let lastVersion;
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
        case 'job':
            maxItemApi = getLink("jobstories");
            target = jobs;
            break;
        case 'poll':
            maxItemApi = getLink('maxitem')
            target = polls;
            break;
        case 'comment':
            maxItemApi = getLink('maxitem')
            target = comment;
            break; lastVersion
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
        lastVersion = maxItem;
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
    const main = document.querySelector(".container");
    main.innerHTML = "";
    data.forEach((item, index) => {
      index++;
      const time = formatTime(item.time);
      const div = document.createElement("div");
      switch (item.type) {
        case "story":
          div.classList.add("story-card");
          div.innerHTML = `
                      <span class="card-flag story" > story </span>
                      <div class="info">
                          <div class="by">by ${item.by ? item.by :  "Unknown"}</div>
                          <div class="title"> ${item.title ? item.title : ''} </div>
                          <div class="time">${time}</div>
                      </div>
                      <div class="card-thead">
                          <div class="link"><a href=${item.url ? item.url : '#'}>see the story</a></div>
                          <div class="score">${item.score ? item.score : 0} points</div>
                      </div>
                  `;
          break;
        case "comment":
          div.classList.add("comment-card");
          div.innerHTML = `
                      <span class="card-flag comment"> comment </span>
                      <div class="info">
                          <div class="by">by ${item.by ? item.by :  "Unknown"}</div>
                          <div class="time"> ${time} ago</div>
                      </div>
                      <div class="text">${item.text ? item.text : ''}</div>
                      <div class="card-thead">
                          <div class="link comment-link"><a>Read more</a></div>
                      </div>
                  `;
          break;
        case "job":
          div.classList.add("job-card");
          div.innerHTML = `
                      <span class="card-flag job"> job </span>
                  <div class="info">
                      <div class="by">by ${item.by ? item.by :  "Unknown"}</div>
                      <div class="title">  ${item.title  ? item.title : ''} </div>
                      <div class="time">${time} ago</div>
                  </div>
                  <div class="text"> ${item.text  ? item.text : ''}</div>
                  <div class="card-thead">
                      <div class="link job-link"><a href=${item.url ? item.url : '#'}>Explore the job</a></div>
                      <div class="score">${item.score  ? item.score : 0} points</div>
                  </div>
                  `;
          break;
        case "poll":
          div.classList.add("poll-card");
          div.innerHTML = `
                  <span class="card-flag poll"> poll </span>
                  <div class="info">
                      <div class="by">by ${item.by  ? item.by :  "Unknown"}</div>
                      <div class="title">${item.title   ? item.title : ''}</div>
                      <div class="time">${time} ago</div>
                  </div>
                  <div class="card-thead">
                      <div class="score">${item.score   ? item.score : 0} points</div>
                  </div>
                  `;
          break;
      }
      main.appendChild(div);
    });
  }

function Routing() {
    const links = document.querySelectorAll(".link-item");
    links.forEach((link) => {
        link.addEventListener("click", () => {
            document.querySelector(".active").classList.remove("active");
            link.classList.add("active");
            const type = link.dataset.route
            itemWonted = 30
            PreReload()
            getData(type, itemWonted);
        });
    });
}


function reloading() {
    let buttom = document.querySelector('#More');
    buttom.addEventListener('click', () => {
        itemWonted += 30
        getData(type, itemWonted);
    })
}

async function notify() {
    let isDisplay = false;
    setInterval(async () => {
        try {
            const max = await fetch(maxItemApi).then(res => res.json());
            if (max !== lastVersion && !isDisplay) {
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

// helper functions
function PreReload(){
    const container = document.querySelector(".container");
    container.innerHTML = `
    <div class="loader">
    <div class="loader-inner"></div>
    </div>
    `;
}

function formatTime(time) {
    const itemTime = new Date(time * 1000);
    const currentTime = new Date();
    const timeDiff = currentTime - itemTime;
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const seconds = Math.floor(timeDiff / 1000);
    if (days > 0) {
        return `${days} days`;
    } else if (hours > 0) {
        return `${hours} hours`;
    } else if (minutes > 0) {
        return `${minutes} minutes`;
    } else {
        return `${seconds} seconds`;
    }
}




function clonernews() {
    getData("live", 30)
    Routing()
    reloading()
    notify()
}
clonernews()