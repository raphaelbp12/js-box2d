export class Sensors {
    constructor(world, scale, draw) {
        this.drawDebugger = draw
        this.world = world
        this.scale = scale
        //this.laserDegrees= [0]
        this.laserDegrees = [0, 1/8 * Math.PI, 2/8 * Math.PI, 3/8 * Math.PI, 4/8* Math.PI, 5/8 * Math.PI, 6/8 * Math.PI, 7/8 * Math.PI, 8/8 *Math.PI, 9/8 * Math.PI, 10/8 * Math.PI, 11/8 * Math.PI, 12/8 *Math.PI, 13/8 * Math.PI, 14/8 * Math.PI, 15/8 * Math.PI]
        this.laserPoints= []
        this.laserRadius= 5
        this.laserImpactPoints= {}
        this.laserImpactDistances= {}
        this.carCenter= null
        this.carOrientation= null
        this.rayCallback = function(fixture, point, normalVector, fraction, payload){
            if (fixture.GetUserData() != 'car' && fixture.GetUserData() != 'wheel' && !fixture.IsSensor()) {
                // console.log('rayCallback', point, fixture)
                if (!payload.that.laserImpactPoints[payload.degrees])
                {
                    let distance = Math.sqrt(Math.pow((point.x - payload.that.carCenter.x), 2) + Math.pow((point.y - payload.that.carCenter.y), 2))
                    payload.that.laserImpactPoints[payload.degrees] = point
                    payload.that.laserImpactDistances[payload.degrees] = distance
                }
            }
        },
        this.laser = function() {
            if (this.laserDegrees && this.laserDegrees.length > 0) {
                this.laserPoints = []
                this.laserImpactPoints = {}
                this.laserImpactDistances = {}
                this.laserDegrees.forEach((laserDegree) => {
                    let degrees = laserDegree + this.carOrientation + Math.PI
                    // console.log(this.carOrientation, 'degrees', degrees, 'sin', Math.sin(degrees), 'cos', Math.cos(degrees))
                    let laserPointX = this.carCenter.x - (this.laserRadius * Math.sin(degrees))
                    let laserPointY = this.carCenter.y + (this.laserRadius * Math.cos(degrees))

                    let laserPoint = new Box2D.Common.Math.b2Vec2(laserPointX,laserPointY)

                    this.laserPoints.push(laserPoint)

                    let that = this
                    this.world.RayCast(this.rayCallback, this.carCenter, laserPoint, {that: that, degrees: laserDegree})
                })
            }
        },
        this.update = function(carCenter, carOrientation) {
            this.carCenter = carCenter
            this.carOrientation = carOrientation
            this.laser()
        },
        this.drawLasers = function() {
            // console.log('drawLasers', this.carOrientation)
            if (this.laserPoints && this.laserPoints.length > 0) {
                this.laserPoints.forEach((laserPoint) => {
                    this.drawDebugger.default.line(this.carCenter.x, this.carCenter.y, laserPoint.x, laserPoint.y)
                    this.drawDebugger.default.circle(laserPoint.x,laserPoint.y,1)
                })
            }
            if (this.laserImpactPoints && Object.keys(this.laserImpactPoints).length > 0) {
                Object.keys(this.laserImpactPoints).forEach((key) => {
                    this.drawDebugger.default.circle(this.laserImpactPoints[key].x,this.laserImpactPoints[key].y,3)
                })
            }
            if (this.laserImpactDistances && Object.keys(this.laserImpactDistances).length > 0) {
                console.log('distances', this.laserImpactDistances)
            }
        }
    }
}