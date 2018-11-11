export class WorldDrawer {
    constructor(worldDrawScale, canvas) {
        this.world = new Box2D.Dynamics.b2World(
            new Box2D.Common.Math.b2Vec2(0, 0)    //gravity
            ,true                 //allow sleep
        );

        this.allBodyCars = []
        this.worldDrawScale = worldDrawScale
        this.canvas = canvas
        this.ctx = this.canvas.getContext("2d")
        this.debugDraw = null

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

        this.drawAllWorlds = (allWorlds) => {
            this.allBodyCars.forEach((carBody) => {
                this.world.DestroyBody(carBody)
            })
            allWorlds.forEach(world => {
                let carBodyDef = world.car.body.GetDefinition()
                let carFixDef = world.car.fixDef
                carBodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody
                carFixDef.isSensor = true;
                if (world.gameover)
                    carBodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody
                let carBody = this.world.CreateBody(carBodyDef)
                carBody.CreateFixture(carFixDef);

                this.allBodyCars.push(carBody)
            });
        }

        this.update = () => {
            this.world.DrawDebugData();
        }

    }
}