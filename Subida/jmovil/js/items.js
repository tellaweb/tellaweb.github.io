// js/items.js
(function () {
    function collides(a, b) {
        return a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y;
    }

    class Item {
        constructor(x, y, type, qIndex) {
            this.x = x;
            this.y = y;
            this.width = 24;
            this.height = 24;
            this.type = type;    // solo para colorear
            this.qIndex = qIndex;  // índice de pregunta
            this.collected = false;
        }

        update() {
            if (this.collected) return;
            // no lanzamos pregunta si ya está una activa
            if (window.questionManager.isActive()) return;

            if (collides(this, window.player)) {
                this.collected = true;
                window.questionManager.activate(this.qIndex);
            }
        }

        draw(ctx) {
            if (this.collected) return;
            ctx.fillStyle = this.type === 'semilla' ? '#ffea00' : '#00bfff';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    window.items = [
        new Item(250, window.canvas.height - 100, 'semilla', 0),
        new Item(400, window.canvas.height - 180, 'regadera', 1)
    ];
})();
  
  
  