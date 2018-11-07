const car = {
    fixDef: null,
    bodyDef: null,
    fixture: null,
    createCar: function(world, x, y) {
        this.bodyDef = new Box2D.Dynamics.b2BodyDef;
        this.fixDef = new Box2D.Dynamics.b2FixtureDef;
        this.fixDef.density = 1.0;
        this.fixDef.friction = 1.0;
        this.fixDef.restitution = 1;
        
        this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        this.fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape( 1 );
        this.bodyDef.position.x = x;
        this.bodyDef.position.y = y;
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

export default car