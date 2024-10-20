const maxItemApi =
  "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty";
const Posts = [];
const Comments = [];
let story = [];
let itemWonted = 30;
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
      if (item) {
        switch (item.type) {
          case "job" || "story" || "poll":
            Posts.push(item);
            break;
          case "comment":
            Comments.push(item);
            break;
        }
      }
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
                        <div class="by">by ${item.by}</div>
                        <div class="title"> ${item.title} </div>
                        <div class="time">${time}</div>
                    </div>
                    <div class="card-thead">
                        <div class="link"><a href="">Read more</a></div>
                        <div class="score">${item.score ? item.score : 0} points</div>
                    </div>
                `;
        break;
      case "comment":
        div.classList.add("comment-card");
        div.innerHTML = `
                    <span class="card-flag comment"> comment </span>
                    <div class="info">
                        <div class="by">by ${item.by}</div>
                        <div class="time"> ${time} ago</div>
                    </div>
                    <div class="text">${item.text ? item.text : " "}</div>
                    <div class="card-thead">
                        <div class="link"><a href="">Read more</a></div>
                    </div>
                `;
        break;
      case "job":
        div.classList.add("job-card");
        div.innerHTML = `
                    <span class="card-flag job"> job </span>
                <div class="info">
                    <div class="by">by ${item.by}</div>
                    <div class="title">  ${item.title} </div>
                    <div class="time">${time} ago</div>
                </div>
                <div class="text"> ${item.text}</div>
                <div class="card-thead">
                    <div class="link">Read more</div>
                    <div class="score">${item.score}points</div>
                </div>
                `;
        break;
      case "poll":
        div.classList.add("poll-card");
        div.innerHTML = `
                <span class="card-flag poll"> poll </span>
                <div class="info">
                    <div class="by">by ${item.by}</div>
                    <div class="title">${item.title}</div>
                    <div class="time">${time} ago</div>
                </div>
                <div class="card-thead">
                    <div class="link"><a href="">Read more</a></div>
                    <div class="score">${item.score} points</div>
                </div>
                `;
        div.style.minWidth = "100%";
        break;
    }
    const main = document.querySelector(".container");
    main.appendChild(div);
  });
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

function Routing() {
  const links = document.querySelectorAll(".link-item");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelector(".active").classList.remove("active");
      link.classList.add("active");
      console.log(link.textContent);
    });
  });
  console.log(links);
}
Routing();
getData();
