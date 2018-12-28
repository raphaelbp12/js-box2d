/**
* GenericWebWorker v2.0
* 
* A Generic Javascript WebWorker that allows the user to execute and pass functions
* Is Fileless, for what the user does not need a file.js to request
*
* @author, Edgar Fernando Carvajal Ulloa <efcu93@gmail.com>, <efcarvaj@espol.edu.ec>
* {@link https://github.com/fercarvo/GenericWebWorker}
*/
export class GenericWebWorker {
    /**
    * @param {any} data, Any kind of arguments that will be used in the callback, functions too
    */
    constructor(...data) {
        // console.log('GenericWebWorker created')
        //The arguments that will be passed to the callback
        this.args = data.map(a => (typeof a == 'function') ? {type:'fn', fn:a.toString()} : a)
    }

    //@param {function} cb, To be executed, the params must be the same number of passed in the constructor 
    async exec(cb) {
        // console.log('GenericWebWorker execing', cb, window)
        var wk_string = this.worker.toString();
        wk_string = wk_string.substring(wk_string.indexOf('{') + 1, wk_string.lastIndexOf('}'));
        // console.log('wk_string', wk_string)
        var wk_link = window.URL.createObjectURL( new Blob([ wk_string ]) );
        // console.log('wk_link', wk_link)
        var wk = new Worker(wk_link);

        // console.log('this.args', this.args)
        let objStr = JSON.stringify(this.args)
        // console.log('objStr', objStr)
        let obj = JSON.parse(objStr);
        // console.log('obj', obj)
        wk.postMessage({ callback: cb.toString(), args: obj });
 
        var result = await new Promise((next, error) => {
            wk.onmessage = e => (e.data && e.data.error) ? error(e.data.error) : next(e.data);
            wk.onerror = e => error(e.message);
        })

        wk.terminate(); window.URL.revokeObjectURL(wk_link);
        return result
    }

    worker() {
        onmessage = async function (e) {
            // console.log('onmessage', e)
            try {         
                // console.log('GenericWebWorker onmessage')       
                var cb = new Function(`return ${e.data.callback}`)();
                var args = e.data.args.map(p => (p.type == 'fn') ? new Function(`return ${p.fn}`)() : p);

                try {
                    var result = await cb.apply(this, args); //If it is a promise or async function
                    return postMessage(result)

                } catch (e) { throw new Error(`CallbackError: ${e}`) }
            } catch (e) { postMessage({error: e.message}) }
        }
    }
}