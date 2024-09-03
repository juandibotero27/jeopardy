
//logic to load the game


//create the main data structure of the game
//categories will contain 6 objects, with each object representing a category.
let categories = [];


/**
 * Event Listener added the the "Start button" to start the game, once clicked a "Loading.." card 
 * will be displayed, and the actual game() will begin after 5 seconds
 */
$(".startButton").on("click", async function(){

    //empty the current grid to show a "loading card"
    $('.grid').empty();
    let loadingBar = $('<div class="card loading">LOADING...<div> ');
    $('.grid').append(loadingBar);

    //once the game is done, "Loading.." begin the actual game..
    setTimeout(async function(){
        await game();
    }, 3000);
});


/**
 * Event Listener added on the entire grid. Once a ".questionCard" is clicked, it 
 * should manipulate the display depending on what state the card is in.
 * Once the game is started/ restarted, all cards are initialized in a "hiding" state.
 * Cards in a "hiding" state, will display their question once clicked
 * Cards in a "reveal" state, will display their answer once clicked
 */
$('.grid').on("click", ".questionCard", async function(e){
    //assuming categories already exists, we can just change the text of a question card
    console.log($(this).attr('class'));

    //first grab the question id
    let classList = $(this).attr('class').split(' ');
    let questionID = classList[1];

    //split questionID so you have 2 individual variables
    questionID = questionID.split('-');
    //catID will be used to call the category attached to each card
    let catID = questionID[0];
    //qID will be used to call the question attached to each card
    let qID =  questionID[1];


    //check which state a card is in, then change the state accordingly
    if($(this).hasClass('hiding')){
        $(this).text(`${categories[catID].clues[qID].question}`);
        $(this).toggleClass('hiding');
        $(this).toggleClass('reveal');
    } else if($(this).hasClass('reveal')){
        $(this).text(`${categories[catID].clues[qID].answer}`);
        $(this).toggleClass('reveal');
        $(this).toggleClass('answer');
    }

});



/**
 * Code containing all logic for the actual game. Will generate categories, cards, and append them 
 * to the ".grid" div.
 */
async function game(){


    //Logic to reset the game

    //remove the loading card from the screen
    $('.loading').remove();

    //reset categories array, and change the "StartGame" button to "RestartGame"
    categories.length=0;
    $('input').attr('value', "Restart Game!");

    //clear the grid
    $('.grid').empty();



    //generate 6 random categories and put them into the categories array.

    //using get6IDS(), store the question IDs from the api in an array.
    let ids = await get6IDS();
    for(let i=0; i <= 5; i++){
        categories.push( await generateCategory(ids[i]));
    }



    //load the first 6 cards onto the screen as the categories
    for(let cat of categories){
        let newCatdiv = $('<div class="card"></div>').text(`${cat.title}`);
        $('.grid').append(newCatdiv);
    }

    //load the the rows of questions now..?

    //i = categories
    for(let i = 0; i <= 4; i++){
        //j = questions
        for(let j = 0; j <= 5; j++){
            //this will create a new card, and add the question text.
            let newQdiv = $('<div class="card"></div>').text(`?`);
            //this is the queston id
            newQdiv.toggleClass(j+ '-' + i);

            //this is so we can individually click the questions with an event listener later on
            newQdiv.toggleClass('questionCard');
            newQdiv.toggleClass('hiding');

            //add to dom
            $('.grid').append(newQdiv);
        }
    }
    console.log(categories);


}


/**
 * get6IDS() Grabs the categories from the API, shuffles them
 * 
 * @returns {ids[]} an array the contains 6 random categories
 */
async function get6IDS(){
    //get all categories from api
    const catResponse = await axios.get("https://rithm-jeopardy.herokuapp.com/api/categories?count=100");
    //store categories into an array
    let catArray = catResponse.data;

    //shuffle all categories
    //fisher-yates shuffle algorithm
    for (let i = catArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [catArray[i], catArray[j]] = [catArray[j], catArray[i]];
    }

    //now splice the array so it's only 6 values, and grab the ids
    let ids = catArray.splice(0,6).map(function(obj){
        return obj.id;
    });

    //return shuffled array
    return ids;
}


//now that you have the ids, make a funciton to create a new object containing just the title, and clues, frmo a single ID

/**
 * 
 * @param {array} id - an array of 6 random categories
 * @returns {object} - an object containing a category title, and "clues", which is an array of objects
 * containing questions, and answers
 */

async function generateCategory(id){
    const idResponse = await axios.get(`https://rithm-jeopardy.herokuapp.com/api/category?id=${id}`);

    let category = {
        title: idResponse.data.title,
        clues: []
    };

    for(let i=0; i < 5; i++){
        let obj = {
            question: idResponse.data.clues[i].question,
            answer: idResponse.data.clues[i].answer,
            showing: null
        }
        category.clues.push(obj);
    }

    return category;
}

