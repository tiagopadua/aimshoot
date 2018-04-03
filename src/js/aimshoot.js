import "../scss/aimshoot.scss";

let MouseMove = require("./mousemove.js").MouseMove;
let TargetManager = require("./target.js").TargetManager;

const EQUIPMENT_URL = "js/equipment.json",
      RECOIL_TO_PIXEL_FACTOR = 0.3;

class Shooter {
    constructor(areaElement, aimElement) {
        this._areaElement = areaElement;
        this._aimElement = aimElement;

        this._mouse = new MouseMove(
            this._areaElement,
            position => this._onMouseMove(position),
            position => this._onMouseDown(position),
            () => this._onMouseUp()
        );
        this._mouse.on("move", position => this._onMouseMove(position));
        this._mouse.on("down", position => this._onMouseDown(position));
        this._mouse.on("up", () => this._onMouseUp());
        this._mouse.on("lock", () => this.start());
        this._mouse.on("unlock", () => this.stop());

        this._areaElement.addEventListener("click", () => this.start());

        this.weapon = {
            "name": "None",
            "ammo": "",
            "capacity": 0,
            "power": 0,
            "rate": 0,
            "modes": [],
            "selectedMode": "",
            "range": 0,
            "icon": "img/settings.png"
        };
        this.weaponMultipliers = {
            "head": 0,
            "chest": 0,
            "limbs": 0
        };
        this.shotTime = 0; // For fire rate
        this.shootIntent = false; // Tried to shoot in-between shots
        this.fullAutoInterval = null;
    }

    start() {
        if (this.running) {
            return;
        }

        this.running = true;
        this._mouse.lock();
        this._interval = setInterval(() => this.targetManager.addTarget(), 1000);
    }

    stop() {
        this.running = false;

        if (typeof(this._interval) !== "number") {
            return console.warn("Cannot stop interval, it is invalid!");
        }
        clearInterval(this._interval);
        this._interval = null;
    }

    loadEquipment() {
        return new Promise((accept, reject) => {
            setTimeout(() => {
                this.equipment = {
                "weapons": [
                    {
                        "name": "PISTOL",
                        "multipliers": {
                            "head": 2.0,
                            "chest": 1.0,
                            "limbs": 1.0
                        },
                        "list": [
                            {
                                "name": "P18C",
                                "ammo": "9mm",
                                "capacity": 15,
                                "power": 19.0,
                                "rate": 60,
                                "modes": [ "semi", "full" ],
                                "range": 11,
                                "icon": "img/p18c.png",
                                "recoil": {
                                    "spread": 3.5,
                                    "horizontal": {
                                        "speed": 12.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 2.0, 2.0, 2.0 ],
                                            "max": [ 4.0, 5.0, 5.0, 5.0, 5.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0, 1.0, 2.0, 3.0, 4.0 ],
                                            "max": [ 5.0, 6.0, 7.0, 8.0, 9.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "P92",
                                "ammo": "9mm",
                                "capacity": 15,
                                "power": 29.0,
                                "rate": 90,
                                "modes": [ "semi" ],
                                "range": 15,
                                "icon": "img/p92.png",
                                "recoil": {
                                    "spread": 2.5,
                                    "horizontal": {
                                        "speed": 12.0,
                                        "random": {
                                            "min": [ 1.0 ],
                                            "max": [ 4.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 5.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "P1911",
                                "ammo": ".45",
                                "capacity": 7,
                                "power": 35.0,
                                "rate": 110,
                                "modes": [ "semi" ],
                                "range": 15,
                                "icon": "img/p1911.png",
                                "recoil": {
                                    "spread": 3.0,
                                    "horizontal": {
                                        "speed": 5.0,
                                        "random": {
                                            "min": [ 3.0 ],
                                            "max": [ 6.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 6.0,
                                        "random": {
                                            "min": [ 4.0 ],
                                            "max": [ 8.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "REVOLVER",
                        "multipliers": {
                            "head": 2.0,
                            "chest": 1.0,
                            "limbs": 1.0
                        },
                        "list": [
                            {
                                "name": "R45",
                                "ammo": ".45",
                                "capacity": 6,
                                "power": 49.8,
                                "rate": 200,
                                "modes": [ "single" ],
                                "range": 0,
                                "icon": "img/r45.png",
                                "recoil": {
                                    "spread": 8.0,
                                    "horizontal": {
                                        "speed": 12.0,
                                        "random": {
                                            "min": [ 1.0 ],
                                            "max": [ 3.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "R1895",
                                "ammo": "7.62",
                                "capacity": 7,
                                "power": 46.0,
                                "rate": 400,
                                "modes": [ "single" ],
                                "range": 32,
                                "icon": "img/r1895.png",
                                "recoil": {
                                    "spread": 8.0,
                                    "horizontal": {
                                        "speed": 12.0,
                                        "random": {
                                            "min": [ 1.0 ],
                                            "max": [ 3.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "AR",
                        "multipliers": {
                            "head": 2.3,
                            "chest": 1.0,
                            "limbs": 0.9
                        },
                        "list": [
                            {
                                "name": "AKM",
                                "ammo": "7.62",
                                "capacity": 30,
                                "power": 48.0,
                                "rate": 100,
                                "modes": [ "semi", "full" ],
                                "range": 60,
                                "icon": "img/akm.png",
                                "recoil": {
                                    "spread": 5.0,
                                    "horizontal": {
                                        "speed": 12.0,
                                        "random": {
                                            /*
                                            * Bullet indexes:
                                            * 0 = bullet 1
                                            * 1 = bullets 2-5
                                            * 2 = bullets 6-10
                                            * 3 = bullets 10-20
                                            * 4 = remaining bullets
                                            */
                                            "min": [ 1.0, 2.0, 4.0, 5.0, 5.0 ],
                                            "max": [ 3.0, 4.0, 7.0, 8.0, 8.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 12.0, 7.0, 8.0, 9.0, 10.0 ],
                                            "max": [ 13.0, 9.0, 11.0, 12.0, 13.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "Groza",
                                "ammo": "7.62",
                                "capacity": 30,
                                "power": 48.0,
                                "rate": 80,
                                "modes": [ "semi", "full" ],
                                "range": 60,
                                "icon": "img/groza.png",
                                "recoil": {
                                    "spread": 6.0,
                                    "horizontal": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 0.0, 1.0, 3.0, 5.0, 6.0 ],
                                            "max": [ 1.0, 4.0, 8.0, 10.0, 11.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 14.0,
                                        "random": {
                                            "min": [ 6.0, 3.0, 5.0, 7.0, 12.0 ],
                                            "max": [ 8.0, 4.0, 10.0, 15.0, 14.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "M416",
                                "ammo": "5.56",
                                "capacity": 30,
                                "power": 41.0,
                                "rate": 86,
                                "modes": [ "semi", "full" ],
                                "range": 57,
                                "icon": "img/m416.png",
                                "recoil": {
                                    "spread": 4.0,
                                    "horizontal": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 3.0, 3.5, 4.0 ],
                                            "max": [ 3.0, 4.0, 4.5, 6.0, 6.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 2.0, 3.0, 4.0, 4.0, 5.0 ],
                                            "max": [ 3.0, 5.0, 6.0, 7.0, 7.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "SCAR L",
                                "ammo": "5.56",
                                "capacity": 30,
                                "power": 41.0,
                                "rate": 96,
                                "modes": [ "semi", "full" ],
                                "range": 55,
                                "icon": "img/scarl.png",
                                "recoil": {
                                    "spread": 4.0,
                                    "horizontal": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 1.0, 2.5, 3.5, 4.5, 5.0 ],
                                            "max": [ 3.0, 5.0, 5.5, 7.0, 8.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 2.0, 3.0, 3.5, 4.0, 5.0 ],
                                            "max": [ 3.5, 5.0, 6.0, 8.0, 10.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "M16A4",
                                "ammo": "5.56",
                                "capacity": 30,
                                "power": 41.0,
                                "rate": 75,
                                "modes": [ "semi", "burst" ],
                                "range": 63,
                                "icon": "img/m16a4.png",
                                "recoil": {
                                    "spread": 5.0,
                                    "horizontal": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 0.0, 2.0, 4.0, 6.0, 7.0 ],
                                            "max": [ 1.0, 4.0, 8.0, 12.0, 13.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 2.0, 3.0, 5.0, 7.0, 10.0 ],
                                            "max": [ 3.0, 4.0, 10.0, 15.0, 20.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "AUG A3",
                                "ammo": "5.56",
                                "capacity": 30,
                                "power": 44.0,
                                "rate": 96,
                                "modes": [ "semi", "full" ],
                                "range": 0,
                                "icon": "img/auga3.png",
                                "recoil": {
                                    "spread": 5.0,
                                    "horizontal": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 0.0, 2.0, 4.0, 6.0, 7.0 ],
                                            "max": [ 1.0, 4.0, 8.0, 12.0, 13.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 2.0, 3.0, 5.0, 7.0, 10.0 ],
                                            "max": [ 3.0, 4.0, 10.0, 15.0, 20.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "SMG",
                        "multipliers": {
                            "head": 1.5,
                            "chest": 1.0,
                            "limbs": 1.2
                        },
                        "list": [
                            {
                                "name": "Micro Uzi",
                                "ammo": "9mm",
                                "capacity": 25,
                                "power": 23.0,
                                "rate": 48,
                                "modes": [ "semi", "full" ],
                                "range": 22,
                                "icon": "img/microuzi.png",
                                "recoil": {
                                    "spread": 3.5,
                                    "horizontal": {
                                        "speed": 9.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 4.0, 4.0 ],
                                            "max": [ 3.0, 4.0, 8.0, 10.0, 10.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 8.0,
                                        "random": {
                                            "min": [ 2.0, 2.0, 3.0, 3.0, 4.0 ],
                                            "max": [ 4.0, 5.0, 6.0, 7.0, 8.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "Vector",
                                "ammo": ".45",
                                "capacity": 13,
                                "power": 31.0,
                                "rate": 55,
                                "modes": [ "semi", "burst", "full" ],
                                "range": 18,
                                "icon": "img/vector.png",
                                "recoil": {
                                    "spread": 3.5,
                                    "horizontal": {
                                        "speed": 8.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 4.0, 4.0 ],
                                            "max": [ 3.0, 4.0, 8.0, 10.0, 10.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 5.0,
                                        "random": {
                                            "min": [ 2.0, 2.0, 3.0, 3.0, 4.0 ],
                                            "max": [ 4.0, 5.0, 6.0, 7.0, 8.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "ump9",
                                "ammo": "9mm",
                                "capacity": 30,
                                "power": 35.0,
                                "rate": 92,
                                "modes": [ "semi", "burst", "full" ],
                                "range": 30,
                                "icon": "img/ump9.png",
                                "recoil": {
                                    "spread": 3.5,
                                    "horizontal": {
                                        "speed": 7.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 4.0, 4.0 ],
                                            "max": [ 3.0, 4.0, 8.0, 10.0, 10.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 8.0,
                                        "random": {
                                            "min": [ 2.0, 2.0, 3.0, 3.0, 4.0 ],
                                            "max": [ 4.0, 5.0, 6.0, 7.0, 8.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "Tommy Gun",
                                "ammo": ".45",
                                "capacity": 30,
                                "power": 38.0,
                                "rate": 86,
                                "modes": [ "semi", "full" ],
                                "range": 46,
                                "icon": "img/tommygun.png",
                                "recoil": {
                                    "spread": 3.5,
                                    "horizontal": {
                                        "speed": 8.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 4.0, 4.0 ],
                                            "max": [ 3.0, 4.0, 8.0, 10.0, 10.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 6.0,
                                        "random": {
                                            "min": [ 2.0, 2.0, 3.0, 3.0, 4.0 ],
                                            "max": [ 4.0, 5.0, 6.0, 7.0, 8.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "LMG",
                        "multipliers": {
                            "head": 2.3,
                            "chest": 1.0,
                            "limbs": 0.9
                        },
                        "list": [
                            {
                                "name": "M249",
                                "ammo": "5.56",
                                "capacity": 100,
                                "power": 44.0,
                                "rate": 75,
                                "modes": [ "full" ],
                                "range": 71,
                                "icon": "img/m249.png",
                                "recoil": {
                                    "spread": 6.0,
                                    "horizontal": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 6.0, 7.0 ],
                                            "max": [ 7.0, 4.0, 8.0, 12.0, 13.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 3.0, 5.0, 7.0 ],
                                            "max": [ 7.0, 8.0, 10.0, 15.0, 15.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "DP 28",
                                "ammo": "7.62",
                                "capacity": 49,
                                "power": 45.0,
                                "rate": 75,
                                "modes": [ "full" ],
                                "range": 71,
                                "icon": "img/dp28.png",
                                "recoil": {
                                    "spread": 6.0,
                                    "horizontal": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 6.0, 7.0 ],
                                            "max": [ 7.0, 4.0, 8.0, 12.0, 13.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 3.0, 5.0, 7.0 ],
                                            "max": [ 7.0, 8.0, 10.0, 15.0, 15.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "SR",
                        "multipliers": {
                            "head": 2.5,
                            "chest": 1.0,
                            "limbs": 0.95
                        },
                        "list": [
                            {
                                "name": "VSS",
                                "ammo": "9mm",
                                "capacity": 10,
                                "power": 38.0,
                                "rate": 86,
                                "modes": [ "semi", "full" ],
                                "range": 0,
                                "icon": "img/vss.png",
                                "recoil": {
                                    "spread": 7.0,
                                    "horizontal": {
                                        "speed": 8.0,
                                        "random": {
                                            "min": [ 1.0, 2.0, 4.0, 5.0, 5.0 ],
                                            "max": [ 3.0, 4.0, 7.0, 8.0, 8.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 10.5,
                                        "random": {
                                            "min": [ 2.0, 2.0, 3.0, 4.0, 5.0 ],
                                            "max": [ 4.0, 5.0, 6.0, 7.0, 8.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "Win 1894",
                                "ammo": ".45",
                                "capacity": 8,
                                "power": 66.0,
                                "rate": 0,
                                "modes": [ "single" ],
                                "range": 0,
                                "icon": "img/win1894.png",
                                "recoil": {
                                    "spread": 8.0,
                                    "horizontal": {
                                        "speed": 7.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 1.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "Kar98 K",
                                "ammo": "7.62",
                                "capacity": 5,
                                "power": 72.0,
                                "rate": 1900,
                                "modes": [ "single" ],
                                "range": 79,
                                "icon": "img/kar98k.png",
                                "recoil": {
                                    "spread": 8.0,
                                    "horizontal": {
                                        "speed": 7.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 1.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "M24",
                                "ammo": "7.62",
                                "capacity": 5,
                                "power": 84.0,
                                "rate": 1800,
                                "modes": [ "single" ],
                                "range": 96,
                                "icon": "img/m24.png",
                                "recoil": {
                                    "spread": 7.5,
                                    "horizontal": {
                                        "speed": 7.0,
                                        "random": {
                                            "min": [ 1.0 ],
                                            "max": [ 3.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "AWM",
                                "ammo": ".300",
                                "capacity": 5,
                                "power": 132.0,
                                "rate": 1850,
                                "modes": [ "single" ],
                                "range": 100,
                                "icon": "img/awm.png",
                                "recoil": {
                                    "spread": 7.5,
                                    "horizontal": {
                                        "speed": 7.0,
                                        "random": {
                                            "min": [ 1.0 ],
                                            "max": [ 4.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 15.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 7.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "DMR",
                        "multipliers": {
                            "head": 2.3,
                            "chest": 1.0,
                            "limbs": 0.95
                        },

                        "list": [
                            {
                                "name": "Mini 14",
                                "ammo": "5.56",
                                "capacity": 20,
                                "power": 44.0,
                                "rate": 100,
                                "modes": [ "semi" ],
                                "range": 63,
                                "icon": "img/mini14.png",
                                "recoil": {
                                    "spread": 5.0,
                                    "horizontal": {
                                        "speed": 11.0,
                                        "random": {
                                            "min": [ 3.0 ],
                                            "max": [ 6.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 11.2,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 3.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "SKS",
                                "ammo": "7.62",
                                "capacity": 10,
                                "power": 55.0,
                                "rate": 90,
                                "modes": [ "semi" ],
                                "range": 64,
                                "icon": "img/sks.png",
                                "recoil": {
                                    "spread": 7.0,
                                    "horizontal": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 4.0 ],
                                            "max": [ 8.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 11.5,
                                        "random": {
                                            "min": [ 5.0 ],
                                            "max": [ 10.0 ]
                                        }
                                    }
                                }
                            }, {
                                "name": "MK14 EBR",
                                "ammo": "7.62",
                                "capacity": 10,
                                "power": 60.0,
                                "rate": 90,
                                "modes": [ "semi" ],
                                "range": 80,
                                "icon": "img/mk14ebr.png",
                                "recoil": {
                                    "spread": 7.0,
                                    "horizontal": {
                                        "speed": 10.0,
                                        "random": {
                                            "min": [ 3.0 ],
                                            "max": [ 5.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 11.5,
                                        "random": {
                                            "min": [ 4.0 ],
                                            "max": [ 8.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }, {
                        "name": "MISC",
                        "multipliers": {
                            "head": 2.5,
                            "chest": 1.0,
                            "limbs": 0.95
                        },
                        "list": [
                            {
                                "name": "crossbow",
                                "ammo": "Bolt",
                                "capacity": 1,
                                "power": 105.0,
                                "rate": 1000,
                                "modes": [ "single" ],
                                "range": 4,
                                "icon": "img/crossbow.png",
                                "recoil": {
                                    "spread": 5.0,
                                    "horizontal": {
                                        "speed": 5.0,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 0.0 ]
                                        }
                                    },
                                    "vertical": {
                                        "speed": 0.5,
                                        "random": {
                                            "min": [ 0.0 ],
                                            "max": [ 1.0 ]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ],
                "protection": [
                    {
                        "name": "helmets",
                        "chance": 3,
                        "list": [
                            {
                                "name": "Bare skin",
                                "dr": 0.0,
                                "durability": 0,
                                "bodypart": "head",
                                "chance": 2,
                                "icon": "img/head.png",
                            },
                            {
                                "name": "lvl 1",
                                "dr": 0.3,
                                "durability": 80,
                                "bodypart": "head",
                                "chance": 5,
                                "icon": "img/helmet1.png"
                            }, {
                                "name": "lvl 2",
                                "dr": 0.4,
                                "durability": 150,
                                "bodypart": "head",
                                "chance": 4,
                                "icon": "img/helmet2.png"
                            }, {
                                "name": "lvl 3",
                                "dr": 0.55,
                                "durability": 230,
                                "bodypart": "head",
                                "chance": 1,
                                "icon": "img/helmet3.png"
                            }
                        ],
                    },
                    {
                        "name": "armors",
                        "chance": 7,
                        "list": [
                            {
                                "name": "None",
                                "dr": 0.0,
                                "durability": 0,
                                "bodypart": "chest",
                                "chance": 2,
                                "icon": "img/body.png"
                            },
                            {
                                "name": "lvl 1",
                                "dr": 0.3,
                                "durability": 200,
                                "bodypart": "chest",
                                "chance": 5,
                                "icon": "img/armor1.png"
                            }, {
                                "name": "lvl 2",
                                "dr": 0.4,
                                "durability": 220,
                                "bodypart": "chest",
                                "chance": 4,
                                "icon": "img/armor2.png"
                            }, {
                                "name": "lvl 3",
                                "dr": 0.55,
                                "durability": 250,
                                "bodypart": "chest",
                                "chance": 1,
                                "icon": "img/armor3.png"
                            }
                        ]
                    }
                ]
                };
                this.targetManager = new TargetManager(this._areaElement, this.equipment.protection);
                accept(this.equipment);
            }, 500);
        });
    }

    shoot(fullAutoCount) {
        // Check if can shoot, according to fire rate
        let now = Date.now();
        let elapsedTime = now - this.shotTime;
        if (elapsedTime < this.weapon.rate) {
            // Set to shoot as soon as ready, when weapon is SEMI or FULL auto
            if (this.weapon.selectedMode === "semi" || this.weapon.selectedMode === "full") {
                setTimeout(() => this.shoot(), this.weapon.rate - elapsedTime);
            }
            return;
        }
        this.shotTime = now;

        // Verify target hit
        this.targetManager.checkHit(this._mouse.position.x, this._mouse.position.y, this.weapon.power, this.weaponMultipliers);

        // Now randomize the recoil
        let random_index = 0;
        if (typeof(fullAutoCount) !== "number" || fullAutoCount <= 1) {
            random_index = 0;
        } else if (fullAutoCount <= 5) {
            random_index = 1;
        } else if (fullAutoCount <= 10) {
            random_index = 2;
        } else if (fullAutoCount <= 20) {
            random_index = 3;
        } else {
            random_index = 4;
        }

        let minimumX = this.weapon.recoil.horizontal.speed;
        let randomX = this.weapon.recoil.horizontal.random.min[random_index] + Math.random() * this.weapon.recoil.horizontal.random.max[random_index];
        let minimumY = this.weapon.recoil.vertical.speed;
        let randomY = this.weapon.recoil.vertical.random.min[random_index] + Math.random() * this.weapon.recoil.vertical.random.max[random_index];

        let recoilX = minimumX + randomX;
        let recoilY = minimumY + randomY;

        recoilX *= this.weapon.recoil.spread * RECOIL_TO_PIXEL_FACTOR / 2;
        recoilY *= this.weapon.recoil.spread * RECOIL_TO_PIXEL_FACTOR;

        console.log(fullAutoCount, recoilY);

        if ((Math.random() - 0.5) < 0) {
            recoilX *= -1;
        }

        this._mouse.updatePosition(recoilX, -recoilY);
    }

    startFullAuto() {
        if (this.fullAutoInterval !== null) {
            return;
        }
        if (this.weapon.modes.indexOf("full") < 0) {
            return;
        }

        let fullAutoCount = 1;
        this.fullAutoInterval = setInterval(() => {
            this.shoot(fullAutoCount);
            this.setAimPositionFromMouse();
            fullAutoCount += 1;
        }, this.weapon.rate);
    }
    stopFullAuto() {
        if (this.fullAutoInterval === null) {
            return;
        }
        clearInterval(this.fullAutoInterval);
        this.fullAutoInterval = null;
    }

    setAimPositionFromMouse() {
        this._aimElement.style.left = this._mouse.position.x + "px";
        this._aimElement.style.top = this._mouse.position.y + "px";
    }

    _onMouseMove(position, dragging) {
        this.setAimPositionFromMouse();
    }
    _onMouseDown(position) {
        this.shoot();
        this.setAimPositionFromMouse();
        this.startFullAuto();
    }
    _onMouseUp() {
        this.stopFullAuto();
    }
}

window.shooter = new Shooter(document.getElementById("shoot-area"), document.getElementById("aim"));
window.shooter.loadEquipment().then(equipment => {
    window.menu = new Vue({
        el: "#menu",
        data: {
            visible: true,
            running: false,
            weaponcategory: "",
            selectedWeapon: {
                icon: "img/settings.png"
            },
            equipment: window.shooter.equipment
        },
        methods: {
            setCategory: function(categoryName) {
                this.weaponcategory = categoryName;
            },
            setWeapon: function(weapon) {
                weapon.selectedMode = weapon.modes[0];
                this.selectedWeapon = window.shooter.weapon = weapon;
                this.hideMenu();
            },
            showMenu: function() {
                this.visible = true;
            },
            hideMenu: function() {
                this.visible = false;
            },
            start: function() {
                window.shooter.start();
                this.running = true;
            },
            stop: function() {
                this.running = false;
                window.shooter.stop();
            }
        }
    });
});
