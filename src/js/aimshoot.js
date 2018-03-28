import "../scss/aimshoot.scss";

let MouseMove = require("./mousemove.js").MouseMove;

const EQUIPMENT_URL = "js/equipment.json",
      AREA_WIDTH = 700,
      AREA_HEIGHT = 500,
      TARGET_SIZE = 80;

function randomXY() {
    let min_x = TARGET_SIZE / 2.0;
    let max_x = AREA_WIDTH - TARGET_SIZE;
    let min_y = min_x;
    let max_y = AREA_HEIGHT - TARGET_SIZE;
    return {
        x: min_x + Math.random() * (max_x - min_x),
        y: min_y + Math.random() * (max_y - min_y)
    };
}

function randomListItem(list) {
    // Objects in the list MUST contain a "chance" field
    let totalChance = list.reduce((partial, item) => {
        return {
            chance: partial.chance + item.chance
        };
    }).chance;
    let selectedNumber = Math.random() * totalChance;
    let currentSum = 0;
    let selectedItem = null;
    list.some(currentItem => {
        currentSum += currentItem.chance;
        if (selectedNumber < currentSum) {
            selectedItem = currentItem;
            return true; // break loop
        }
        return false; // continue loop
    });
    return selectedItem;
}

class Shooter {
    constructor(areaElement, aimElement) {
        this._areaElement = areaElement;
        this._aimElement = aimElement;
        this._mouse = new MouseMove(
            this._areaElement,
            (position, dragging) => this._onMouseMove(position, dragging),
            position => this._onMouseDown(position),
            () => this._onMouseUp()
        );

        this.weapon = {
            "name": "AKM",
            "ammo": "7.62",
            "capacity": 30,
            "power": 49.0,
            "rate": 0.1,
            "range": 60,
            "icon": "img/akm.png"
        };
        this.weaponMultipliers = {
            "head": 2.3,
            "chest": 1.0,
            "limbs": 0.9
        };
        this.targetList = [];
        this.targetTemplate = document.getElementById("target").content;
    }

    start() {
        this._mouse.addListeners();
        this.loadEquipment();
        this._interval = setInterval(() => this.addTarget(), 1000);
    }

    stop() {
        if (typeof(this._interval) !== "number") {
            return console.warn("Cannot stop interval, it is invalid!");
        }

        clearInterval(this._interval);
        this._interval = null;
    }

    addTarget() {
        let targetConfig = this._chooseTarget();

        // Calculate damage multiplier according to weapon & body part
        let damageMultiplier = this.weaponMultipliers[targetConfig.bodypart] || 1.0;

        this.targetTemplate.querySelector("img").src = targetConfig.icon;
        let target = document.importNode(this.targetTemplate, true).children[0];

        let position = randomXY();
        target.style.left = position.x + "px";
        target.style.top = position.y + "px";

        target.health = 100;

        target.addEventListener("animationend", () => {
            console.log("ended");
            this._areaElement.removeChild(target);
        });
        let healthElement = target.querySelector("div.health");
        target.addEventListener("mousedown", event => {
            let damage = this.weapon.power * (1 - targetConfig.dr);
            damage *= damageMultiplier;
            target.health -= damage;

            // Update health visual element
            healthElement.style.height = target.health + "%";

            if (target.health <= 0) {
                this._areaElement.removeChild(target);
            }
        });

        this._areaElement.appendChild(target);
    }

    _chooseTarget() {
        let protectionItem = randomListItem(this.equipment.protection);
        return randomListItem(protectionItem.list);
    }

    loadEquipment() {
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
                            "power": 21.0,
                            "rate": 0.06,
                            "range": 11,
                            "icon": "img/p18c.png"
                        }, {
                            "name": "P92",
                            "ammo": "9mm",
                            "capacity": 15,
                            "power": 30.0,
                            "rate": 0.135,
                            "range": 15,
                            "icon": "img/p92.png"
                        }, {
                            "name": "P1911",
                            "ammo": ".45",
                            "capacity": 7,
                            "power": 36.0,
                            "rate": 0.110,
                            "range": 15,
                            "icon": "img/p1911.png"
                        }, {
                            "name": "R45",
                            "ammo": ".45",
                            "capacity": 6,
                            "power": 49.5,
                            "rate": 0,
                            "range": 0,
                            "icon": "img/r45.png"
                        }, {
                            "name": "R1895",
                            "ammo": "7.62",
                            "capacity": 7,
                            "power": 49.5,
                            "rate": 0.4,
                            "range": 32,
                            "icon": "img/r1895.png"
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
                            "power": 49.0,
                            "rate": 0.1,
                            "range": 60,
                            "icon": "img/akm.png"
                        }, {
                            "name": "Groza",
                            "ammo": "7.62",
                            "capacity": 30,
                            "power": 49.0,
                            "rate": 0.08,
                            "range": 60,
                            "icon": "img/groza.png"
                        }, {
                            "name": "M416",
                            "ammo": "5.56",
                            "capacity": 30,
                            "power": 44.0,
                            "rate": 0.086,
                            "range": 57,
                            "icon": "img/m416.png"
                        }, {
                            "name": "SCAR L",
                            "ammo": "5.56",
                            "capacity": 30,
                            "power": 44.0,
                            "rate": 0.096,
                            "range": 55,
                            "icon": "img/scarl.png"
                        }, {
                            "name": "M16A4",
                            "ammo": "5.56",
                            "capacity": 30,
                            "power": 44.0,
                            "rate": 0.075,
                            "range": 63,
                            "icon": "img/m16a4.png"
                        }, {
                            "name": "AUG A3",
                            "ammo": "5.56",
                            "capacity": 30,
                            "power": 44.0,
                            "rate": 0,
                            "range": 0,
                            "icon": "img/auga3.png"
                        }
                    ]
                }, {
                    "name": "SMG",
                    "multipliers": {
                        "head": 1.8,
                        "chest": 1.0,
                        "limbs": 1.0
                    },
                    "list": [
                        {
                            "name": "Micro Uzi",
                            "ammo": "9mm",
                            "capacity": 25,
                            "power": 25.0,
                            "rate": 0.048,
                            "range": 22,
                            "icon": "img/microuzi.png"
                        }, {
                            "name": "Vector",
                            "ammo": ".45",
                            "capacity": 13,
                            "power": 33.0,
                            "rate": 0.055,
                            "range": 18,
                            "icon": "img/vector.png"
                        }, {
                            "name": "ump9",
                            "ammo": "9mm",
                            "capacity": 30,
                            "power": 38.0,
                            "rate": 0.092,
                            "range": 30,
                            "icon": "img/ump9.png"
                        }, {
                            "name": "Tommy Gun",
                            "ammo": ".45",
                            "capacity": 30,
                            "power": 40.0,
                            "rate": 0.086,
                            "range": 46,
                            "icon": "img/tommygun.png"
                        }
                    ]
                }, {
                    "name": "LMG",
                    "multipliers": {
                        "head": 2.3,
                        "chest": 1.0,
                        "limbs": 0.95
                    },
                    "list": [
                        {
                            "name": "M249",
                            "ammo": "5.56",
                            "capacity": 100,
                            "power": 45.0,
                            "rate": 0.075,
                            "range": 71,
                            "icon": "img/m249.png"
                        }, {
                            "name": "DP 28",
                            "ammo": "7.62",
                            "capacity": 47,
                            "power": 45.0,
                            "rate": 0.075,
                            "range": 71,
                            "icon": "img/dp28.png"
                        }
                    ]
                }, {
                    "name": "SR",
                    "multipliers": {
                        "head": 2.5,
                        "chest": 1.1,
                        "limbs": 0.95
                    },
                    "list": [
                        {
                            "name": "VSS",
                            "ammo": "9mm",
                            "capacity": 10,
                            "power": 40.0,
                            "rate": 0.086,
                            "range": 0,
                            "icon": "img/vss.png"
                        }, {
                            "name": "Mini 14",
                            "ammo": "5.56",
                            "capacity": 20,
                            "power": 45.0,
                            "rate": 0.1,
                            "range": 63,
                            "icon": "img/mini14.png"
                        }, {
                            "name": "SKS",
                            "ammo": "7.62",
                            "capacity": 10,
                            "power": 57.0,
                            "rate": 0.09,
                            "range": 64,
                            "icon": "img/sks.png"
                        }, {
                            "name": "MK14 EBR",
                            "ammo": "7.62",
                            "capacity": 10,
                            "power": 61.0,
                            "rate": 0.09,
                            "range": 80,
                            "icon": "img/mk14ebr.png"
                        }, {
                            "name": "Win 1894",
                            "ammo": ".45",
                            "capacity": 8,
                            "power": 66.0,
                            "rate": 0,
                            "range": 0,
                            "icon": "img/win1894.png"
                        }, {
                            "name": "Kar98k",
                            "ammo": "7.62",
                            "capacity": 5,
                            "power": 75.0,
                            "rate": 1.9,
                            "range": 79,
                            "icon": "img/kar98k.png"
                        }, {
                            "name": "M24",
                            "ammo": "7.62",
                            "capacity": 5,
                            "power": 88.0,
                            "rate": 1.8,
                            "range": 96,
                            "icon": "img/m24.png"
                        }, {
                            "name": "AWM",
                            "ammo": ".300",
                            "capacity": 5,
                            "power": 120.0,
                            "rate": 1.85,
                            "range": 100,
                            "icon": "img/awm.png"
                        }
                    ]
                }, {
                    "name": "MISC",
                    "multipliers": {
                        "head": 2.5,
                        "chest": 1.1,
                        "limbs": 0.95
                    },
                    "list": [
                        {
                            "name": "crossbow",
                            "ammo": "Bolt",
                            "capacity": 1,
                            "power": 105.0,
                            "rate": 1.0,
                            "range": 4,
                            "icon": "img/crossbow.png"
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

    }

    _onMouseMove(position, dragging) {
        this._aimElement.style.left = position.x + "px";
        this._aimElement.style.top = position.y + "px";
    }
    _onMouseDown(position) {

    }
    _onMouseUp() {

    }
}

window.shooter = new Shooter(document.getElementById("shoot-area"), document.getElementById("aim"));
window.shooter.start();

window.menu = new Vue({
    el: "#menu",
    data: {
        visible: true,
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
            this.selectedWeapon = window.shooter.weapon = weapon;
            this.hideMenu();
        },
        showMenu: function() {
            this.visible = true;
        },
        hideMenu: function() {
            this.visible = false;
        }
    }
});
