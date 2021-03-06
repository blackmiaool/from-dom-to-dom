export function squareSumSqrt(a, b) {
    return Math.sqrt(a * a + b * b);
}

export function getBoundingRect(dom) {
    const rect = dom.getBoundingClientRect();
    rect.x += rect.width / 2;
    rect.y += rect.height / 2;
    return rect;
}

export function makeBias(pos, len, angle) {
    pos.x += len * Math.cos(angle);
    pos.y += len * Math.sin(angle);
}

export default class D2D {
    constructor({ from, to, arrowOptions } = {}) {
        if (from[0]) {
            from = from[0];
        }
        if (to[0]) {
            to = to[0]
        }
        this.arrowOptions = Object.assign({
            strokeStyle: '#555',
            lineWidth: 3,
        }, arrowOptions);
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.style = "position:fixed;left:0;right:0;top:0;bottom:0;height:100%;width:100%;pointer-events:none;"
        canvas.height = document.documentElement.offsetHeight;
        canvas.width = document.documentElement.offsetWidth;
        // canvas.width="10vh";
        const ctx = canvas.getContext('2d');
        this.from = from;
        this.to = to;
        function sumSqrt(a, b) {
            return Math.sqrt(a * a + b * b);
        }

        this.canvas = canvas;
        this.ctx = ctx;
        this.update();
    }
    destroy() {
        if (this.destroyed) {
            return;
        }
        document.body.removeChild(this.canvas);
        this.destroyed = true;
    }
    update() {
        if (this.destroyed) {
            return;
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }
    draw() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const arrowRect = {
            from: getBoundingRect(this.from), to: getBoundingRect(this.to)
        };


        if (JSON.stringify(this.preArrowRect) === JSON.stringify(arrowRect)) {
            return;
        }
        canvas.height = document.documentElement.offsetHeight;
        canvas.width = document.documentElement.offsetWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.drawArrow(arrowRect);
        this.preArrowRect = arrowRect;
    }
    drawArrow({ to, from }) {
        const ctx = this.ctx;
        const tailY = 20;

        let toP, fromP;
        toP = JSON.parse(JSON.stringify(to));
        fromP = JSON.parse(JSON.stringify(from));

        const angle = Math.atan2((toP.y - fromP.y), (toP.x - fromP.x));
        const tan = Math.tan(angle);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        function getLineWidth() {
            const h = fromP.height / 2;
            const w = fromP.width / 2;
            let biasY = Math.abs(tailY / tan * sin);

            const ratio = (biasY + h) / biasY;
            return Math.abs(tailY / tan * ratio);
        }
        function getLineCorner() {
            const h = fromP.height / 2;
            const w = fromP.width / 2;

            const X = h / Math.abs(cos);
            const ratio = (w + Math.abs(sin * X)) / X;
            return h * ratio;
        }
        function getLineHeight() {
            let biasX = Math.abs(tailY * tan * cos);

            const ratio = (biasX + from.width / 2) / biasX;
            return Math.abs(tailY * tan * ratio);
        }

        function getTargetDis() {
            const h = toP.height / 2;
            const w = toP.width / 2;
            const angles = [Math.atan2(h, w), Math.atan2(h, -w), Math.atan2(-h, -w), Math.atan2(-h, w)];

            if ((angle >= angles[0] && angle < angles[1]) || (angle >= angles[2] && angle < angles[3])) {
                return Math.abs(h / sin);
            } else {
                return Math.abs(w / cos);
            }
        }
        makeBias(fromP, Math.min(getLineWidth(), getLineCorner(), getLineHeight()), angle);
        makeBias(toP, getTargetDis(), Math.PI + angle);

        ctx.strokeStyle = this.arrowOptions.strokeStyle;
        ctx.translate(toP.x, toP.y);
        ctx.rotate(Math.PI + angle)
        ctx.beginPath();
        ctx.lineWidth = this.arrowOptions.lineWidth;
        // ctx.lineTo(from.x+from.width/2,from.y+from.height/2);
        // ctx.lineTo(to.x+to.width/2,to.y+to.height/2);
        const x1 = 30;
        const y1 = 20;
        const x2 = 25;
        const y2 = 5;

        const tailX = squareSumSqrt(toP.x - fromP.x, toP.y - fromP.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.moveTo(x2, -y2);
        ctx.lineTo(x1, -y1);
        ctx.lineTo(0, 0);
        ctx.lineTo(x1, y1);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(tailX, tailY);
        ctx.lineTo(tailX, -tailY);
        ctx.lineTo(x2, -y2);
        ctx.stroke();
    }
}
