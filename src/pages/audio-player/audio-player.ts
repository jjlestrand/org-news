import {Component, Input, Output, EventEmitter, NgZone} from '@angular/core';
import {NavParams, IonicPage, Platform} from 'ionic-angular';
import {PlayerService} from "../../services/player.service";
import {view} from "../../services/views.service";

class playerAttrs {
    ready: number = 0;
    isPlaying: boolean = false;
    duration: number = 0;
    current_duration: number = 0;
    last_duration: number = 0;
    status: number = 0;
}

@IonicPage()
@Component({
    selector: 'audio-player',
    templateUrl: 'audio-player.html'
})

export class AudioPlayerComponent {

    @Input() src: string = '';
    @Input() uuId: string = '';
    @Input() last_play_duration: number = 0;
    @Input() metaData: view;
    @Output() onReady = new EventEmitter();
    @Output() onPlay = new EventEmitter();
    @Output() onPause = new EventEmitter();
    @Output() onStop = new EventEmitter();
    @Output() durationChange = new EventEmitter();
    private player: playerAttrs = new playerAttrs();
    onStatusUpdate: any;
    onDurationChange: any;
    private durationModel = 0;
    private needsSeek = false;

    constructor(private navparams: NavParams,
                private _zone: NgZone,
                private platform: Platform,
                private playerService: PlayerService) {

    };

    ionViewWillEnter() {
        this.initPlayer();
    }

    initPlayer() {
        let playerData = this.playerService.getCurrentPlayerData();
        if (playerData && (playerData.trackId == this.uuId)) {

        }
    }

    subscriber() {

        if (!this.onStatusUpdate) {
            this.onStatusUpdate = this.playerService.onPlayerStatusChanged;
            this.onStatusUpdate.subscribe((res) => {
                if (res.trackId = this.uuId) {
                    this._zone.run(() => {
                        this.player.status = res.status;
                        this.player.isPlaying = res.status == 2;
                        if (this.player.isPlaying) {
                            setTimeout(() => {
                                this.player.duration = this.playerService.getTrackDuration();
                            }, 70);
                        }

                        if (res.status == 1) this.onReady.emit();
                        else if (res.status == 2) {
                            if (this.needsSeek) {
                                this.playerService.seek(this.last_play_duration);
                                this.needsSeek = false;
                            }
                            this.onPlay.emit();
                        }
                        else if (res.status == 3) this.onPause.emit();
                        else if (res.status == 4) {
                            this.onStop.emit();
                            this.durationModel = 0;
                            this.player.current_duration = 0;
                        }
                    });
                }
            });
        }

        if (!this.onDurationChange) {
            // duration subscriber
            this.onDurationChange = this.playerService.onPlayerDurationChanged;
            this.onDurationChange.subscribe((duration) => {
                this._zone.run(() => {
                    this.player.current_duration = duration;
                    this.durationModel = duration;
                });
                this.durationChange.emit(duration);
            });
        }
    }

    togglePlay() {
        if (this.platform.is('cordova')) {
            if (this.player.isPlaying) {
                this.pause();
            } else {
                this.play();
            }
        }
    }

    pause() {
        if (this.platform.is('cordova')) {
            this.playerService.pause();
        }
    }

    play() {
        if (this.platform.is('cordova')) {
            if (!this.src) {
                return;
            }
            // alert(this.player.status);
            if (this.player.status) {
                this.playerService.play();
            } else {
                this.playerService.initPlayer(this.src, this.uuId, this.metaData);
                let start_from_last_duration = false;
                if (this.last_play_duration) {
                    start_from_last_duration = confirm('You left off at ' + this.convertSeconds(this.last_play_duration) + '. Resume' +
                        ' player or' +
                        ' init');
                }
                this.playerService.play();
                if (start_from_last_duration) {
                    this.needsSeek = true;
                }
                this.subscriber();
            }
        }
    }

    stop() {
        this.unsubscribe();
    }

    fastForward() {
        this.playerService.fastForward();
    }

    rewind() {
        this.playerService.rewind();
    }

    unsubscribe() {
        this.onStatusUpdate.unsubscribe();
        this.onStatusUpdate = '';
        this.onDurationChange.unsubscribe();
        this.onDurationChange = '';
    }

    seek() {
        this.playerService.seek(this.durationModel);
    }

    convertSeconds(value) {
        const two_digit = (val) => {
            val = parseInt(val);
            if (val < 10) {
                return '0' + val;
            }
            return val;
        };

        value = parseInt(value);
        let hours = value / 3600;
        let minutes = (value % 3600) / 60;
        let seconds = value % 60;
        return two_digit(hours) + ':' + two_digit(minutes) + ':' + two_digit(seconds);
    }


}