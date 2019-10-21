Blood = {
  maxParts : 100,
  partsPerSplatter : 8,
  ecoPartsPerSplatter : 3,
  container : null,
  sprites : [],
  discardedSprites : [],
  gravity : 100,
  spraySpeed : 20,
  fadeSpeed : 0.7,
	getTexture(color) {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = color;
		blastCtx.fillRect(0, 0, 1, 1);
		return PIXI.Texture.from(blast);
	},
	initialize() {
    this.container = new PIXI.Container();
    backgroundContainer.addChild(this.container);

    this.texture = this.getTexture("#ff0000");
    this.plagueTexture = this.getTexture("#00ff00");

		for (var i = 0; i < this.maxParts; i++) {

      var sprite = new PIXI.Sprite(this.texture);
      this.container.addChild(sprite);
      sprite.visible=false;
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
	},
	update(timeDiff) {
		for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updatePart(this.sprites[i], timeDiff);
      }
		}
  },
  updatePart(sprite, timeDiff) {
    if (sprite.hitFloor) {
      sprite.alpha -= this.fadeSpeed * timeDiff;
      if (sprite.alpha <= 0) {
        sprite.visible = false;
        this.discardedSprites.push(sprite);
      }
    } else {
      sprite.ySpeed += this.gravity * timeDiff;
      sprite.x += sprite.xSpeed * timeDiff;
      sprite.y += sprite.ySpeed * timeDiff;
      if (sprite.y >= sprite.floor) {
        sprite.hitFloor = true;
      }
    }
    
  },
  newPart(x,y, plague) {
    var sprite;
    if (this.discardedSprites.length > 0) {
      sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.texture);
      this.container.addChild(sprite);
      this.sprites.push(sprite);
    }
    if (plague) {
      sprite.texture = this.plagueTexture;
    } else {
      sprite.texture = this.texture; 
    }
    sprite.x = x;
    sprite.y = y - (8 + Math.random() * 10);
    sprite.floor = y;
    sprite.hitFloor = false;
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.scale = {x:1,y:1};
    if (Math.random() > 0.5)
      sprite.scale = {x:2,y:2};
    var xSpeed = Math.random() * (plague ? this.spraySpeed * 1.5 : this.spraySpeed);
    sprite.xSpeed = Math.random() > 0.5 ? -1 * xSpeed : xSpeed;
    sprite.ySpeed = -1 * (plague ? this.spraySpeed * 1.5 : this.spraySpeed);
  },
  newSplatter(x,y) {
    if (this.discardedSprites.length < this.sprites.length / 2) {
      for (var i=0; i<this.ecoPartsPerSplatter; i++) {
        this.newPart(x, y, false);
      }
    } else {
      for (var i=0; i<this.partsPerSplatter; i++) {
        this.newPart(x, y, false);
      }
    }
  },
  newPlagueSplatter(x,y) {
    for (var i=0; i < this.partsPerSplatter * 2; i++) {
      this.newPart(x, y, true);
    }
  }
};

Bones = {
  maxParts : 100,
  partsPerSplatter : 3,
  container : null,
  sprites : [],
  discardedSprites : [],
  uncollected : [],
  gravity : 100,
  spraySpeed : 20,
  fadeTime : 30,
  fadeSpeed : 0.2,
  fadeBones : false,
	getTexture() {
		var blast = document.createElement('canvas');
		blast.width = 4;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#dddddd";
		blastCtx.fillRect(0, 0, 4, 1);
		return PIXI.Texture.from(blast);
	},
	initialize() {

    for (var i = 0; i < this.sprites.length; i++) {
      this.sprites[i].collected = true;
      this.sprites[i].visible = false;
      this.discardedSprites = this.sprites.slice();
    }
    if (this.container)
      return;

    this.container = new PIXI.Container();
    backgroundContainer.addChild(this.container);

    this.texture = this.getTexture();

		for (var i = 0; i < this.maxParts; i++) {
      var sprite = new PIXI.Sprite(this.texture);
      this.container.addChild(sprite);
      sprite.visible=false;
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
	},
	update(timeDiff) {
    var uncollectedBones = [];
		for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updatePart(this.sprites[i], timeDiff);
        uncollectedBones.push(this.sprites[i]);
      }
    }
    this.uncollected = uncollectedBones;
    this.fadeBones = uncollectedBones.length > 500;
  },
  updatePart(sprite, timeDiff) {
    if (sprite.collected) {
      sprite.visible = false;
      this.discardedSprites.push(sprite);
      return;
    }
    if (sprite.hitFloor) {
      
      if (this.fadeBones)
        sprite.fadeTime -= timeDiff;

      if (sprite.fadeTime < 0 && !sprite.collector) {
        sprite.alpha -= this.fadeSpeed * timeDiff;
        if (sprite.alpha <= 0) {
          sprite.visible = false;
          this.discardedSprites.push(sprite);
        }
      }
      
    } else {
      sprite.ySpeed += this.gravity * timeDiff;
      sprite.rotation += sprite.rotSpeed * timeDiff;
      sprite.x += sprite.xSpeed * timeDiff;
      sprite.y += sprite.ySpeed * timeDiff;
      if (sprite.y >= sprite.floor) {
        sprite.hitFloor = true;
      }
    }
    
  },
  newPart(x,y) {
    var sprite;
    if (this.discardedSprites.length > 0) {
      var sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.texture);
      this.container.addChild(sprite);
      this.sprites.push(sprite);
    }
    sprite.x = x;
    sprite.y = y - (8 + Math.random() * 10);
    sprite.fadeTime = Math.random() * this.fadeTime;
    sprite.rotation = Math.random() * 5
    sprite.rotSpeed =  -2 + Math.random() * 4;
    sprite.floor = y;
    sprite.hitFloor = false;
    sprite.collected = false;
    sprite.collector = false;
    sprite.visible = true;
    sprite.alpha = 1;
    sprite.scale = {x:1,y:1};
    if (Math.random() > 0.5)
      sprite.scale = {x:1.5,y:1.5};
    var xSpeed = Math.random() * this.spraySpeed;
    sprite.xSpeed = Math.random() > 0.5 ? -1 * xSpeed : xSpeed;
    sprite.ySpeed = -1 * this.spraySpeed;
  },
  newBones(x,y) {
    if (!GameModel.constructions.graveyard)
      return;
    for (var i=0; i<this.partsPerSplatter; i++) {
      this.newPart(x,y);
    }
  }
};

Exclamations = {
  sprites : [],
  discardedSprites : [],
  maxSprites : 10,
  container:null,
  height:20,
  fadeSpeed:4,

  initialize() {
    this.container = new PIXI.Container();
    foregroundContainer.addChild(this.container);

    this.healTexture = PIXI.Texture.from("healing.png");
    this.exclamationTexture = PIXI.Texture.from("exclamation.png");
    this.radioTexture = PIXI.Texture.from("radio.png");
    this.fireTexture = PIXI.Texture.from("fire.png");
    this.shieldTexture = PIXI.Texture.from("shield.png");
    this.poisonTexture = PIXI.Texture.from("poison.png");

		for (var i = 0; i < this.maxSprites; i++) {

      var sprite = new PIXI.Sprite(this.exclamationTexture);
      this.container.addChild(sprite);
      sprite.visible=false;
      sprite.anchor = {x:0.5,y:1};
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
  },

  newIcon(target, texture, displayTime) {
    if (target.hasIcon)
      return;
    var sprite;
    if (this.discardedSprites.length > 0) {
      sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.exclamationTexture);
      this.container.addChild(sprite);
      sprite.anchor = {x:0.5,y:1};
      this.sprites.push(sprite);
    }
    sprite.texture = texture;
    sprite.target = target;
    sprite.target.hasIcon = true;
    sprite.x = target.x;
    sprite.y = target.y - this.height;
    sprite.visible = true;
    sprite.time = displayTime;
    sprite.alpha = 1;
    sprite.scale = {x:1.5,y:1.5};
  },

  newHealing(target) {
    this.newIcon(target, this.healTexture, 1);
  },

  newExclamation(target) {
    this.newIcon(target, this.exclamationTexture, 2);
  },

  newRadio(target) {
    this.newIcon(target, this.radioTexture, 2);
  },

  newFire(target) {
    this.newIcon(target, this.fireTexture, 1);
  },

  newShield(target) {
    this.newIcon(target, this.shieldTexture, 1);
  },

  newPoison(target) {
    this.newIcon(target, this.poisonTexture, 1);
  },

  update(timeDiff) {
    for (var i=0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updateSprite(this.sprites[i], timeDiff);
      }
    }
  },

  updateSprite(sprite, timeDiff) {
    sprite.x = sprite.target.x;
    sprite.y = sprite.target.y - this.height;
    sprite.time -= timeDiff;
    if (sprite.time < 0) {
      sprite.alpha -= timeDiff * this.fadeSpeed;
      if (sprite.alpha < 0) {
        sprite.visible = false;
        sprite.target.hasIcon = false;
        this.discardedSprites.push(sprite);
      }
    }
  }
};

Bullets = {
  maxParts : 20,
  speed : 150,
  hitbox : 12,
  container : null,
  sprites : [],
  discardedSprites : [],
  fadeSpeed : 0.2,
	getTexture() {
		var blast = document.createElement('canvas');
		blast.width = 1;
		blast.height = 1;
		var blastCtx = blast.getContext('2d');

		// draw shape
		blastCtx.fillStyle = "#ffffff";
		blastCtx.fillRect(0, 0, 1, 1);
		return PIXI.Texture.from(blast);
	},
	initialize() {

    this.texture = this.getTexture();

		for (var i = 0; i < this.maxParts; i++) {

      var sprite = new PIXI.Sprite(this.texture);
      characterContainer.addChild(sprite);
      sprite.visible=false;
      sprite.scale.x = sprite.scale.y = 2;
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
	},
	update(timeDiff) {
		for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updatePart(this.sprites[i], timeDiff);
      }
		}
  },
  updatePart(sprite, timeDiff) {
    if (fastDistance(sprite.x, sprite.y + 8, sprite.target.x, sprite.target.y) < this.hitbox) {
      Zombies.damageZombie(sprite.target, sprite.damage);
      sprite.visible = false;
      this.discardedSprites.push(sprite);
    } else {
      sprite.x += sprite.xSpeed * timeDiff;
      sprite.y += sprite.ySpeed * timeDiff;
      sprite.zIndex = sprite.y;
    }
    sprite.alpha -= this.fadeSpeed * timeDiff;
    if (sprite.alpha < 0) {
      sprite.visible = false;
      this.discardedSprites.push(sprite);
    }
  },
  newBullet(x,y,target,damage) {
    var sprite;
    if (this.discardedSprites.length > 0) {
     sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.texture);
      characterContainer.addChild(sprite);
      sprite.scale.x = sprite.scale.y = 2;
      this.sprites.push(sprite);
    }
    sprite.x = x;
    sprite.y = y - 8;
    sprite.target = target;
    sprite.damage = damage;
    sprite.visible = true;
    sprite.alpha = 1;

    var xVector = target.x - x;
    var yVector = target.y - y;
    var ax = Math.abs(xVector);
    var ay = Math.abs(yVector);
    var ratio = 1 / Math.max(ax, ay);
    ratio = ratio * (1.29289 - (ax + ay) * ratio * 0.29289);
    
    // var aimAngle = Math.atan2(x - target.x, target.y - y);
    // var bulletSpeed = RotateVector2d(0, this.speed, aimAngle);
    
    sprite.xSpeed = xVector * ratio * this.speed;
    sprite.ySpeed = yVector * ratio * this.speed;
  }
};

Blasts = {
  maxParts:10,
  sprites:[],
  discardedSprites:[],
	getTexture() {
		var blast = document.createElement('canvas');
		blast.width = 32;
		blast.height = 32;
		var blastCtx = blast.getContext('2d');

		var radgrad = blastCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
		radgrad.addColorStop(0, 'rgba(255,255,255,1)');
		radgrad.addColorStop(0.8, 'rgba(255,255,128,0.2)');
		radgrad.addColorStop(1, 'rgba(255,180,0,0)');

		// draw shape
		blastCtx.fillStyle = radgrad;
		blastCtx.fillRect(0, 0, 32, 32);

		return PIXI.Texture.from(blast);
	},
	initialize() {

    this.texture = this.getTexture();

		for (var i = 0; i < this.maxParts; i++) {

      var sprite = new PIXI.Sprite(this.texture);
      foregroundContainer.addChild(sprite);
      sprite.visible=false;
      sprite.scale.x = sprite.scale.y = 2;
      sprite.anchor = {x:0.5, y:0.5};
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
	},
	update(timeDiff) {
		for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updatePart(this.sprites[i], timeDiff);
      }
		}
  },
  updatePart(sprite, timeDiff) {
    if (sprite.visible) {
      sprite.scale.y -= (10 * timeDiff);
      sprite.scale.x = sprite.scale.y;
      if (sprite.scale.x <= 0) {
        sprite.visible = false;
        this.discardedSprites.push(sprite);
      }
    }
  },
	newBlast: function(x, y) {
    var sprite;
    if (this.discardedSprites.length > 0) {
     sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.texture);
      foregroundContainer.addChild(sprite);
      this.sprites.push(sprite);
      sprite.anchor = {x:0.5, y:0.5};
    }
    sprite.scale.x = sprite.scale.y = 2;
		sprite.visible = true;
		sprite.x = x;
    sprite.y = y;
    Smoke.newCloud(x, y);
	}
};

Smoke = {
  maxParts:10,
  sprites:[],
  discardedSprites:[],
	getTexture() {
		var size = 8;
    var blast = document.createElement('canvas');
    blast.width = size + 4;
    blast.height = size + 4;
    var blastCtx = blast.getContext('2d');
    blastCtx.shadowBlur = 5;
    blastCtx.shadowColor = "white";
    var radgrad = blastCtx.createRadialGradient(size / 2 + 2, size / 2 + 2, 0, size / 2 + 2, size / 2 + 2, size / 2);
    radgrad.addColorStop(0, 'rgba(255,255,255,0.05)');
    radgrad.addColorStop(0.5, 'rgba(255,255,255,0.1)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');
    blastCtx.fillStyle = radgrad;
    blastCtx.fillRect(0, 0, size + 4, size + 4);
    return PIXI.Texture.from(blast);
	},
	initialize() {
    this.texture = this.getTexture();
		for (var i = 0; i < this.maxParts; i++) {
      var sprite = new PIXI.Sprite(this.texture);
      foregroundContainer.addChild(sprite);
      sprite.visible=false;
      sprite.scale.x = sprite.scale.y = 2;
      sprite.anchor = {x:0.5, y:0.5};
      this.sprites.push(sprite);
    }
    this.discardedSprites = this.sprites.slice();
	},
	update(timeDiff) {
		for (var i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i].visible) {
        this.updatePart(this.sprites[i], timeDiff);
      }
		}
  },
  updatePart(sprite, timeDiff) {
    if (sprite.visible) {
      sprite.scale.y -= (1.5 * timeDiff);
      sprite.scale.x = sprite.scale.y;
      sprite.y += sprite.ySpeed;
      if (sprite.scale.x <= 0) {
        sprite.visible = false;
        this.discardedSprites.push(sprite);
      }
    }
  },
	newSmoke: function(x, y, variance = 0) {
    var sprite;
    if (this.discardedSprites.length > 0) {
     sprite = this.discardedSprites.pop();
    } else {
      sprite = new PIXI.Sprite(this.texture);
      foregroundContainer.addChild(sprite);
      this.sprites.push(sprite);
      sprite.anchor = {x:0.5, y:0.5};
    }
    var sizeVariance = 0.2;
    sprite.ySpeed = -0.5;
    sprite.scale.x = sprite.scale.y = 1.6 - sizeVariance + (Math.random() * sizeVariance * 2);
		sprite.visible = true;
		sprite.x = x - variance + (Math.random() * variance * 2);
		sprite.y = y - variance + (Math.random() * variance * 2);
  },
  newCloud : function(x, y) {
    for (var i = 0; i < 10; i++) {
      this.newSmoke(x, y, 16);
    }
  }
};