const car = {
    fixDef: null,
    bodyDef: null,
    fixture: null,
    car: null,
    xx: null,
    yy: null,
    frontRightWheel: null,
    frontLeftWheel: null,
    rearRightWheel: null,
    rearLeftWheel: null,
    jointFrontRight: null,
    jointFrontLeft: null,
    jointRearRight: null,
    jointRearLeft: null,
    maxSteeringAngle: null,
    steeringAngle: null,
    STEER_SPEED: null,
    mspeed: null,
    sf: null,
    sb: null,
    ENGINE_SPEED: null,
    p1r: new Box2D.Common.Math.b2Vec2,
    p2r: new Box2D.Common.Math.b2Vec2,
    p3r: new Box2D.Common.Math.b2Vec2,
    p1l: new Box2D.Common.Math.b2Vec2,
    p2l: new Box2D.Common.Math.b2Vec2,
    p3l: new Box2D.Common.Math.b2Vec2,
    createCar: function(world, x, y) {
        this.bodyDef = new Box2D.Dynamics.b2BodyDef;
        this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        this.bodyDef.position.x = x;
        this.bodyDef.position.y = y;

        this.fixDef = new Box2D.Dynamics.b2FixtureDef;
        this.fixDef.density = 30.0;
        this.fixDef.friction = 0.8;
        this.fixDef.restitution = 0.1;
        this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        this.fixDef.shape.SetAsBox(.5,1.5);
        
        this.car = world.CreateBody(this.bodyDef)
        this.car.CreateFixture(this.fixDef);

        this.xx = this.car.GetWorldCenter().x;
        this.yy = this.car.GetWorldCenter().y;

        this.frontRightWheel = this.createWheel(world, this.xx+0.5, this.yy-1)
        this.frontLeftWheel = this.createWheel(world, this.xx-0.5, this.yy-1)
        this.rearRightWheel = this.createWheel(world, this.xx+0.5, this.yy+1)
        this.rearLeftWheel = this.createWheel(world, this.xx-0.5, this.yy+1)

        this.jointFrontRight = this.createRevJoint(world, this.car, this.frontRightWheel)
        this.jointFrontLeft = this.createRevJoint(world, this.car, this.frontLeftWheel)
        this.jointRearRight = this.createRevJoint(world, this.car, this.rearRightWheel)
        this.jointRearLeft = this.createRevJoint(world, this.car, this.rearLeftWheel)

        this.maxSteeringAngle = 1
        this.steeringAngle = 0
        this.STEER_SPEED = 3;
        this.sf = false;
        this.sb = false;
        this.ENGINE_SPEED = 300;
    },
    createWheel: function(world, x, y) {
        let bodyDef = new Box2D.Dynamics.b2BodyDef;
        bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        bodyDef.position.x = x
        bodyDef.position.y = y
        let fixDef = new Box2D.Dynamics.b2FixtureDef;
        fixDef.density = 30;
        fixDef.friction = 10;
        fixDef.restitution = 0.1;
        fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        fixDef.shape.SetAsBox(.2,.4);
        fixDef.isSensor = true;
        let wheel = world.CreateBody(bodyDef);
        wheel.CreateFixture(fixDef);
        return wheel;
    },
    createRevJoint: function(world, body1, wheel) {
        let revoluteJointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
        revoluteJointDef.Initialize(body1, wheel, wheel.GetWorldCenter());
        revoluteJointDef.motorSpeed = 0;
        revoluteJointDef.maxMotorTorque = 1000;
        revoluteJointDef.enableMotor = true;
        let revoluteJoint = world.CreateJoint(revoluteJointDef);
        return revoluteJoint;

    },
    control: function(code, isDown) {
        console.log('car move', code);

        if(code == 'a' || code == 'ArrowLeft' ) //LEFT
            this.steeringAngle = isDown ? -this.maxSteeringAngle : 0;
        if(code == 'd' || code == 'ArrowRight') //RIGHT
            this.steeringAngle = isDown ? this.maxSteeringAngle : 0;
        if(code == 'w' || code == 'ArrowUp') //FORWARD
            this.sb = isDown;
        if(code == 's' || code == 'ArrowDown') //BACKWARD
            this.sf = isDown;
    },
    move: function() {
        this.mspeed = this.steeringAngle - this.jointFrontLeft.GetJointAngle();
        this.jointFrontLeft.SetMotorSpeed(this.mspeed * this.STEER_SPEED);
        this.mspeed = this.steeringAngle - this.jointFrontRight.GetJointAngle();
        this.jointFrontRight.SetMotorSpeed(this.mspeed * this.STEER_SPEED);
    },
    steerForward: function() {
        this.frontRightWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3r.x,this.p3r.y),this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));

        this.frontLeftWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3l.x,this.p3l.y),this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
    },
    steerBackward: function() {
        this.frontRightWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(-this.p3r.x,-this.p3r.y),this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));

        this.frontLeftWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(-this.p3l.x,-this.p3l.y),this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
    },
    cancelVel: function(wheel) {
        var aaaa=new Box2D.Common.Math.b2Vec2();
        var bbbb=new Box2D.Common.Math.b2Vec2();
        var newlocal=new Box2D.Common.Math.b2Vec2();
        var newworld=new Box2D.Common.Math.b2Vec2();
        aaaa=wheel.GetLinearVelocityFromLocalPoint(new Box2D.Common.Math.b2Vec2(0,0));
        bbbb=wheel.GetLocalVector(aaaa);
        newlocal.x = -bbbb.x;
        newlocal.y = bbbb.y;
        newworld = wheel.GetWorldVector(newlocal);
        wheel.SetLinearVelocity(newworld);
    },
    update: function() {
        this.move()
        this.cancelVel(this.frontRightWheel);
        this.cancelVel(this.frontLeftWheel);
        this.cancelVel(this.rearRightWheel);
        this.cancelVel(this.rearLeftWheel);
        
        this.p1r = this.frontRightWheel.GetWorldCenter();
        this.p2r = this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,1));
        this.p3r.x = (this.p2r.x - this.p1r.x)*this.ENGINE_SPEED;
        this.p3r.y = (this.p2r.y - this.p1r.y)*this.ENGINE_SPEED;
                
        this.p1l = this.frontLeftWheel.GetWorldCenter();
        this.p2l = this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,1));
        this.p3l.x = (this.p2l.x - this.p1l.x)*this.ENGINE_SPEED;
        this.p3l.y = (this.p2l.y - this.p1l.y)*this.ENGINE_SPEED;
                    
        if(this.sf)  this.steerForward();
        if(this.sb)  this.steerBackward();
    },
    getBody: function() {
        // console.log('circle getBody', this.bodyDef)
        return this.fixture.GetBody()
    },
    getFixture: function() {
        // console.log('circle getFixture', this.fixture)
        return this.fixture
    },
    setVelocity: function(linearVel, angularVel) {
        this.bodyDef.linearVelocity = vector
    }
}

export default car