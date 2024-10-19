const maxItemApi = "https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty"
const Posts  = []
const Comments  = []
let story = []
let itemWonted = 30
const getData = async ( pageItems =  itemWonted ) => {
    try {
        const response = await fetch(maxItemApi);
        const maxItem = await response.json();
        for (let i = 0; i < pageItems; i++) {
            const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${maxItem - i}.json?print=pretty`);
            const item = await response.json();
            if (item){
                switch  (item.type) {
                    case  'job' || 'story' || 'poll' :
                        Posts.push(item);
                        break;
                    case 'comment': 
                    Comments.push(item);
                    break;
                }
            }
            story.push(item);
        }

        displayData( story)
    }
    catch (error) {
        console.error(error);
    }
}

function displayData(data) {

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
        const main = document.querySelector('.container');
        main.appendChild(div);
    })
}

function Routing(){
    // get the name  of the page and pass the  data 
    // for example if page 'jobs' then display the  jobs data inside it 

}
getData()