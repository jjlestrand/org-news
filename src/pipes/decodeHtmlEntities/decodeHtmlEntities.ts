import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decodeHtmlEntities',
})
export class DecodeHtmlEntitiesPipe implements PipeTransform {
  transform(value: string, ) {
    let parsedValue = this.parseString(value);
    return parsedValue;
  }

  parseString(value: string){
    try {
      value =  value.replace(/&quot;/g, "\"");
      value =  value.replace(/&amp;/g, "&");
      value =  value.replace(/&gt;/g, "");
      value =  value.replace(/&lt;/g, "");
      value =  value.replace(/&nbsp;/g, " ");
      value =  value.replace(/&apos;/g, "\'");
      //value =  value.replace(/&copy;/g, "");
      //value =  value.replace(/&reg;/g, "");
      //value =  value.replace(/&euro;/g, "");
      //value =  value.replace(/&yen;/g, "");
      //value =  value.replace(/&pound;/g, "");
      //value =  value.replace(/&cent;/g, "");
    } catch {
      return value;  
    }
    return value;
  }
}
