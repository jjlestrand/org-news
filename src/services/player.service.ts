import {Injectable} from "@angular/core";
import {MusicControls} from '@ionic-native/music-controls';
import {Media, MediaObject} from '@ionic-native/media';
import {Subject} from "rxjs/Subject";
import {view} from "./views.service";
import {Environment} from "../environment/environment";
import {Subscription} from "rxjs/Subscription";

export class MusicPlayer {
    trackId: string = '';
    src: string = '';
    isPlaying: boolean = false;
    playerStatus: number = 0;
    trackDuration: number = 0;
    currentDuration: number = 0;
}

@Injectable()
export class PlayerService {

    private playerStatusObserver = new Subject<{ trackId: string, status: number }>();
    onPlayerStatusChanged = this.playerStatusObserver.asObservable();

    private playerDurationObserver = new Subject<any>();
    onPlayerDurationChanged = this.playerDurationObserver.asObservable();

    playerStatusSubscriber: Subscription;

    private musicPlayer: MusicPlayer;
    private nativePlayer: MediaObject;
    private metaData: view;
    private domain = Environment.DOMAIN;


    constructor(private musicControls: MusicControls,
                private media: Media) {
        // media.create()
        // this.musicPlayer = new MusicPlayer();
        this.subscribers();
    }

    private subscribers() {
        // this.onPlayerStatusChanged.subscribe((status) => {
        //     this.musicPlayer.playerStatus = status.status;
        // });
    }

    initPlayer(mediaSource, uniqueIdentification, metaData?: view) {
        this.metaData = metaData;
        if (uniqueIdentification) {
            if (this.musicPlayer && this.musicPlayer.isPlaying) {
                this.stop();
            }
            this.musicPlayer = new MusicPlayer();
            this.nativePlayer = this.media.create(mediaSource);
            this.musicPlayer.src = mediaSource;
            this.musicPlayer.trackId = uniqueIdentification;
        } else {
            throw "Please give unique Identification";
        }
    }

    play() {
        if (this.musicPlayer && this.musicPlayer.src) {
            if (this.musicPlayer.playerStatus) {
                this.nativePlayer.play();
            } else {
                this.nativePlayer.play();
                this.initMusicControls();
                let playerDurationInterval;
                this.playerStatusSubscriber = this.nativePlayer.onStatusUpdate.subscribe((status) => {
                    this.musicPlayer.isPlaying = status == 2;
                    this.musicControls.updateIsPlaying(this.musicPlayer.isPlaying);
                    this.musicPlayer.playerStatus = status;
                    if (status == 2) {
                        setTimeout(() => {
                            this.setTrackDuration();
                        }, 50);
                        playerDurationInterval = setInterval(async () => {
                            let pos = await this.nativePlayer.getCurrentPosition();
                            this.musicPlayer.currentDuration = pos;
                            this.playerDurationObserver.next(pos);
                        }, 100);
                    }
                    if (status == 4) {
                        this.musicControls.destroy();
                        clearInterval(playerDurationInterval);
                        this.stop();
                    }
                    this.playerStatusObserver.next({trackId: this.musicPlayer.trackId, status: status});
                });
            }
        }
        else {
            throw "Player Not Initialized";
        }
    }

    seek(duration) {
        let durationMS = (duration * 1000) || 1;
        this.nativePlayer.seekTo(durationMS);

        if (duration >= this.musicPlayer.trackDuration) {
            stop();
        }
    }

    pause() {
        this.nativePlayer.pause();
    }

    stop() {
        if (this.nativePlayer) {
            this.nativePlayer.stop();
            this.nativePlayer.release();
        }
        this.resetPlayer();
        setTimeout(() => {
            this.unsubscribe();
        }, 7);
    }

    unsubscribe() {
        try {
            this.playerStatusSubscriber.unsubscribe();
        } catch (e) {
        }
    }

    setVolume(volume) {
        this.nativePlayer.setVolume(volume);
    }

    fastForward(ffDuration = 10) {
        let seekDuration =
            (this.musicPlayer.currentDuration + ffDuration) >= this.musicPlayer.trackDuration
                ? this.musicPlayer.trackDuration : (this.musicPlayer.currentDuration + ffDuration);
        this.seek(seekDuration);
    }

    rewind(rewindDuration = 10) {
        let seekDuration =
            (this.musicPlayer.currentDuration - rewindDuration) <= 0
                ? 0 : (this.musicPlayer.currentDuration - rewindDuration);
        this.seek(seekDuration);
    }

    getCurrentPlayerData() {
        return this.musicPlayer ?
            {
                ...this.musicPlayer,
                duration: this.getTrackDuration()
            } : false;
    }

    private resetPlayer() {
        // this.musicPlayer = new MusicPlayer();
        this.musicPlayer.playerStatus = 0;
        this.musicPlayer.isPlaying = false;
        this.musicPlayer.currentDuration = 0;
        this.destroyMusicControl();
    }

    private setTrackDuration() {
        this.musicPlayer.trackDuration = this.getTrackDuration();
    }

    getTrackDuration() {
        return this.nativePlayer.getDuration();
    }

    initMusicControls() {
        this.musicControls.create({
            track: this.metaData.title,
            artist: this.metaData.field_study_series,
            cover: this.domain + this.metaData.field_photo,
            isPlaying: false,
            // hide previous/next/close buttons:
            hasPrev: false,      // show previous button, optional, default: true
            hasNext: false,      // show next button, optional, default: true
            hasClose: true,       // show close button, optional, default: false
            hasSkipBackward: false,
            hasSkipForward: false,

            // iOS only, optional
            // album: 'Absolution',     // optional, default: ''
            // duration: 60, // optional, default: 0
            // elapsed: 10, // optional, default: 0
            // hasSkipForward: true,  // show skip forward button, optional, default: false
            // hasSkipBackward: true, // show skip backward button, optional, default: false
            // skipForwardInterval: 15, // display number for skip forward, optional, default: 0
            // skipBackwardInterval: 15, // display number for skip backward, optional, default: 0
            hasScrubbing: false, // enable scrubbing from control center and lockscreen progress bar, optional

            // Android only, optional
            // text displayed in the status bar when the notification (and the ticker) are updated, optional
            ticker: this.metaData.title,
            // All icons default to their built-in android equivale nts
            // The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
            playIcon: 'media_play',
            pauseIcon: 'media_pause',
            // prevIcon: 'media_prev',
            // nextIcon: 'media_next',
            closeIcon: 'media_close',
            notificationIcon: 'notification'
        });

        this.musicControls.subscribe().subscribe(action => {
            const message = JSON.parse(action).message;
            switch (message) {
                case 'music-controls-pause':
                    this.pause();
                    break;
                case 'music-controls-play':
                    if (this.musicPlayer.playerStatus == 3) {
                        this.play();
                    } else return;
                    break;
                case 'music-controls-destroy':
                    this.stop();
                    break;

                // External controls (iOS only)
                case 'music-controls-seek-to':
                    const seekToInSeconds = JSON.parse(action).position;
                    this.musicControls.updateElapsed({
                        elapsed: seekToInSeconds,
                        isPlaying: true
                    });
                    break;

                // Headset events (Android only)
                // All media button events are listed below
                case 'music-controls-headset-unplugged':
                    this.pause();
                    break;
                case 'music-controls-headset-plugged':
                    this.pause();
                    break;
                default:
                    break;
            }

        });

        this.musicControls.listen(); // activates the observable above
        this.musicControls.updateIsPlaying(true);

    }

    destroyMusicControl() {
        this.musicControls.destroy();
    }

    private generateUUID(length = 16) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
}
