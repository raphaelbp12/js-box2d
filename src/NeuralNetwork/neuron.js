export class Neuron {
    constructor(input, neuronsPreviousLayer, receivedWeights) {
        this.activationValue = 0
        this.weights = []

        this.generateWeights = (weightsLength, receivedWeights) => {
            if (receivedWeights) {
                this.weights = receivedWeights
            } else {
                for( let i = 0; i < neuronsPreviousLayer.length; i++) {
                    let random = (Math.random() * 2) - 1
                    this.weights.push(random/neuronsPreviousLayer.length)
                }
            }
        }

        this.calcActivationValue = (input, neuronsPreviousLayer) => {
            if (input != null) {
                this.activationValue = input
            } else {
                let value = 0
                neuronsPreviousLayer.forEach((neuron, index) => {
                    value = value + neuron.activationValue*this.weights[index]
                });
                this.activationValue = value
                return value
            }
        }

        this.generateWeights(neuronsPreviousLayer.length, receivedWeights)
        this.calcActivationValue(input, neuronsPreviousLayer)
    }
}