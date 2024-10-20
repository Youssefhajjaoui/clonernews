const maxItemApi ="https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty";
const Posts = [];
const Comments = [];
let story = [];
let itemWonted = 100;
const getData = async (pageItems = itemWonted) => {
  try {
    const response = await fetch(maxItemApi);
    const maxItem = await response.json();
    console.log(maxItem);
    for (let i = 0; i < pageItems; i++) {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${
          maxItem - i
        }.json?print=pretty`
      );
      const item = await response.json();
      PreReload()
      story.push(item);
    }
    displayData(story);
  } catch (error) {
    console.error(error);
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
                    <div class="link job-link">Explore the job</div>
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
        div.style.minWidth = "100%";
        break;
    }
    const main = document.querySelector(".container");
    main.appendChild(div);
  });
}

function Routing() {
    const links = document.querySelectorAll(".link-item");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        link.classList.add("active");
        console.log(link.dataset.route);
      });
    });
    console.log(links);
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


Routing();
getData();
