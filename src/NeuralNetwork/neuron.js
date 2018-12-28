import { GenericWebWorker } from './../GenericWebWorker.js'

function calc(neuronValues, weights) {
    let value = 0
    values.forEach((neuronValue) => {
        value = value + neuronValue*weights[index]
    })
    return value
}

export class Neuron {
    constructor(input, neuronsPreviousLayer, receivedWeights) {
        return new Promise((resolve, reject) => {
            this.activationValue = 0
            this.weights = []

            this.generateWeights = (weightsLength, receivedWeights) => {
                return new Promise((resolve, reject) => {
                    if (receivedWeights) {
                        this.weights = receivedWeights
                        resolve(receivedWeights)
                    } else {
                        let weights = []
                        for( let i = 0; i < neuronsPreviousLayer.length; i++) {
                            let random = (Math.random() * 2) - 1
                            weights.push(random/neuronsPreviousLayer.length)
                        }
                        resolve(weights)
                    }
                })
            }

            this.calcActivationValue = (input, neuronsPreviousLayer) => {
                return new Promise((resolve, reject) => {
                    if (input != null) {
                        resolve(input)
                    } else {
                        let value = 0
                        // console.log('neuronsPreviousLayer', neuronsPreviousLayer)
                        neuronsPreviousLayer.forEach((neuron, index) => {
                            // console.log('activation neuron', neuron)
                            value = value + neuron.activationValue*this.weights[index]
                        });
                        resolve(value)
                    }
                })
            }

            this.generateWeights(neuronsPreviousLayer.length, receivedWeights)
            .then((weights) => {
                this.weights = weights
                this.calcActivationValue(input, neuronsPreviousLayer)
                .then((value) => {
                    this.activationValue = value
                    resolve(this)
                })
            })
        })
    }
}