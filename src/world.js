import { Car } from './car.js'
import { Goal } from './goal.js'
import { Layer } from './NeuralNetwork/layer.js'
import contactListener from './contactListener.js'
import draw from './draw.js'

export class World {
    constructor(gravityX, gravityY, worldDrawScale, canvas) {
        this.world = new Box2D.Dynamics.b2World(
            new Box2D.Common.Math.b2Vec2(gravityX, gravityY)    //gravity
            ,true                 //allow sleep
        );

        this.ticks = 0
        this.worldDrawScale = worldDrawScale
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")
        this.debugDraw = null
        this.world.SetContactListener(contactListener.default)

        // this.goals = [new Goal(world, 'goal 1', 10, 10), new Goal(world, 'goal 2', 20, 20), new Goal(world, 'goal 3', 30, 20)]
        this.goals = [new Goal(this.world, 'goal 1', 15, 15)]
        draw.default.createDraw(this.ctx, this.worldDrawScale)
        this.car = new Car(this.world, 25, 5, 2, draw)
        this.carPositions = [{x: this.car.xx, y: this.car.yy}]
        this.totalRunnedDistance = 0
        this.numberContactWall = 0
        this.ticksOnCrashToWall = []
        this.ticksOnGetObjective = []

        this.layers = []

        this.backwardOrForward = 0
        this.leftOrRight = 0

        this.gameover = false
        this.lastTotalDistance = 0

        this.calcTotalDistance = () => {
            this.lastTotalDistance = this.totalRunnedDistance
            if(this.carPositions && this.carPositions.length > 1) {
                // console.log('entrou no if')
                let index = this.ticks / 60
                if ((typeof index==='number' && (index%1)===0) && index > 1) {
                    let runnedDistance = Math.sqrt(Math.pow((this.carPositions[index-1].x - this.carPositions[index].x), 2) + Math.pow((this.carPositions[index-1].y - this.carPositions[index].y), 2))
                    // console.log('runnedDistance', runnedDistance, 'index', index, this.carPositions[index-1], this.carPositions[index])
                    this.totalRunnedDistance = this.totalRunnedDistance + runnedDistance                    
                }
            }
            console.log('totalDistance', this.totalRunnedDistance, this.ticks)
            return this.totalRunnedDistance
        }

        this.registerCarPositions = () => {
            if  (this.ticks % 60 == 0) {
                this.carPositions.push({x: this.car.carPosition.x, y: this.car.carPosition.y})
                // console.log('this.carPositions', this.carPositions)
                this.calcTotalDistance()
            }
        }

        this.initDebugDraw = () => {
            let b2DebugDraw = Box2D.Dynamics.b2DebugDraw
            this.debugDraw = new b2DebugDraw();

            this.debugDraw.SetSprite(this.ctx);
            this.debugDraw.SetDrawScale(this.worldDrawScale);
            this.debugDraw.SetFillAlpha(0.5);
            this.debugDraw.SetLineThickness(1.0);
            this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_controllerBit);
            this.world.SetDebugDraw(this.debugDraw);
        }

        this.initDebugDraw()

        console.log('world created')

        this.createBedrockWalls = () => {
  
            let fixDef = new Box2D.Dynamics.b2FixtureDef;
            fixDef.density = 1.0;
            fixDef.friction = 1.0;
            fixDef.restitution = 0.1;
  
            let b2Body = Box2D.Dynamics.b2Body
            let b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape

            let bodyDef = new Box2D.Dynamics.b2BodyDef;

            bodyDef.type = b2Body.b2_staticBody;
            fixDef.shape = new b2PolygonShape;
            fixDef.userData = "wall";
            fixDef.shape.SetAsBox(40, 2);
            bodyDef.position.Set(10, 720 / this.worldDrawScale + 1.8);
            this.world.CreateBody(bodyDef).CreateFixture(fixDef);
            bodyDef.position.Set(10, -1.8);
            this.world.CreateBody(bodyDef).CreateFixture(fixDef);
            fixDef.shape.SetAsBox(2, 14);
            bodyDef.position.Set(-1.8, 13);
            this.world.CreateBody(bodyDef).CreateFixture(fixDef);
            bodyDef.position.Set(1280 / this.worldDrawScale + 1.8, 13);
            this.world.CreateBody(bodyDef).CreateFixture(fixDef);

        }

        this.createBedrockWalls()

        this.verifyContactToGoal = (contact) => {
            let contacted = this.verifyContact(contact, 'car', 'goal')
            if (!contacted)
                contacted = this.verifyContact(contact, 'wheel', 'goal')

            // console.log('verifyContactToGoal', contacted)
            if(contacted) {
                let remainingGoals = []
                this.goals.forEach((goal) => {
                  if(contact.m_fixtureA.GetUserData() == goal.fixture.GetUserData() || contact.m_fixtureB.GetUserData() == goal.fixture.GetUserData())
                  {
                    this.ticksOnGetObjective.push(this.ticks)
                    this.world.DestroyBody(goal.body)
                  } else {
                    remainingGoals.push(goal)
                  }
                })
                this.goals = remainingGoals
            }
        }

        this.verifyContactToWall = (contact) => {
            let contacted = this.verifyContact(contact, 'car', 'wall')

            if(contacted) {
                if(this.ticksOnCrashToWall && this.ticksOnCrashToWall.length > 0) {
                    let length = this.ticksOnCrashToWall.length
                    if ((this.ticks - this.ticksOnCrashToWall[length - 1]) > 30) {
                        this.ticksOnCrashToWall.push(this.ticks)
                    }
                } else {
                    this.ticksOnCrashToWall = [this.ticks]
                }
                console.log('crashed to wall', this.ticksOnCrashToWall)
            }
        }

        this.verifyContact = (contact, fixExactName, fixPartialName) => {

            if(contact) {
              console.log('fixA', contact.m_fixtureA.GetUserData(), 'fixB', contact.m_fixtureB.GetUserData())
              if ((contact.m_fixtureA.GetUserData() && contact.m_fixtureA.GetUserData().indexOf(fixPartialName) != -1 && (contact.m_fixtureB.GetUserData() == fixExactName)) || ((contact.m_fixtureA.GetUserData() == fixExactName) &&  contact.m_fixtureB.GetUserData() && contact.m_fixtureB.GetUserData().indexOf(fixPartialName) != -1)) {
                  return true
              }
            }
            return false
        }

        this.calcGameOver = () => {

            let maxSeconds = 5

            if (this.goals.length == 0)
                this.gameover = true
            if (this.ticksOnCrashToWall.length > 0)
                this.gameover = true
            if (this.totalRunnedDistance < 0.6 && this.ticks > 60*maxSeconds)
                this.gameover = true

            if(this.ticks > 3000)
                this.gameover = true
                
            let index = this.ticks / 60
            if ((typeof index==='number' && (index%1)===0) && index > 1) {
                if (this.totalRunnedDistance - this.lastTotalDistance < 0.01 && this.ticks > 60*maxSeconds)
                    this.gameover = true

                if (this.totalRunnedDistance/this.ticks !=0 && this.totalRunnedDistance/this.ticks < 0.002 && this.ticks > 60*maxSeconds)
                    this.gameover = true

                console.log('vel media', this.totalRunnedDistance/this.ticks)
            }
        }

        this.neuralNetwork = () => {
            return new Promise((resolve, reject) => {
                // console.log('neuralNetworks initiated')
                // console.log('this.car.getSensorsDistances()', this.car.getSensorsDistances())
                if (!this.car.getSensorsDistances() || this.car.getSensorsDistances().length != 16) {
                    this.backwardOrForward = 0
                    this.leftOrRight = 0
                    resolve()
                    return false
                }

                let newLayers = []
            
                let firstGoal = {angle: 0, distance: 0}
            
                if (this.goals && this.goals.length > 0) {
                firstGoal = this.goals[0].getPosition()
                }
            
                new Layer(this.car.getCarInputsToFirstLayer(firstGoal))
                .then((layer) => {
                    newLayers.push(layer)
                    new Layer(null, 21, newLayers[0].neurons, this.layers[1] ? this.layers[1].getWeights() : null)
                    .then((layer) => {
                        newLayers.push(layer)
                        new Layer(null, 2, newLayers[1].neurons, this.layers[2] ? this.layers[2].getWeights() : null)
                        .then((layer) => {
                            newLayers.push(layer)

                            if (this.layers[2]) {
                            let outputs = this.layers[2].getOutputs()
                            this.backwardOrForward = outputs[0]
                            this.leftOrRight = outputs[1]
                            //   console.log('outputs', outputs)
                            } else {
                                this.backwardOrForward = 0
                                this.leftOrRight = 0
                            }

                            this.layers = newLayers
                            resolve()
                        })
                    })
                })
                
                
                // newLayers.push(new Layer(this.car.getCarInputsToFirstLayer(firstGoal)))
                // newLayers.push(new Layer(null, 21, newLayers[0].neurons, this.layers[1] ? this.layers[1].getWeights() : null))
                // newLayers.push(new Layer(null, 60, newLayers[1].neurons, this.layers[2] ? this.layers[2].getWeights() : null))
                // newLayers.push(new Layer(null, 2, newLayers[1].neurons, this.layers[2] ? this.layers[2].getWeights() : null))
            
            
                // this.layers.forEach((layer, index) => {
                //   console.log('layer getOutputs', index, layer.getOutputs())
                //   console.log('************************************')
                // })
                // console.log('neuralNetworks ended')
            })
            
        }

        this.drawWorld = () => {
            this.world.DrawDebugData();
            // this.car.draw()
        }

        this.step = (draw) => {
            this.world.Step(1 / 60, 10, 10);
            this.world.ClearForces();

            this.registerCarPositions()

            if (draw)
                this.drawWorld()

        }

        this.update = (draw, velocities) => {
            return new Promise((resolve, reject) => {
                this.ticks = this.ticks + 1
                let contact = contactListener.default.getBeginContact()
                this.verifyContactToGoal(contact)
                this.verifyContactToWall(contact)
    
                this.calcGameOver()
    
                if (velocities) {
                    this.car.update(velocities.backwardOrForward, velocities.leftOrRight)
                    this.step(draw)
                    resolve(this)
                } else {
                    this.neuralNetwork().then(() => {
                        this.car.update(this.backwardOrForward, this.leftOrRight)
                        this.step(draw)
                        resolve(this)
                    })
                }
            })
        }
    }
}