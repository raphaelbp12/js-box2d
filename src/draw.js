const draw = {
    ctx: null,
    scale: null,
    createDraw: function(ctx, scale) {
        this.ctx = ctx
        this.scale = scale
    },
    circle: function(x, y, radius){
        this.ctx.beginPath();
        this.ctx.arc(x*this.scale, y*this.scale, radius, 0, 2 * Math.PI, true);
        this.ctx.stroke();
    },
    line: function(x1, y1, x2, y2) {
        this.ctx.moveTo(x1*this.scale, y1*this.scale);
        this.ctx.lineTo(x2*this.scale, y2*this.scale);
        this.ctx.stroke();
    }
}

export default draw