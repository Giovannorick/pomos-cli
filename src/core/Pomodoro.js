import EventEmitter from "events";

export class Pomodoro extends EventEmitter {
  constructor(options = {}) {
    super();
    this.workDuration = (options.workDuration || 25) * 60; // in seconds
    this.breakDuration = (options.breakDuration || 5) * 60;
    this.longBreakDuration = (options.longBreakDuration || 15) * 60;
    this.cyclesBeforeLongBreak = options.cyclesBeforeLongBreak || 4;

    this.state = "IDLE"; // IDLE, WORK, BREAK, LONG_BREAK
    this.timeLeft = 0;
    this.cyclesCompleted = 0;
    this.timer = null;
    this.totalDuration = 0;
  }

  updateOptions(options = {}) {
    if (options.workDuration) this.workDuration = options.workDuration * 60;
    if (options.breakDuration) this.breakDuration = options.breakDuration * 60;
    if (options.longBreakDuration)
      this.longBreakDuration = options.longBreakDuration * 60;
    if (options.cyclesBeforeLongBreak)
      this.cyclesBeforeLongBreak = options.cyclesBeforeLongBreak;
  }

  startWork(duration) {
    this.state = "WORK";
    this.timeLeft = duration || this.workDuration;
    this.totalDuration = this.timeLeft;
    this.startTimer();
  }

  startBreak(duration, isLongBreak = false) {
    if (duration) {
      this.state = isLongBreak ? "LONG_BREAK" : "BREAK";
      this.timeLeft = duration;
      this.totalDuration = duration;
      this.startTimer();
      return;
    }

    const _isLong =
      this.cyclesCompleted % this.cyclesBeforeLongBreak === 0 &&
      this.cyclesCompleted > 0;
    this.state = _isLong ? "LONG_BREAK" : "BREAK";
    this.timeLeft = _isLong ? this.longBreakDuration : this.breakDuration;
    this.totalDuration = this.timeLeft;
    this.startTimer();
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);

    // If resuming from PAUSED, restore the previous state (WORK or BREAK)
    if (this.state === "PAUSED") {
      this.state = this.previousState || "WORK";
    }

    this.emit("tick", {
      timeLeft: this.timeLeft,
      state: this.state,
      totalDuration: this.totalDuration,
    });

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.emit("tick", {
        timeLeft: this.timeLeft,
        state: this.state,
        totalDuration: this.totalDuration,
      });

      if (this.timeLeft <= 0) {
        this.completePhase();
      }
    }, 1000);
  }

  completePhase() {
    clearInterval(this.timer);
    this.timer = null;
    if (this.state === "WORK") {
      this.cyclesCompleted++;
    }
    this.emit("completed", { state: this.state, cycles: this.cyclesCompleted });
  }

  pause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.previousState = this.state;
      this.state = "PAUSED";
      this.emit("tick", { timeLeft: this.timeLeft, state: this.state });
    }
  }

  toggle() {
    if (this.state === "PAUSED" || !this.timer) {
      this.startTimer();
    } else {
      this.pause();
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state = "IDLE";
    this.emit("tick", { timeLeft: 0, state: this.state });
  }
}
