import {NgModule} from "@angular/core";
import {AudioPlayerComponent} from "./audio-player";
import {CommonModule} from "@angular/common";
import {IonicPageModule} from "ionic-angular";
import {ArticlePage} from "../article/article";

@NgModule({
    declarations: [AudioPlayerComponent],
    imports: [ IonicPageModule.forChild(AudioPlayerComponent) ],
    exports: [AudioPlayerComponent]
})

export class AudioPlayerModule {  }