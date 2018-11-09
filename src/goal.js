export class Goal {
    constructor(world, userData, x, y) {
        this.bodyDef = new Box2D.Dynamics.b2BodyDef;
        this.fixDef = new Box2D.Dynamics.b2FixtureDef;
        this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        this.fixDef.density = 1.0;
        this.fixDef.isSensor = true;
        this.fixDef.friction = 1.0;
        this.fixDef.restitution = 0.1;
        this.fixDef.userData = userData;

        this.position = new Box2D.Common.Math.b2Vec2(x,y)
        
        this.bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        this.fixDef.shape.SetAsBox(0.5, 0.5);
        this.bodyDef.position.Set(x, y);
        this.body = world.CreateBody(this.bodyDef)
        this.fixture = this.body.CreateFixture(this.fixDef)

        this.carDistance = null
        this.carAngle = null

        this.getBody = function() {
            // console.log('circle getBody', this.bodyDef)
            return this.fixture.GetBody()
        }

        this.getPosition = () => {
            return this.body.GetWorldCenter()
        }

        this.getFixture = function() {
            // console.log('circle getFixture', this.fixture)
            return this.fixture
        }

        this.setLinearVelocity = function(vector) {
            this.bodyDef.linearVelocity = vector
        }
    }
}