import { Neuron } from './neuron.js'

export class Layer {
    constructor(inputs, length, neuronsPreviousLayer, receivedWeights) {
        this.neurons = []

        this.getInputs = (inputs) => {
            let promises = []
            inputs.forEach((input) => {
                promises.push(new Neuron(input, 0))
            })
            return new Promise((resolve, reject) => {
                // console.log('getInputs', inputs)
                Promise.all(promises)
                .then((neurons) => {
                    neurons.forEach((neuron) => {
                        // console.log('input neuron', neuron)
                        this.neurons.push(neuron)
                    })
                    resolve()
                })
            })
        }

        this.generateLayer = (length, neuronsPreviousLayer, receivedWeights) => {
            let promises = []

            for( let i = 0; i < length; i++) {
                if (receivedWeights) {
                    promises.push(new Neuron(null, neuronsPreviousLayer, receivedWeights[i]))
                } else {
                    promises.push(new Neuron(null, neuronsPreviousLayer))
                }
            }

            return new Promise((resolve, reject) => {
                // console.log('getInputs', inputs)
                Promise.all(promises)
                .then((neurons) => {
                    neurons.forEach((neuron) => {
                        this.neurons.push(neuron)
                    })
                    resolve()
                })
            })
        }

        this.getWeights = () => {
            return this.neurons.map((neuron) => {
                return neuron.weights
            })
        }

        this.getOutputs = () => {
            return this.neurons.map((neuron) => {
                return neuron.activationValue
            })
        }

        return new Promise((resolve, reject) => {
            if (inputs) {
                this.getInputs(inputs).then(() => { resolve(this) })
            } else {
                this.generateLayer(length, neuronsPreviousLayer, receivedWeights).then(() => { resolve(this) })
            }
        })
    }
}