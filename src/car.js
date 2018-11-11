import { Sensors } from './sensors.js'

export class Car {
    constructor(world, x, y, scale, draw) {
        this.sensors = new Sensors(world, scale, draw)

        this.goals = []
        this.goalPoints = []
        this.path = []

        this.scale = null

        this.drawDebugger = draw
        this.bodyDef = new Box2D.Dynamics.b2BodyDef;
        this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
        this.bodyDef.position.x = x;
        this.bodyDef.position.y = y;

        this.fixDef = new Box2D.Dynamics.b2FixtureDef;
        this.fixDef.density = 30.0;
        this.fixDef.friction = 4.0/scale;
        this.fixDef.restitution = 0.1;
        this.fixDef.userData = "car";
        this.fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
        this.fixDef.shape.SetAsBox(.1*scale,0.3*scale);
        
        this.body = world.CreateBody(this.bodyDef)
        this.body.CreateFixture(this.fixDef);

        this.carPosition = this.body.GetWorldCenter()

        this.xx = this.body.GetWorldCenter().x;
        this.yy = this.body.GetWorldCenter().y;

        this.maxSteeringAngle = 1
        this.steeringAngle = 0
        this.STEER_SPEED = 1.0*scale;
        this.sf = false;
        this.sb = false;
        this.ENGINE_SPEED = 10*scale*scale;

        this.p1r= new Box2D.Common.Math.b2Vec2;
        this.p2r= new Box2D.Common.Math.b2Vec2;
        this.p3r= new Box2D.Common.Math.b2Vec2;
        this.p1l= new Box2D.Common.Math.b2Vec2;
        this.p2l= new Box2D.Common.Math.b2Vec2;
        this.p3l= new Box2D.Common.Math.b2Vec2;
    
        this.createWheel = (world, x, y, scale) => {
            this.scale = scale
            let bodyDef = new Box2D.Dynamics.b2BodyDef;
            bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
            bodyDef.position.x = x
            bodyDef.position.y = y
            let fixDef = new Box2D.Dynamics.b2FixtureDef;
            fixDef.density = 30;
            fixDef.friction = 40/scale;
            fixDef.restitution = 0.1;
            fixDef.userData = "wheel";
            fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
            fixDef.shape.SetAsBox(.04*scale,.08*scale);
            fixDef.isSensor = true;
            let wheel = world.CreateBody(bodyDef);
            wheel.CreateFixture(fixDef);
            return wheel;
        }

        this.createRevJoint = (world, body1, wheel, scale, limited) => {
            let revoluteJointDef = new Box2D.Dynamics.Joints.b2RevoluteJointDef;
            revoluteJointDef.Initialize(body1, wheel, wheel.GetWorldCenter());
            revoluteJointDef.motorSpeed = 0;
            revoluteJointDef.maxMotorTorque = 200*scale;
            revoluteJointDef.enableMotor = true;

            if (limited) {
                revoluteJointDef.enableLimit = true
                revoluteJointDef.lowerAngle = 0
                revoluteJointDef.upperAngle = 0
            }

            let revoluteJoint = world.CreateJoint(revoluteJointDef);
            return revoluteJoint;
    
        }

        this.control = (code, isDown) => {
            // console.log('car move', code);
            if(code == 'a' || code == 'ArrowLeft' ) //LEFT
                isDown ? this.setVelocitiesAndDirection(0, -1) : this.setVelocitiesAndDirection(0, 0)
            if(code == 'd' || code == 'ArrowRight') //RIGHT
                isDown ? this.setVelocitiesAndDirection(0, 1) : this.setVelocitiesAndDirection(0, 0)
            if(code == 'w' || code == 'ArrowUp') //FORWARD
                isDown ? this.setVelocitiesAndDirection(1, 0) : this.setVelocitiesAndDirection(0, 0)
            if(code == 's' || code == 'ArrowDown') //BACKWARD
                isDown ? this.setVelocitiesAndDirection(-1, 0) : this.setVelocitiesAndDirection(0, 0)
        }

        this.setVelocitiesAndDirection = (backwardOrForward, leftOrRight) => {
            this.steeringAngle = leftOrRight * this.maxSteeringAngle;
            if (backwardOrForward && backwardOrForward != 0)
                this.steer(backwardOrForward * -1)
        }

        this.move = () => {
            this.mspeed = this.steeringAngle - this.jointFrontLeft.GetJointAngle();
            this.jointFrontLeft.SetMotorSpeed(this.mspeed * this.STEER_SPEED);
            this.mspeed = this.steeringAngle - this.jointFrontRight.GetJointAngle();
            this.jointFrontRight.SetMotorSpeed(this.mspeed * this.STEER_SPEED);
            // console.log('move', 'mspeed', this.mspeed)
        }

        this.steer = (backwardOrForward) => {
            this.frontRightWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3r.x * backwardOrForward,this.p3r.y * backwardOrForward),this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
    
            this.frontLeftWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3l.x * backwardOrForward,this.p3l.y * backwardOrForward),this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
        }

        this.steerBackward = () => {
            this.frontRightWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3r.x,this.p3r.y),this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
    
            this.frontLeftWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(this.p3l.x,this.p3l.y),this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
        }

        this.steerForward = () => {
            this.frontRightWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(-this.p3r.x,-this.p3r.y),this.frontRightWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
    
            this.frontLeftWheel.ApplyForce(new Box2D.Common.Math.b2Vec2(-this.p3l.x,-this.p3l.y),this.frontLeftWheel.GetWorldPoint(new Box2D.Common.Math.b2Vec2(0,0)));
        }

        this.cancelVel = (wheel) => {
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
        }

        this.update = (backwardOrForward, leftOrRight) => {

            this.setVelocitiesAndDirection(backwardOrForward, leftOrRight)
            this.carPosition = this.body.GetWorldCenter()

            // this.path.push({x: this.carPosition.x, y: this.carPosition.y})

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
    
            this.sensors.update(this.carPosition, this.body.GetAngle())

            // console.log('linear velocity', this.body.GetLinearVelocity())
        }

        this.getSensorsDistances = () => {
            let laserImpactDistances = this.sensors.laserImpactDistances
            return Object.keys(laserImpactDistances).map((key) => {
                return laserImpactDistances[key]/40.0
            })
        }

        this.getCarInputsToFirstLayer = (goalPosition) => {
            let ret = this.getSensorsDistances()
            let goalAngleAndDistance = this.angleRelativePoint(goalPosition)
            ret.push(goalAngleAndDistance.angle / Math.PI)
            ret.push(goalAngleAndDistance.distance / 40)
            ret.push((this.getOrientation() / Math.PI))
            ret.push(this.body.GetLinearVelocity().x / 25)
            ret.push(this.body.GetLinearVelocity().y / 25)
            // console.log('getCarInputsToFirstLayer', ret, goalPosition)
            return ret
        }

        this.draw = () => {
            // this.sensors.drawLasers()
            this.drawGoalPoints()
            this.drawPath()
        }

        this.drawPath = () => {
            if (this.path && this.path.length > 0) {
                this.path.forEach((point) => {
                    this.drawDebugger.default.circle(point.x*this.scale,point.y*this.scale,1)
                })
            }
        }

        this.drawGoalPoints = () => {
            if (this.goalPoints && this.goalPoints.length > 0) {
                this.goalPoints.forEach((angleAndDistance) => {
                    let angle = angleAndDistance.angle + this.body.GetAngle() + Math.PI
                    
                    let x = this.carPosition.x - angleAndDistance.distance * Math.sin(angle)
                    let y = this.carPosition.y + angleAndDistance.distance * Math.cos(angle)

                    this.drawDebugger.default.line(this.carPosition.x, this.carPosition.y, x, y)
                    this.drawDebugger.default.circle(x,y,1)
                })
            }
        }

        this.getBody = () => {
            // console.log('circle getBody', this.bodyDef)
            return this.fixture.GetBody()
        }

        this.getFixture = () => {
            // console.log('circle getFixture', this.fixture)
            return this.fixture
        }

        this.getOrientation = () => {
            let angle = this.body.GetAngle() % (Math.PI * 2)

            if (angle > 0 && angle > Math.PI) {
                angle = angle - (Math.PI * 2)
            } else if(angle < 0 && angle < (Math.PI * -1)) {
                angle = angle + (Math.PI * 2)
            }

            return angle
        }

        this.angleRelativePoint = (point) => {

            let carPos = this.carPosition

            let aTv = carPos
            let aP = point
            let theta = this.body.GetAngle()

            let rotationMatrixT = [[Math.cos(theta), Math.sin(theta)],[-1*Math.sin(theta), Math.cos(theta)]] // it is already inverted

            let vectorDiff = {x: aP.x - aTv.x, y: aP.y - aTv.y} // aP (transposed) - aTv

            let goalFromCarPerspective = {x: (rotationMatrixT[0][0]*vectorDiff.x)+(rotationMatrixT[0][1]*vectorDiff.y), y: (rotationMatrixT[1][0]*vectorDiff.x)+(rotationMatrixT[1][1]*vectorDiff.y)}

            let returnPoint = {}
            
            returnPoint.distance = Math.sqrt(Math.pow((goalFromCarPerspective.x), 2) + Math.pow((goalFromCarPerspective.y), 2))

            let angle = (((Math.atan2(-1 * goalFromCarPerspective.y, goalFromCarPerspective.x) - (Math.PI / 2)) * -1) + 2 * Math.PI) % (2 * Math.PI)

            if (angle > Math.PI) {
                angle = angle - (Math.PI * 2)
            }

            // console.log('angle', angle)

            returnPoint.angle = angle

            

            // console.log('goal angle', angle % (Math.PI*2))

            return returnPoint
        }

        this.frontRightWheel = this.createWheel(world, this.xx+(0.1*scale), this.yy-(0.2*scale), scale)
        this.frontLeftWheel = this.createWheel(world, this.xx-(0.1*scale), this.yy-(0.2*scale), scale)
        this.rearRightWheel = this.createWheel(world, this.xx+(0.1*scale), this.yy+(0.2*scale), scale)
        this.rearLeftWheel = this.createWheel(world, this.xx-(0.1*scale), this.yy+(0.2*scale), scale)

        this.jointFrontRight = this.createRevJoint(world, this.body, this.frontRightWheel, scale)
        this.jointFrontLeft = this.createRevJoint(world, this.body, this.frontLeftWheel, scale)
        this.jointRearRight = this.createRevJoint(world, this.body, this.rearRightWheel, scale, true)
        this.jointRearLeft = this.createRevJoint(world, this.body, this.rearLeftWheel, scale, true)
    }
}