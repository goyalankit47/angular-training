import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DetailComponent } from "./detail/detail.component";
import { RouterModule, Routes } from "@angular/router";
import { SharedModule } from "../shared/shared.module";

const routes: Routes = [
  {
    path: "",
    component: DetailComponent,
  },
];

@NgModule({
  declarations: [DetailComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule],
})
export class DetailModule {}
