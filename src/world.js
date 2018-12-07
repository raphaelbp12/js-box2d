import { Car } from './car.js'
import { Goal } from './goal.js'
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
        // this.car = new Car(this.world, 25, 5, 2, draw, this.goals)

        this.populationSize = 1
        this.cars = []
        
        for(let i = 0; i < this.populationSize; i++) {
            this.cars.push(new Car(this.world, 25, 5, 2, draw, this.goals))
        }

        this.gameover = false;

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
            if (!contacted)
                contacted = this.verifyContact(contact, 'wheel', 'wall')

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

        this.drawWorld = () => {
            this.world.DrawDebugData();
            // this.car.draw()
        }

        this.step = (draw) => {
            this.world.Step(1 / 60, 10, 10);
            this.world.ClearForces();

            if (draw)
                this.drawWorld()

        }

        this.update = (draw, velocities) => {
            return new Promise((resolve, reject) => {
                this.ticks = this.ticks + 1
                let contact = contactListener.default.getBeginContact()
                this.verifyContactToGoal(contact)
                this.verifyContactToWall(contact)
    
                let gameoverCounter = 0
                this.cars.forEach((car) => {
                    if(car.calcGameOver(this.ticks)) {
                        gameoverCounter++
                    }
                })

                if (gameoverCounter == this.cars.length) {
                    this.gameover = true
                }
    
                if (velocities) {
                    this.cars.forEach((car) => {
                        car.update(velocities.backwardOrForward, velocities.leftOrRight)
                    })
                    // this.car.update(velocities.backwardOrForward, velocities.leftOrRight)
                    this.step(draw)
                    resolve(this)
                } else {
                    let promises = []
                    
                    this.cars.forEach((car) => {
                        if(!car.gameover) {
                            promises.push(car.updateWithNeuralNetwork({backwardOrForward: 1, leftOrRight: 1}))
                            // console.log('world update called', index)
                        }
                    })

                    Promise.all(promises)
                    .then((carsResolved) => {
                        this.step(draw)
                        resolve(this)
                    })
                }
            })
        }
    }
}