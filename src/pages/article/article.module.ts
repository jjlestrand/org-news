import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ArticlePage } from './article';
import {PipesModule} from "../../pipes/pipes.module";
import {AudioPlayerModule} from "../audio-player/audio-player.module";

@NgModule({
  declarations: [
    ArticlePage,
  ],
  imports: [
    IonicPageModule.forChild(ArticlePage),
      AudioPlayerModule,
      PipesModule
  ],
})
export class ArticlePageModule {
 
}
