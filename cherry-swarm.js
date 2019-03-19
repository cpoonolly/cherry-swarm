import { LitElement, html } from 'lit-element';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class SwarmParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
    }
}

class Swarm {
    constructor(xMax, yMax, particleCount, color) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.particles = new Array(particleCount);
        this.color = color;
        this.animation = null;

        for (let i = 0; i < particleCount; i++) {
            this.particles[i] = new SwarmParticle(getRandomInt(0, xMax), getRandomInt(0, yMax));
        }
    }

    moveToPointAnimation(dt, targetX, targetY) {
        this.particles.forEach((particle) => {
            particle.x += dt * particle.dx / 1000;
            particle.y += dt * particle.dy / 1000;

            particle.x = Math.min(Math.max(0, particle.x), this.xMax);
            particle.y = Math.min(Math.max(0, particle.y), this.yMax);

            let vx = targetX - particle.x;
            let vy = targetY - particle.y;
            let vLength = Math.sqrt((vx*vx) + (vy*vy));

            particle.dx += vx / vLength;
            particle.dy += vy / vLength;

            // particle.dx += (-.01 * particle.dx);
            // particle.dy += (-.01 * particle.dy);

            // console.log(`x=${particle.x}\ty=${particle.y}`);
            // console.log(`dx=${particle.dx}\tdy=${particle.dy}`);
        });
    }

    orbitCircleAnimation(dt, circleCenterX, circleCenterY, radius) {
        this.particles.forEach((particle) => {
            particle.x += dt * particle.dx / 1000;
            particle.y += dt * particle.dy / 1000;

            particle.x = Math.min(Math.max(-10, particle.x), this.xMax + 10);
            particle.y = Math.min(Math.max(-10, particle.y), this.yMax + 10);

            let vx = circleCenterX - particle.x;
            let vy = circleCenterY - particle.y;
            let vLength = Math.sqrt((vx*vx) + (vy*vy));

            let vxNorm = vx / vLength;
            let vyNorm = vy / vLength;

            particle.dx += (vLength > radius ? 10 * vxNorm : 0.5 * vxNorm);
            particle.dy += (vLength > radius ? 10 * vyNorm : 0.5 * vyNorm);

            let vxPerpNorm = vy / vLength;
            let vyPerpNorm = -1 * vx / vLength;

            particle.dx += vxPerpNorm;
            particle.dy += vyPerpNorm;

            // console.log(`x=${particle.x}\ty=${particle.y}`);
            // console.log(`dx=${particle.dx}\tdy=${particle.dy}`);
        });
    }

    updateSwarm(dt) {
        if (this.animation) this.animation(dt);
    }

    renderSwarm(canvasContext) {
        // const PI2 = 2 * Math.PI;
        canvasContext.fillStyle = this.color;

        this.particles.forEach((particle) => {
            // canvasContext.beginPath();
            // canvasContext.arc(particle.x, particle.y, 5, 0, PI2);
            // canvasContext.fill();

            canvasContext.fillRect(particle.x, particle.y, 5, 5);
        });
    }
}

const CHERRY_SWARM_CANVAS_ID = 'cherry-swarm-canvas-id';

class CherrySwarmCanvas extends LitElement {

    static get properties() {
        return {
            width: {type: Number},
            height: {type: Number},
            particleCount: {type: Number},
            swarmCount: {type: Number},
        };
    }

    constructor() {
        super();

        this.width = window.screen.width - 200;
        this.height = window.screen.height - 200;
        this.particleCount = 1000;
        this.swarmCount = 1;
        
        this.swarms = [];
        this.lastAnimationFrameTime = null;
        this.numAnimationUpdates = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        
        for (let i = 0; i < this.swarmCount; i++) {
            this.swarms.push(new Swarm(this.width, this.height, this.particleCount, `hsl(0, 100%, ${getRandomInt(60, 90)}%)`));
        }
        
        requestAnimationFrame((timestamp) => this.updateCherry(timestamp));
        setInterval(() => this.updateSwarmAnimations(), 20000);

        this.updateSwarmAnimations();
    }

    updateSwarmAnimations() {
        this.numAnimationUpdates++;

        this.swarms.forEach((swarm) => {
            let circleX = (this.numAnimationUpdates % 2 !== 0) ? Math.floor(this.width / 2) : getRandomInt(0, this.width);
            let circleY = (this.numAnimationUpdates % 2 !== 0) ? Math.floor(this.height / 2) : getRandomInt(0, this.height);

            swarm.animation = ((dt) => swarm.orbitCircleAnimation(dt, circleX, circleY, 50));
        });
    }
    
    updateCherry(currentTime) {
        if (!this.lastAnimationFrameTime) this.lastAnimationFrameTime = currentTime;

        const canvas = this.shadowRoot.getElementById(CHERRY_SWARM_CANVAS_ID);
        if (!canvas) return;

        const dt = currentTime - this.lastAnimationFrameTime;

        const canvasContext = canvas.getContext('2d');

        // this.shade = ((this.shade + (dt / 100)) % 30);
        // canvasContext.fillStyle = `hsl(0,100%,${this.shade + 20}%)`;

        canvasContext.fillStyle = 'white';
        canvasContext.fillRect(0, 0, this.width, this.height);
        
        // this.swarm.moveToPointAnimation(dt, this.moveToX, this.moveToY);
        this.swarms.forEach((swarm) => {
            swarm.updateSwarm(dt);
            swarm.renderSwarm(canvasContext);
        });

        this.lastAnimationFrameTime = currentTime;

        requestAnimationFrame((timestamp) => this.updateCherry(timestamp));
    }

    render() {
        return html`
            <canvas id="${CHERRY_SWARM_CANVAS_ID}" width="${this.width}" height="${this.height}"></canvas>
        `;
    }
}

customElements.define('cherry-swarm', CherrySwarmCanvas);