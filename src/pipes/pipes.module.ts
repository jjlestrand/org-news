import { NgModule } from '@angular/core';
import { DecodeHtmlEntitiesPipe } from './decodeHtmlEntities/decodeHtmlEntities';
@NgModule({
	declarations: [DecodeHtmlEntitiesPipe],
	imports: [],
	exports: [DecodeHtmlEntitiesPipe]
})
export class PipesModule {}
