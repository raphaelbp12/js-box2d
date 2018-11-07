const goal = {
    fixDef: null,
    bodyDef: null,
    fixture: null,
    createGoal: function(world) {
        this.bodyDef = new Box2D.Dynamics.b2BodyDef;
        this.fixDef = new Box2D.Dynamics.b2FixtureDef;
        this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        this.fixDef.density = 1.0;
        this.fixDef.isSensor = true;
        this.fixDef.friction = 1.0;
        this.fixDef.restitution = 0.1;
        
        this.bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;
        this.fixDef.shape.SetAsBox(1, 14);
        this.bodyDef.position.Set((1280 / 30), 13);
        this.fixture = world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
    },
    getBody: function() {
        // console.log('circle getBody', this.bodyDef)
        return this.fixture.GetBody()
    },
    getFixture: function() {
        // console.log('circle getFixture', this.fixture)
        return this.fixture
    },
    setLinearVelocity: function(vector) {
        this.bodyDef.linearVelocity = vector
    }
}

export default goal