// All targets start with same health
const AREA_WIDTH = 700,
      AREA_HEIGHT = 500,
      TARGET_SIZE = 80,
      HALF_TARGET_SIZE = TARGET_SIZE / 2.0,
      DEFAULT_TARGET_HEALTH = 100;

function randomXY() {
    // Real value inside the target area, considering target size
    return {
        x: HALF_TARGET_SIZE + Math.random() * (AREA_WIDTH - TARGET_SIZE),
        y: HALF_TARGET_SIZE + Math.random() * (AREA_HEIGHT - TARGET_SIZE)
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


export class TargetManager {
    constructor(areaElement, protectionList) {
        this._areaElement = areaElement;
        this._protectionList = protectionList;

        this.TARGET_HEALTH = DEFAULT_TARGET_HEALTH;

        this.targetList = [];
        this.targetTemplate = document.getElementById("target").content;
    }

    addTarget() {
        let targetConfig = this._chooseTargetType();
        this.targetTemplate.querySelector("img").src = targetConfig.icon;
        let target = document.importNode(this.targetTemplate, true).children[0];

        target.config = targetConfig;

        target.position = randomXY(); // Save in the target for later reference
        target.style.left = target.position.x + "px";
        target.style.top = target.position.y + "px";

        target.health = this.TARGET_HEALTH;

        target.addEventListener("animationend", () => {
            console.log("Target survived!");
            this._areaElement.removeChild(target);
        });

        this.targetList.push(target);
        this._areaElement.appendChild(target);
    }

    checkHit(x, y, weaponPower, damageMultipliers) {
        for (let targetIndex in this.targetList) {
            let target = this.targetList[targetIndex];

            let radius_sq = target.getBoundingClientRect().width / 2.0; // Divide by 2 converts diameter to radius
            radius_sq *= radius_sq; // squared value, to avoid square root in comparison later

            let dx = x - target.position.x; // difference in X axis
            let dy = y - target.position.y; // difference in Y axis
            let distance_sq = dx*dx + dy*dy;

            if (distance_sq <= radius_sq) {
                // HIT!
                let damage = weaponPower * (1 - target.config.dr); // Consider damage reduction from protection item
                damage *= damageMultipliers[target.config.bodypart] || 1.0; // Consider the weapon type multiplier & body part

                target.health -= damage;
    
                if (target.health <= 0) {
                    this._areaElement.removeChild(target); // Remove target from DOM
                    this.targetList.splice(this.targetList.indexOf(target), 1); // Remove target from local list
                } else {
                    // Update health visual element
                    target.querySelector("div.health").style.height = target.health + "%";
                }
            }
        }
    }

    _chooseTargetType() {
        let protectionItem = randomListItem(this._protectionList);
        return randomListItem(protectionItem.list);
    }
};
