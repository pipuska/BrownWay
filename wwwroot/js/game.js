const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - 60,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let ship;
let cursors;
let asteroids;
let timeLive = 0;
let score = 0;
let BestScore = 0; // Переменная для хранения последнего счета
let scoreText;
let BestScoreText;
let timeText;
let gameOver = false;
let target = { x: 400, y: 500 };
let restartButton; // Кнопка "Начать сначала"
let canCreateAsteroids = true; // Флаг для создания астероидов

function preload() {
    this.load.image('ship', 'assets/123123323.jpg');
    this.load.image('asteroid', 'assets/asteroid.png');
}

function create() {
    ship = this.physics.add.sprite(this.scale.width * 0.5, this.scale.height * 0.8, 'ship');
    ship.setCollideWorldBounds(true);

    this.input.on('pointermove', (pointer) => {
        target.x = pointer.x;
        target.y = pointer.y;
    });

    asteroids = this.physics.add.group();
    createAsteroid.call(this);

    // Текстовые объекты для отображения счета, времени и последнего счета
    scoreText = this.add.text(this.scale.width * 0.02, this.scale.height * 0.02, 'Score: 0', { fontSize: '14px', fill: '#fff' });
    timeText = this.add.text(this.scale.width * 0.02, this.scale.height * 0.06, 'Time: 0', { fontSize: '14px', fill: '#fff' });
    BestScoreText = this.add.text(this.scale.width * 0.02, this.scale.height * 0.10, 'Best Score: ' + BestScore, { fontSize: '14px', fill: '#fff' });

    this.physics.add.collider(ship, asteroids, hitAsteroid, null, this);

    this.scale.on('resize', resize, this);

    // Убедимся, что кнопка "Начать сначала" не существует
    if (restartButton) {
        restartButton.destroy();
    }

    // Запуск таймера
    this.time.addEvent({
        delay: 1000,
        callback: updateTime,
        callbackScope: this,
        loop: true
    });
}

function resize(gameSize, baseSize, displaySize, resolution) {
    const width = gameSize.width;
    const height = gameSize.height;

    ship.setPosition(width * 0.5, height * 0.8);
    scoreText.setPosition(width * 0.02, height * 0.02);
    timeText.setPosition(width * 0.02, height * 0.06);
    BestScoreText.setPosition(width * 0.02, height * 0.10);

    this.cameras.resize(width, height);
}

function createAsteroid() {
    if (!canCreateAsteroids) return; // Не создаем астероиды, если флаг false

    const x = Phaser.Math.Between(0, this.scale.width);
    const asteroid = asteroids.create(x, 0, 'asteroid');
    asteroid.setVelocityY(Phaser.Math.Between(100, 300));
    asteroid.setAngularVelocity(Phaser.Math.Between(-200, 200));
    asteroid.setCollideWorldBounds(true);
    asteroid.setBounce(1);

    this.time.delayedCall(1000, createAsteroid, [], this);
}

function update() {
    if (gameOver) return;

    this.physics.moveToObject(ship, target, 200);
}

function hitAsteroid(ship, asteroid) {
    if (gameOver) return;

    gameOver = true;
    this.physics.pause();
    ship.setTint(0xff0000);
    scoreText.setText('ВЪЕБИ ГОВНА, ДУРА! Счет: ' + score);
    canCreateAsteroids = false; // Останавливаем создание астероидов

    // Обновляем последний счет
    if (score >= BestScore) {
        BestScore = score;
        BestScoreText.setText('Last Score: ' + BestScore);
    }
    else BestScoreText.setText('Last Score: ' + score);
    // Создание кнопки "Начать сначала"
    restartButton = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Начать сначала', {
        fontSize: '24px',
        fill: '#fff',
        backgroundColor: '#000',
        padding: { x: 10, y: 5 }
    })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => {
            restartGame(this); // Перезапуск игры
        });
}

function restartGame(scene) {
    // Сброс состояния игры
    gameOver = false;
    score = 0;
    timeLive = 0;
    canCreateAsteroids = true; // Разрешаем создание астероидов

    // Удаление кнопки
    if (restartButton) {
        restartButton.destroy();
    }

    // Удаление всех астероидов
    asteroids.clear(true, true);

    // Перезапуск сцены
    scene.scene.restart();
}

function updateTime() {
    if (gameOver) return;

    timeLive += 1;
    timeText.setText('Time: ' + timeLive);

    score += 1;
    scoreText.setText('Score: ' + score);
}