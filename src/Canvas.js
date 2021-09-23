class Canvas {

    static async LoadImage(src) {
        return new Promise((resolve, reject) => {
            let img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = "../images/" + src
        });
    }

    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');
    }

    AddEventListener(event, callback) {
        this.canvas.addEventListener(event, callback);
    }

    Clear() {
        this.SetColor("#fff");
        this.SetAlpha(1);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    SetColor(hex) {
        this.ctx.fillStyle = hex;
        this.ctx.strokeStyle = hex;
    }

    SetAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    SetFont(font, size) {
        this.ctx.font = `${size}px ${font}`;
    }

    DrawRectangle(x, y, width, height, filled) {
        if (filled) {
            this.ctx.fillRect(x, y, width, height);
        } else {
            this.ctx.strokeRect(x, y, width, height);
        }
    }

    DrawImage(image, x, y) {
        this.ctx.drawImage(image, x, y);
    }

    DrawText(text, x, y) {
        this.ctx.fillText(text, x, y);
    }
}