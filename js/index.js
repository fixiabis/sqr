var square = document.getElementById("square"),
    actionName = document.querySelector("#action-name"),
    actionType = document.querySelector("#action-type"),
    score = document.querySelector("#score"),
    game = {
        event: "none",
        beforeActionId: "-1/-1",
        actions: {
            name: [
                "tap",
                "swipe",
                "shake"
            ],
            type: [
                ["", "2 finger", "3 finger"],
                [
                    "↑", "↓", "←", "→",
                    "↖", "↗", "↙", "↘"
                ],
                [""]
            ],
            event: [
                ["touch", "touch2", "touch3"],
                [
                    "swipeUp", "swipeDown", "swipeLeft", "swipeRight",
                    "swipeUpLeft", "swipeUpRight", "swipeDownLeft", "swipeDownRight"
                ],
                ["shake"]
            ]
        },
        actionCorrent: function () {
            var beforeActionId = game.beforeActionId.split("/"),
                name = beforeActionId[0],
                type = beforeActionId[1],
                result = game.event == game.actions.event[name][type];
            if (!result && game.started) {
                square.style.backgroundColor = "black";
                square.style.color = "white";
                actionName.innerHTML = "again?";
                actionType.innerHTML = "";
                clearInterval(game.timerId);
                game.started = false;
            }
            return result;
        },
        touch: {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
            point: 0
        },
        shake: {
            start: { x: 0, y: 0, z: 0 },
            end: { x: 0, y: 0, z: 0 },
            init: false
        },
        start: function () {
            var actions = game.actions,
                beforeActionId = game.beforeActionId,
                name = 0, type = 0, actionId = "-1/-1";
            do {
                name = Math.floor(Math.random() * actions.name.length);
                type = Math.floor(Math.random() * actions.type[name].length);
                actionId = name + "/" + type;
            } while (beforeActionId == actionId);
            game.beforeActionId = actionId;
            actionName.innerHTML = actions.name[name];
            actionType.innerHTML = actions.type[name][type];
        },
        started: false
    };
window.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});
window.addEventListener("touchstart", function (event) {
    var touch = event.touches[0];
    game.touch = {
        start: { x: touch.clientX, y: touch.clientY },
        end: { x: 0, y: 0 },
        point: event.touches.length
    };
});
window.addEventListener("touchmove", function (event) {
    if (event.touches.length == 1) {
        var touch = event.touches[0];
        game.touch.end = { x: touch.clientX, y: touch.clientY };
    }
});
window.addEventListener("touchend", function (event) {
    var touch = game.touch;
    if (touch.end.x == 0 && touch.end.y == 0) {
        game.event = "touch" + (touch.point > 1 ? touch.point : "");
    } else {
        var swipeVector = {
            x: touch.end.x - touch.start.x,
            y: touch.end.y - touch.start.y
        }, moveLength = {
            x: Math.abs(swipeVector.x),
            y: Math.abs(swipeVector.y)
        },
            max = Math.max(moveLength.x, moveLength.y),
            min = Math.min(moveLength.x, moveLength.y);
        game.event = "swipe" +
            (Math.floor(max / min) > 1 ?
                moveLength.x > moveLength.y ?
                    swipeVector.x > 0 ? "Right" : "Left"
                    :
                    swipeVector.y > 0 ? "Down" : "Up"
                :
                (swipeVector.y > 0 ? "Down" : "Up") +
                (swipeVector.x > 0 ? "Right" : "Left")
            );
    }
    game.actionCorrent();
});
window.addEventListener("devicemotion", function (event) {
    var accel = event.accelerationIncludingGravity,
        shake = game.shake;
    shake.start.x = accel.x;
    shake.start.y = accel.y;
    shake.start.z = accel.z;
    var shakeVector = {
        x: shake.end.x - shake.start.x,
        y: shake.end.y - shake.start.y,
        z: shake.end.z - shake.start.z
    }, shakeForce = {
        x: Math.abs(shakeVector.x),
        y: Math.abs(shakeVector.y),
        z: Math.abs(shakeVector.z),
    };
    if (shakeForce.x > 4 || shakeForce.y > 4 || shakeForce > 4)
        if (shake.init) {
            game.event = "shake";
            game.actionCorrent();
        } else
            shake.init = true;
    shake.end.x = accel.x;
    shake.end.y = accel.y;
    shake.end.z = accel.z;
});
square.addEventListener("click", function () {
    if (game.started) return;
    game.timerId = setInterval(function () {
        var actionCorrent = game.actionCorrent();
        if (actionCorrent) {
            score.innerHTML = score.innerHTML * 1 + 1;
            game.start();
        }
    }, 2000);
    square.style.backgroundColor = "";
    square.style.color = "";
    score.innerHTML = "0";
    game.started = true;
    game.start();
});