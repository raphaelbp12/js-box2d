import { World } from './world.js'
import { WorldDrawer } from './worldDrawer.js'
import { GenericWebWorker } from './GenericWebWorker.js'

function init() {  

  var canvas = document.getElementById("canvas")
  var world = new WorldDrawer(30, canvas)

  let numPopulation = 1
  let population = []

  for(let i = 0; i < numPopulation; i++) {
    population.push(new World(0, 0, 30, canvas))
  }


  let backwardOrForward = 0, leftOrRight = 0

  document.addEventListener('keydown', (event) => {
      let code = event.key;
      if(code == 'a' || code == 'ArrowLeft' ) //LEFT
        leftOrRight = -1
      if(code == 'd' || code == 'ArrowRight') //RIGHT
        leftOrRight = 1
      if(code == 'w' || code == 'ArrowUp') //FORWARD
        backwardOrForward = 1
      if(code == 's' || code == 'ArrowDown') //BACKWARD
        backwardOrForward = -1
  });
  document.addEventListener('keyup', (event) => {
    let code = event.key;
    if(code == 'a' || code == 'ArrowLeft' ) //LEFT
      leftOrRight = 0
    if(code == 'd' || code == 'ArrowRight') //RIGHT
      leftOrRight = 0
    if(code == 'w' || code == 'ArrowUp') //FORWARD
      backwardOrForward = 0
    if(code == 's' || code == 'ArrowDown') //BACKWARD
      backwardOrForward = 0
  });

  

  document.addEventListener('keydown', (event) => {
    let code = event.key;
    if(code == 'r') //LEFT
      update()
  });
  // window.setInterval(update, 1000 / 60);

  let gameoverCounter = 0

  update()

  function test () {
    return 1
  }
  
  let gw = new GenericWebWorker({foo: 23, bar: "ii"}, test)
  gw.exec((data, fun1)=>{
      var a = 0
      for (var i = 0; i < 1000; i++) //blocking code
      {
        // console.log('******* i', i)
        a += i
      }
  
      console.log(data) //{foo: 23, bar: "ii"}
      return fun1()
  })
  .then(data => {
    console.log('#####################', data+1)
  }) //print Hello there
  .catch(e=> {})
  
  //update  
  function update() {

    // world.update(true)

    let allWorlds = []

    population.forEach((person, index) => {
      allWorlds.push({car: person.car, gameover: person.gameover})
      if(!person.gameover) {
        person.update(false)
        // console.log('world update called', index)
        if(person.gameover) {
          console.log('gameoverCounter incresed', gameoverCounter)
          gameoverCounter = gameoverCounter + 1
        }
      }
    })

    world.drawAllWorlds(allWorlds)
    world.update()

    // console.log('update called', gameoverCounter, population.length)

    if(gameoverCounter < population.length) {
      console.log('ooveeer gameoverCounter', gameoverCounter)
      window.setTimeout(update, 10);
    } else if (gameoverCounter == population.length) {
      console.log('ooveeer gameoverCounter', gameoverCounter)
      window.setTimeout(update, 10);
      gameoverCounter = gameoverCounter + 1
    }
  };


};


      
init();