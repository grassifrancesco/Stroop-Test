class Player {
  constructor() {
    this.correctAnswers = 0;
    this.wrongAnswers = 0;
    this.iniziato = false;
    this.finito = false;
    this.responseTimes = [];
    this.questionCount = 0;
  }
}

module.exports = Player;
