# js-box2d-boilerplate
A boilerplate for box2d on JS

Based on: https://github.com/hecht-software/box2dweb

Box2d Docs: http://www.box2dflash.org/docs/2.1a/reference/

## Running

* Install nodeJS from https://nodejs.org/en/

* Install all packages:  `npm i`

* Run app:  `npm run dev`

* Access http://localhost:8080/ on your Browser

## Changes in Box2d Source

* RayCast now receives a fourth argument, that is a payload passed to callback. So, the callback passed to RayCast must receive one more argument.

`b2World.prototype.RayCast = function (callback, point1, point2, payload)`

`callback(fixture, point, output.normal, fraction, payload)`
