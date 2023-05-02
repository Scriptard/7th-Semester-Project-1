class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 5;
    this.rayLength = 150;
    this.raySpread = Math.PI / 2;

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders,traffic) {
    this.#castRays();
    this.readings = [];

    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(
        this.#getReading(
          this.rays[i], roadBorders,
          traffic
          )
        );
    }
  }

  #getReading(ray, roadBorders,traffic) {
    let touches = [];

    // checking whether the individual ray intersect with road border or not
    roadBorders.forEach((border) => {
      const touch = getIntersection(ray[0], ray[1], border[0], border[1]);

      if (touch) {
        touches.push(touch);
      }
    });

    // checking whether the individual ray interscet with all the traffic cars or not
    for(let i=0; i<traffic.length; i++) {
      const poly = traffic[i].polygon;
      for(let j = 0; j<poly.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j+1)%poly.length]
        );
        if(value) {
          touches.push(value);
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset === minOffset);
    }
  }

  #castRays() {
    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start = {
        x: this.car.x,
        y: this.car.y,
      };

      const end = {
        x: this.car.x - Math.sin(rayAngle) * this.rayLength,
        y: this.car.y - Math.cos(rayAngle) * this.rayLength,
      };

      this.rays.push([start, end]);
    }
  }

  draw(ctx) {
    this.rays.forEach((rayArr) => {
      let end = rayArr[1];

      // as using the forEach loop to find the array index finding it and storing it in i
      let i = this.rays.findIndex((elem) => elem === rayArr);
      if(this.readings[i]) {
        end=this.readings[i];
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(rayArr[0].x, rayArr[0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(rayArr[1].x, rayArr[1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  }
}
