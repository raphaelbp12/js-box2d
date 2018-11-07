const circle = {
    createCircle: function(world) {
        var bodyDef = new Box2D.Dynamics.b2BodyDef;
        var fixDef = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1.0;
        fixDef.restitution = 0.1;
        
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape( 1 );
        bodyDef.position.x = 10;
        bodyDef.position.y = 10;
        world.CreateBody(bodyDef).CreateFixture(fixDef);
    }
}

export default circle