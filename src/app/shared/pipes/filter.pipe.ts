import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform(items: Array<any>, key: string, value: string): Array<any> {
    if (value) {
      items = items.filter((item) => item[key] === value);
    }
    return items;
  }
}
