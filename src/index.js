import { Car } from './car.js'
import { Goal } from './goal.js'
import { Layer } from './NeuralNetwork/layer.js'
import contactListener from './contactListener.js'
import draw from './draw.js'

function init() {
  var   b2Vec2 = Box2D.Common.Math.b2Vec2
     ,  b2AABB = Box2D.Collision.b2AABB
      ,	b2BodyDef = Box2D.Dynamics.b2BodyDef
      ,	b2Body = Box2D.Dynamics.b2Body
      ,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
      ,	b2Fixture = Box2D.Dynamics.b2Fixture
      ,	b2World = Box2D.Dynamics.b2World
      ,	b2MassData = Box2D.Collision.Shapes.b2MassData
      ,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
      ,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
      ,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
     ,  b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef
     ;
  
  var world = new b2World(
        new b2Vec2(0, 0)    //gravity
     ,  true                 //allow sleep
  );

  var worldDrawScale = 30.0
  
  var fixDef = new b2FixtureDef;
  fixDef.density = 1.0;
  fixDef.friction = 1.0;
  fixDef.restitution = 0.1;
  
  var bodyDef = new b2BodyDef;
  
  //create ground
  bodyDef.type = b2Body.b2_staticBody;
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(40, 2);
  bodyDef.position.Set(10, 720 / worldDrawScale + 1.8);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  bodyDef.position.Set(10, -1.8);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  fixDef.shape.SetAsBox(2, 14);
  bodyDef.position.Set(-1.8, 13);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  bodyDef.position.Set(1280 / worldDrawScale + 1.8, 13);
  world.CreateBody(bodyDef).CreateFixture(fixDef);
  
  
  
  //create some objects
//   bodyDef.type = b2Body.b2_kinematicBody;
//   for(var i = 0; i < 10; ++i) {
//      if(Math.random() > 0.5) {
//         fixDef.shape = new b2PolygonShape;
//         fixDef.shape.SetAsBox(
//               Math.random() + 0.1 //half width
//            ,  Math.random() + 0.1 //half height
//         );
//      } else {
//         fixDef.shape = new b2CircleShape(
//            Math.random() + 0.1 //radius
//         );
//      }
//      bodyDef.position.x = Math.random() * 10;
//      bodyDef.position.y = Math.random() * 10;
//      world.CreateBody(bodyDef).CreateFixture(fixDef);
//   }
  
  
  //create some objects

    world.SetContactListener(contactListener.default)

  //setup debug draw
    var debugDraw = new b2DebugDraw();

    var canvas = document.getElementById("canvas")
    var ctx = canvas.getContext("2d")
    debugDraw.SetSprite(ctx);
    debugDraw.SetDrawScale(worldDrawScale);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
    world.SetDebugDraw(debugDraw);

    // let goals = [new Goal(world, 'goal 1', 10, 10), new Goal(world, 'goal 2', 20, 20), new Goal(world, 'goal 3', 30, 20)]
    let goals = [new Goal(world, 'goal 1', 15, 15)]
    draw.default.createDraw(ctx, worldDrawScale)

    let car = new Car(world, 25, 5, 2, draw)
    // car.default.createCar(world, 20, 10, 2, draw)

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

    

    // document.addEventListener('keydown', (event) => {
    //   let code = event.key;
    //   if(code == 'r') //LEFT
    //     update()
    // });
  window.setInterval(update, 1000 / 60);

  let layers = []
  
  //update  
  function update() {

    let contact = contactListener.default.getBeginContact()

    if(contact) {
      console.log('fixA', contact.m_fixtureA.GetUserData(), 'fixB', contact.m_fixtureB.GetUserData())
      if ((contact.m_fixtureA.GetUserData() && contact.m_fixtureA.GetUserData().indexOf('goal') != -1 && (contact.m_fixtureB.GetUserData() == 'car' || contact.m_fixtureB.GetUserData() == 'wheel')) || ((contact.m_fixtureA.GetUserData() == 'car' || contact.m_fixtureA.GetUserData() == 'wheel') &&  contact.m_fixtureB.GetUserData() && contact.m_fixtureB.GetUserData().indexOf('goal') != -1)) {
        let remainingGoals = []
        goals.forEach((goal) => {
          if(contact.m_fixtureA.GetUserData() == goal.fixture.GetUserData() || contact.m_fixtureB.GetUserData() == goal.fixture.GetUserData())
          {
            world.DestroyBody(goal.body)
          } else {
            remainingGoals.push(goal)
          }
        })
        goals = remainingGoals
      }
    }

    // let backwardOrForward = 0, leftOrRight = 0

    // if (layers[2]) {
    //   let outputs = layers[2].getOutputs()
    //   car.update(goals, outputs[0], outputs[1])
    //   console.log('outputs', outputs)
    // } else {
    //   car.update(goals, 0, 0)
    // }
    car.update(goals, backwardOrForward, leftOrRight)

    let newLayers = []

    newLayers.push(new Layer(car.getCarInputsToFirstLayer()))
    newLayers.push(new Layer(null, 20, newLayers[0].neurons, layers[1] ? layers[1].getWeights() : null))
    // newLayers.push(new Layer(null, 60, newLayers[1].neurons, layers[2] ? layers[2].getWeights() : null))
    newLayers.push(new Layer(null, 2, newLayers[1].neurons, layers[2] ? layers[2].getWeights() : null))

    layers = newLayers

    // layers.forEach((layer, index) => {
    //   console.log('layer getOutputs', index, layer.getOutputs())
    //   console.log('************************************')
    // })

    world.Step(1 / 60, 10, 10);
    world.DrawDebugData();
    world.ClearForces();

    // console.log('************************************')

    car.draw()
  };


};


      
init();