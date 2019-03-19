import { LitElement, html } from 'lit-element';

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class CherryLogoParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
    }
}

const SWARM_MOTION_SPHERE = Symbol('SWARM_MOTION_SPHERE');
const SWARM_MOTION_LOGO = Symbol('SWARM_MOTION_LOGO');

class CherryLogoSwarm {
    constructor(xMax, yMax, particleCount) {
        this.xMax = xMax;
        this.yMax = yMax;
        this.particles = new Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            this.particles[i] = new CherryLogoParticle(getRandomInt(0, xMax), getRandomInt(0, yMax));
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

            particle.x = Math.min(Math.max(0, particle.x), this.xMax);
            particle.y = Math.min(Math.max(0, particle.y), this.yMax);

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

    renderSwarm(currentTime, canvasContext) {
        this.particles.forEach((particle, index) => {
            let shade = 20 + (((currentTime / 1000) + (index / 100)) % 30);

            canvasContext.fillStyle = `hsl(0,100%,${shade}%)`;
            canvasContext.fillRect(particle.x, particle.y, 5, 5);
        });
    }
}

const CHERRY_LOGO_CANVAS_ID = 'cherry-logo-canvas-id';

class CherryLogo extends LitElement {

    static get properties() {
        return {
            width: {type: Number},
            height: {type: Number},
            // particleCount: {type: Number},
        };
    }

    constructor() {
        super();

        this.width = 100;
        this.height = 100;
        this.particleCount = 1000;
        
        this.swarm = null;
        this.lastAnimationFrameTime = null;

        this.moveToX = Math.floor(this.width / 2);
        this.moveToY = Math.floor(this.height / 2);
    }

    connectedCallback() {
        super.connectedCallback();
        
        this.swarm = new CherryLogoSwarm(this.width, this.height, this.particleCount);
        
        requestAnimationFrame((timestamp) => this.updateCherryLogo(timestamp));
        setInterval(() => this.updateMoveToPoint(), 5000);
    }

    updateMoveToPoint() {
        this.moveToX = getRandomInt(0, this.width);
        this.moveToY = getRandomInt(0, this.height);
    }
    
    updateCherryLogo(currentTime) {
        if (!this.lastAnimationFrameTime) this.lastAnimationFrameTime = currentTime;

        const canvas = this.shadowRoot.getElementById(CHERRY_LOGO_CANVAS_ID);
        if (!canvas) return;

        const dt = currentTime - this.lastAnimationFrameTime;

        const canvasContext = canvas.getContext('2d');

        // this.shade = ((this.shade + (dt / 100)) % 30);
        // canvasContext.fillStyle = `hsl(0,100%,${this.shade + 20}%)`;

        canvasContext.fillStyle = 'white';
        canvasContext.fillRect(0, 0, this.width, this.height);
        
        // this.swarm.moveToPointAnimation(dt, this.moveToX, this.moveToY);
        this.swarm.orbitCircleAnimation(dt, this.moveToX, this.moveToY, 50);
        this.swarm.renderSwarm(currentTime, canvasContext);

        this.lastAnimationFrameTime = currentTime;

        requestAnimationFrame((timestamp) => this.updateCherryLogo(timestamp));
    }

    render() {
        return html`
            <canvas id="${CHERRY_LOGO_CANVAS_ID}" width="${this.width}" height="${this.height}"></canvas>
        `;
    }
}

customElements.define('cherry-logo', CherryLogo);