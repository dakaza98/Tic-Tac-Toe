!function(){
  const board = document.getElementById("board");
  const overlay = document.createElement("div");
  const overlayHeader = document.createElement("header");
  const overlayTitle = document.createElement("h1");
  const overlayNameField = document.createElement("input");
  const overlayNameFieldLabel = document.createElement("label");
  const overlayAI = document.createElement("input");
  const overlayAILabel = document.createElement("label");
  const overlayButton = document.createElement("a");
  const overlayMessage = document.createElement("p");
  const player1 = document.getElementById("player1");
  const player2 = document.getElementById("player2");
  const boxes = document.getElementsByClassName("box");
  const directions = ["horizontal", "vertical", "diagonal"];
  let boxObjects = [];
  let playerName = "";
  let turnsPlayed = 0;
  let playVsAI = false;
  let AIsTurn = false;

  //The following function adds the various events for the boxes.
  function AddFunctionalityToBoxes(){
    for(let i = 0; i < boxes.length; i++){
      boxObjects[i] = new Box(i);
      const currentBoxObject = boxObjects[i];
      const currentBox = boxObjects[i].box;

      //When the user hovers on a box, either X or O is shown depending on the current player
      currentBox.addEventListener("mouseover", () =>{
        //The O or X is only shown if the hovered box isn't filled and if it's the player's turn
        if(!currentBoxObject.isBoxFilled() && !AIsTurn){
          const currentPlayer = IsPlayer1Active() ? "o" : "x";
          currentBox.style.backgroundImage = 'url("img/'+ currentPlayer +'.svg")';
        }
      });

      //When the user no longer hovers the O or X is removed
      currentBox.addEventListener("mouseout", () => {
        if(!currentBoxObject.isBoxFilled())
          currentBox.style.backgroundImage = "";
      });

      currentBox.addEventListener("click", () => {
        if(playVsAI){
          //The boxes can only be pressed if the pressed box isn't filled and if it's the players turn
          if(!currentBoxObject.isBoxFilled() && !AIsTurn){
            AIsTurn = true;
            //Player 1's move
            currentBoxObject.FillBox();

            //Checks if player 1's move resulted in a victory
            if(!HasGameEnded()){
              //Filters out the boxes that can be selected by the AI
              let availableBoxes = [];
              for(let i = 0; i < boxObjects.length; i++){
                if(!boxObjects[i].isBoxFilled())
                  availableBoxes.push(boxObjects[i]);
              }

              //The AIs move is delayed by 1 second to make the game seem more realistic
              window.setTimeout(function(){
                //The AI chooses a box at random
                const chosenBox = availableBoxes[Math.floor(Math.random() * availableBoxes.length)];
                chosenBox.FillBox();

                AIsTurn = false;
                //Checks if the AIs move resulted in a victory
                HasGameEnded();
              }, 1000);
            }
          }
        }

        //1 vs 1, no AI
        else{
          //Fills the clicked box if the box isn't filled and checks if that move resulted in a victory
          if(!currentBoxObject.isBoxFilled()){
            currentBoxObject.FillBox();
            HasGameEnded();
          }
        }
      });
    }
  }

  //Contains neccesary information about each box
  function Box(index){
    this.box = boxes[index];
  }

  //Checks if the box is filled
  Box.prototype.isBoxFilled = function (){
    return this.box.className.includes("box-filled");
  }

  //Fills the box depending on which player is active
  Box.prototype.FillBox = function(){
    this.box.className += IsPlayer1Active() ? " box-filled-1" : " box-filled-2";
  }

  //Changes the display value of the provided element
  function ChangeDisplayValue(element, value){
    element.style.display = value;
  }

  //Checks if the game should end
  function CheckForGameEnd(){
    turnsPlayed++;

    //A victory can only be achieved after 5 turns have been played. Therefor, it's only
    //unneccesary to check for a victory before 5 turns have been played
    if(turnsPlayed >= 5){
      //There are three different directins: vertical, horizontal and diagonal
      for(let i = 0; i <= directions.length; i++){
        const currentDirection = directions[i];

        //For each directions there is an amount of rows that have to be checked one by one
        for(let rowIndex = 0; rowIndex < Row[currentDirection + "RowsAmount"]; rowIndex++){
          const row = new Row(currentDirection, rowIndex);

          //If a victory is found an end screen is created and the execution is stopped meaning it wont check anymore
          //rows for a victory
          if(row.CheckRowForVictory()){
            const playerNumber = IsPlayer1Active() ? "one" : "two";
            CreateEndScreen(playerNumber);

            return true;
          }
        }
      }

      //If turnsPlayed is equal to 9, the entire board is filled and since the victory is checked before
      //the following if statement, a tie has occured
      if(turnsPlayed === 9){
        CreateEndScreen("tie");
        return true;
      }
    }
    return false;
  }

  //Creates a screen at the end of the game and displays the winner or ties
  function CreateEndScreen(winnerOrTie){
    //Hides the board and shows the overlay
    ChangeDisplayValue(board, "none");
    ChangeDisplayValue(overlay, "block");

    //Applies a different style depending on if player 1 or player 2 wins or if a tie occures
    overlay.className = "screen screen-win screen-win-" + winnerOrTie;
    let message;
    switch (winnerOrTie) {
      case "one":
        //If the player has entered a name it is displayed at the end screen instead of the text "Winner"
        message = playerName !== "" ? playerName : "Winner";
        break;

      case "two":
        message = "Winner";
        break;

      default:
        message = "It's a tie";
        break;
    }

    overlayMessage.textContent = message;

    //Makes the boxes unfilled and removes the X and O that were placed in the previous game
    for(let i = 0; i < boxObjects.length; i++){
      const currentBox = boxObjects[i].box;
      currentBox.className = "box";
      currentBox.style = "";
    }

    //The overlay will always have the id "finish" and the same style after the first game has ended so it's
    //unneccesary to reapply the same style everytime a game has ended
    if(overlay.id !== "finish"){
      overlay.id = "finish";
      overlayMessage.className = "message";
      //Adds the message to the overlay
      overlayHeader.insertBefore(overlayMessage, overlayButton);
      overlayButton.textContent = "New Game";
    }
  }

  //Creates the start screen by applying different styles to various elements
  function CreateStartScreen(){
    ChangeDisplayValue(board, "none");

    overlay.className = "screen screen-start";
    overlay.id = "start";

    overlayTitle.textContent = "Tic Tac Toe";
    overlayHeader.append(overlayTitle);

    overlayNameFieldLabel.setAttribute("for", "playerName");
    overlayNameFieldLabel.style = "display:block; margin-top: 1em";
    overlayNameFieldLabel.textContent = "Enter Your Name:";

    overlayNameField.setAttribute("type", "text");
    overlayNameField.placeHolder = "Enter Your Name";
    overlayNameField.id = "playerName";
    overlayNameField.style = "display:block; margin: 0 auto 1em;";

    overlayAI.type = "checkbox";
    overlayAI.id = "playVsAI";
    overlayAI.style = "margin-bottom: .5em;";

    overlayAILabel.setAttribute("for", "playVsAI");
    overlayAILabel.textContent = "Play vs AI";
    overlayAILabel.append(document.createElement("br"));

    overlayButton.setAttribute("href", "#");
    overlayButton.className = "button";
    overlayButton.textContent = "Start game";
    overlayButton.addEventListener("click", StartGame);

    overlayHeader.appendChild(overlayNameFieldLabel);
    overlayHeader.appendChild(overlayNameField);
    overlayHeader.appendChild(overlayAI);
    overlayHeader.appendChild(overlayAILabel);
    overlayHeader.appendChild(overlayButton);

    overlay.appendChild(overlayHeader);
    board.parentElement.appendChild(overlay);
  }

  function GetActiveOrNotActivePlayer(condition){
    return IsPlayer1Active() === condition ? player1 : player2;
  }

  //Checks if the game has ended. If not, the active player is switched
  function HasGameEnded(){
    if(!CheckForGameEnd()){
      SwitchActivePlayer();
      return false;
    }

    else
      return true;
  }

  //Checks if player1 is the active player
  function IsPlayer1Active(){
    return player1.className.includes("active");
  }

  //An object declaration for a row.
  //The expressions are calculated so that the right boxes will be selected depending on the type of row.
  //E.g. the horizontal expression will select box 1, 2 and 3 when the rowIndex is 0. 4, 5 and 6 when rowIndex is 1 etc.
  function Row(direction, rowIndex){
    switch (direction) {
      case "horizontal":
        this.expression = "li:nth-child(n+" + (3 * rowIndex + 1) + "):nth-child(-n+" + (3 * rowIndex + 3) + ")";
        break;

      case "vertical":
        this.expression = "li:nth-child(3n+" + (rowIndex + 1) + "):nth-child(-3n+" + (rowIndex + 7) + ")";
        break;

      case "diagonal":
        //The multiplier is needed because the diagonal rows follow a different pattern compared to the horizontal and vertical rows.
        //For one of the diagonals, every 4th box must be selected but for the other diagonal, every second box must be selected. Therefor the
        //multipler must differ depending on which diagonal is being checked. The equation is based on box 5(the middle box) that appears in both diagonals.
        //In the first diagonal, 4 must be subtracted from 5(box 5)to get one of the boxes and then 4 must be added to 5 to get the other. The selected boxes
        //are now number 1, 5 and 9.
        //For the second diagonal the procedure is the same except that 4 is replaced by 2 so that boxes 3, 5 and 7 are selected.
        const multiplier = 4 - rowIndex * 2;
        this.expression = "li:nth-child(" + multiplier + "n + " + (5 - multiplier) + "):nth-child(-" + multiplier + "n + " + (5 + multiplier) + ")";
        break;
    }
  }

  //Static values used to determine how many rows there are of every type. These need to be static because they need to be accesed before a row object is created
  Row.verticalRowsAmount = 3;
  Row.horizontalRowsAmount = 3;
  Row.diagonalRowsAmount = 2;

  //Checks every row if that specific row contains a victory
  Row.prototype.CheckRowForVictory = function(){
    const boxesParentElement = document.getElementsByClassName("boxes")[0];
    //Selects the boxes with the expression for the specified row
    const elements = boxesParentElement.querySelectorAll(this.expression);
    const playerNumber = IsPlayer1Active() ? "1" : "2";
    let victory;

    for(let i = 0; i < elements.length; i++){
      const className = elements[i].className;
      //When a box is filled, the class name ends with eiter 1 or 2 depending on what player has selected that box. If all boxes class name ends with the same number
      //a victory has been achieved
      if(className[className.length - 1] === playerNumber)
        victory = true;

      else {
        //The execution is breaked if a box doesn't contain the playerNumber because that means that there is no victory on that row and it would just be unneccesary
        //to continue checking for a victory
        victory = false;
        break;
      }
    }

    return victory;
  }

  //Starts the game
  function StartGame(){
    //The overlayNameField is only needed in the beginning of the game and is removed when the game is started for the first time.
    //Therefor, the program must check if the name field exist otherwise several errors will occur when trying to check for a player name
    if(document.body.contains(overlayNameField)){
      if(overlayNameField.value !== ""){
        player1.firstElementChild.remove();
        //The player name is saved
        playerName = overlayNameField.value;
        player1.textContent = playerName;
        player1.style = "color:black; font-size: 1.5em";
      }

      overlayNameField.remove();
      overlayNameFieldLabel.remove();
    }

    //The option for playing against AI is also removed because it is only needed in the start
    if(document.body.contains(overlayAI)){
      if(overlayAI.checked)
        playVsAI = true;

      overlayAI.remove();
      overlayAILabel.remove();
    }

    //Resets the amount of turnsPlayed and sets the ai's turn to false so that the player can play again when a new game is started
    turnsPlayed = 0;
    AIsTurn = false;

    //Shows the board and hides the overlay
    ChangeDisplayValue(board, "block");
    ChangeDisplayValue(overlay, "none");

    //Sets player1 to the active player
    player1.className = "players active";
    player2.className = "players";
  }

  //Depending on the condition player1 or player2 will return depending on what player is active.
  //If condition is true, the active player will be returned. If condition is false the not active player will be returned


  //Switches the active player
  function SwitchActivePlayer(){
    const activePlayer = GetActiveOrNotActivePlayer(true);
    const notActivePlayer = GetActiveOrNotActivePlayer(false);

    activePlayer.className = "players";
    notActivePlayer.className = "players active";
  }



  //These two functions are called last when all the other functions are loaded to show the start screen and make the boxes clickable and hoverable
  CreateStartScreen();
  AddFunctionalityToBoxes();
}();
