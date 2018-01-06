var square = document.getElementById("square"),
    eventStatus = document.getElementById("event-status"),
    timeRemain = document.getElementById("time-remain"),
    sound = document.getElementById("sound"),
    actionName = document.querySelector("#action-name"),
    actionType = document.querySelector("#action-type"),
    score = document.querySelector("#score"),
    game = {
        event: "none",
        beforeActionId: "-1/-1",
        beforeActionEvent: "",
        actions: {
            name: [
                "tap",
                "swipe",
                "shake",
                "speak"
            ],
            type: [
                ["", "use 2 fingers", "use 3 fingers"],
                ["↑", "↓", "←", "→", "↖", "↗", "↙", "↘"],
                ["", "harder"],
                ["", "louder"]
            ],
            event: [
                ["touch", "touch2", "touch3"],
                [
                    "swipeUp", "swipeDown", "swipeLeft", "swipeRight",
                    "swipeUpLeft", "swipeUpRight", "swipeDownLeft", "swipeDownRight"
                ],
                ["shake", "shakeHarder"],
                ["speak", "speakLouder"]
            ]
        },
        actionCorrent: function (pre) {
            if (!game.started || game.beforeActionId == "-1/-1") return;
            var beforeActionId = game.beforeActionId.split("/"),
                name = beforeActionId[0],
                type = beforeActionId[1],
                nowActionsEvent = game.actions.event[name][type],
                gameEvent = game.event,
                result = game.beforeActionEvent == nowActionsEvent || gameEvent == nowActionsEvent;
            if (!result) {
                if (!pre) {
                    square.style.backgroundColor = "";
                    square.style.color = "";
                    square.style.color = "white";
                    square.style.backgroundColor = "black";
                    actionName.innerHTML = "again?";
                    actionName.style.lineHeight = "";
                    actionName.style.fontSize = "";
                    actionName.style.height = "";
                    actionType.innerHTML = "score:" + score.innerHTML;
                    score.innerHTML = "";
                    clearInterval(game.timerId);
                    game.started = false;
                } else
                    game.event = "none";
            } else if (gameEvent == nowActionsEvent) {
                game.beforeActionEvent = gameEvent;
                eventStatus.innerHTML =
                    game.actions.name[name] + " " + game.actions.type[name][type];
                square.style.color = "lightgray";
            }
            return result;
        },
        turn: {
            start: {},
            end: {}
        },
        touch: {},
        shake: {
            start: {},
            end: {},
            init: false
        },
        speak: {},
        start: function () {
            var actions = game.actions,
                beforeActionId = game.beforeActionId,
                name = 0, type = 0, actionId = "-1/-1";
            do {
                name = Math.floor(Math.random() * actions.name.length);
                type = Math.floor(Math.random() * actions.type[name].length);
                actionId = name + "/" + type;
            } while (beforeActionId == actionId);
            game.event = "none";
            game.beforeActionEvent = "none";
            game.beforeActionId = actionId;
            actionName.innerHTML = actions.name[name];
            actionType.innerHTML = actions.type[name][type];
            timeRemain.style.width = "";
            square.style.color = "";
            var timeRemainWidth = 99,
                timeRemainAnimateTimer = setInterval(function () {
                    timeRemain.style.width = timeRemainWidth + "%";
                    timeRemainWidth--;
                    if (timeRemain == 0)
                        clearInterval(timeRemainAnimateTimer);
                }, 20);
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
    game.actionCorrent(true);
});
window.addEventListener("deviceorientation", function (event) {
    if (location.hash != "#testmode") return;
    var turn = game.turn;
    turn.start.x = event.beta;
    turn.start.y = event.gamma;
    turn.start.z = event.alpha;
    if (turn.init) {
        turn.end.x = event.beta;
        turn.end.y = event.gamma;
        turn.end.z = event.alpha;
    }
    var degree = turn.end.z - turn.start.z;
    if (Math.abs(degree) > 180)
        degree = degree + Math.sign(degree) * 360;
    if (Math.abs(degree) > 10)
        actionName.innerHTML = degree < 0 ? "right" : "left";
    turn.end.x = event.beta;
    turn.end.y = event.gamma;
    turn.end.z = event.alpha;
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
        z: Math.abs(shakeVector.z)
    },
        shakeForceActually = shakeForce.x ** 2 + shakeForce.y ** 2 + shakeForce.z ** 2,
        isShake = shakeForceActually > 16,
        isShakeHarder = shakeForceActually > 64;
    if (shake.init) {
        game.event =
            isShakeHarder ?
                "shakeHarder"
                : isShake ?
                    "shake"
                    : game.event;
        game.actionCorrent(true);
    } else
        shake.init = true;
    shake.end.x = accel.x;
    shake.end.y = accel.y;
    shake.end.z = accel.z;
});
square.addEventListener("click", function () {
    if (game.started) return;
    game.started = true;
    actionName.innerHTML = "ready?";
    actionName.style.lineHeight = "50px";
    actionName.style.fontSize = "20px";
    actionName.style.height = "50px";
    actionType.innerHTML = "";
    square.style.backgroundColor = "";
    square.style.color = "";
    timeRemain.style.width = "";
    eventStatus.innerHTML = "";
    var count = 3,
        startGame = function () {
            game.timerId = setInterval(function () {
                var actionCorrent = game.actionCorrent();
                if (actionCorrent) {
                    score.innerHTML = score.innerHTML * 1 + 1;
                    game.start();
                }
            }, 2000);
            game.start();
        },
        timerId = setInterval(function () {
            if (count == 0) {
                clearTimeout(timerId);
                startGame();
            }
            score.innerHTML = count;
            count--;
        }, 1000);
});
timeRemain.style.width = "0%";
(function () {
    var size = 256;
    game.speak.audioContext = new AudioContext();
    game.speak.dataArray = new Uint8Array(size);
    navigator.getUserMedia({ audio: true }, function (stream) {
        var context = game.speak.audioContext;
        game.speak.microphone = context.createMediaStreamSource(stream);
        game.speak.analyser = context.createAnalyser();
        game.speak.microphone.connect(game.speak.analyser);
        game.speak.analyser.fftSize = size;
        for (var i = 0; i < size / 2; i++) {
            var div = document.createElement("div");
            div.style.width = window.innerWidth / (size / 2) + "px";
            sound.appendChild(div);
        }
        setInterval(function () {
            var normalCount = 0,
                louderCount = 0,
                sounds = document.querySelectorAll("#sound div");
            game.speak.analyser.getByteFrequencyData(game.speak.dataArray);
            for (var i = 0; i < game.speak.dataArray.length; i++) {
                if (i < game.speak.dataArray.length / 2)
                    sounds[i].style.height = game.speak.dataArray[i] + 1 + "px";
                normalCount += game.speak.dataArray[i] > 63 ? 1 : 0;
                louderCount += game.speak.dataArray[i] > 127 ? 1 : 0;
            }
            game.event =
                louderCount > 10 ?
                    "speakLouder"
                    : normalCount > 10 ?
                        "speak"
                        : game.event;
            game.actionCorrent(true);
        }, 60);
    }, function () {
        game.actions.name.pop();
    });
})();