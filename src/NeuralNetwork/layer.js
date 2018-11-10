import { Neuron } from './neuron.js'

export class Layer {
    constructor(inputs, length, neuronsPreviousLayer, receivedWeights) {
        this.activationValue = 0
        this.neurons = []

        this.getInputs = (inputs) => {
            // console.log('getInputs', inputs)
            inputs.forEach((input) => {
                this.neurons.push(new Neuron(input, 0))
            })
        }

        this.generateLayer = (length, neuronsPreviousLayer, receivedWeights) => {
            for( let i = 0; i < length; i++) {
                let newNeuron = null
                if (receivedWeights) {
                    newNeuron = new Neuron(null, neuronsPreviousLayer, receivedWeights[i])
                } else {
                    newNeuron = new Neuron(null, neuronsPreviousLayer)
                }
                this.neurons.push(newNeuron)
            }
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

        if (inputs) {
            this.getInputs(inputs)
        } else {
            this.generateLayer(length, neuronsPreviousLayer, receivedWeights)
        }
    }
}